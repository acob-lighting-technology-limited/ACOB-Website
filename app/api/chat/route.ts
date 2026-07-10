import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { rateLimit } from '@/lib/utils/rate-limit';
import {
  createErrorResponse,
  ApiErrorCode,
  handleApiError,
} from '@/lib/utils/api-error-handler';
import { RATE_LIMITS } from '@/lib/constants/ui';
import type { Project, Product } from '@/lib/types';
import {
  detectIntent,
  shouldFetchSanityData,
} from '@/lib/utils/chat-intent-detection';
import {
  formatProjectsContext,
  formatUpdatesContext,
  formatProductsContext,
  formatJobsContext,
  createContextMessage,
} from '@/lib/utils/chat-context-formatter';
import { searchContent } from '@/lib/utils/chat-content-search';
import { getCached } from '@/lib/utils/chat-data-cache';
import { logAcobotWebsiteTurn } from '@/lib/utils/acobot-erp-log';
import {
  getProjects,
  getUpdatePosts,
  getProducts,
  getJobPostings,
} from '@/sanity/lib/client';

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const isRateLimited = rateLimit(req, {
    interval: RATE_LIMITS.CHAT_API.interval,
    uniqueTokenPerInterval: RATE_LIMITS.CHAT_API.maxRequests,
  });

  if (isRateLimited) {
    return NextResponse.json(
      {
        error: {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
      },
      {
        status: 429,
        headers: { 'Retry-After': '60' },
      },
    );
  }

  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return createErrorResponse(
        ApiErrorCode.INTERNAL_SERVER_ERROR,
        'AI service configuration is missing',
        500,
      );
    }

    const body = await req.json();
    const messages = body.messages;

    if (!Array.isArray(messages)) {
      return createErrorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Invalid messages format: must be an array',
        400,
      );
    }

    if (messages.length === 0) {
      return createErrorResponse(
        ApiErrorCode.BAD_REQUEST,
        'Messages array cannot be empty',
        400,
      );
    }

    // Caps guard against runaway token costs on the upstream model.
    const MAX_MESSAGES = 30;
    const MAX_CONTENT_LENGTH = 4000;

    if (messages.length > MAX_MESSAGES) {
      return createErrorResponse(
        ApiErrorCode.BAD_REQUEST,
        `Too many messages: maximum is ${MAX_MESSAGES}`,
        400,
      );
    }

    // Validate messages. Only user/assistant roles are accepted — the system
    // channel is reserved for server-injected context.
    const ALLOWED_ROLES = ['user', 'assistant'] as const;
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      if (!msg.role || !msg.content) {
        return createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          `Invalid message at index ${i}: must have 'role' and 'content'`,
          400,
        );
      }

      if (
        typeof msg.content !== 'string' ||
        !ALLOWED_ROLES.includes(msg.role)
      ) {
        return createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          `Invalid message at index ${i}: role must be 'user' or 'assistant' and content must be a string`,
          400,
        );
      }

      if (msg.content.length > MAX_CONTENT_LENGTH) {
        return createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          `Message at index ${i} exceeds the ${MAX_CONTENT_LENGTH}-character limit`,
          400,
        );
      }
    }

    // Clean messages to remove unsupported properties
    const cleanMessages = messages.map(
      (msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }),
    );

    // === DYNAMIC CONTEXT INJECTION ===
    // Detect intent from the last user message
    const lastUserMessage = cleanMessages.filter(m => m.role === 'user').pop();
    let hadContext = false;

    if (lastUserMessage) {
      const intent = detectIntent(lastUserMessage.content);

      // Fetch and inject Sanity data if needed
      if (shouldFetchSanityData(intent)) {
        let contextData = '';

        try {
          switch (intent.type) {
            case 'projects': {
              const allProjects = await getCached('projects', getProjects);

              // Filter projects based on detected filters
              let filteredProjects = allProjects;

              if (intent.filters?.state) {
                filteredProjects = filteredProjects.filter(
                  (p: Project) =>
                    p.state?.toLowerCase() ===
                    intent.filters!.state!.toLowerCase(),
                );
              }

              if (intent.filters?.category) {
                filteredProjects = filteredProjects.filter((p: Project) =>
                  p.category
                    ?.toLowerCase()
                    .includes(intent.filters!.category!.toLowerCase()),
                );
              }

              // Filter by search term (for specific project names)
              if (intent.filters?.search) {
                const searchTerms = intent.filters.search
                  .toLowerCase()
                  .split(',')
                  .map(s => s.trim());
                filteredProjects = filteredProjects.filter((p: Project) =>
                  searchTerms.some(
                    term =>
                      p.title?.toLowerCase().includes(term) ||
                      p.location?.toLowerCase().includes(term),
                  ),
                );
              }

              contextData = formatProjectsContext(filteredProjects);
              break;
            }

            case 'updates': {
              const updates = await getCached('updates', getUpdatePosts);
              contextData = formatUpdatesContext(updates);
              break;
            }

            case 'products': {
              const products = await getCached('products', getProducts);

              // Filter products if category detected
              let filteredProducts = products;
              if (intent.filters?.category) {
                filteredProducts = filteredProducts.filter((p: Product) =>
                  p.category
                    ?.toLowerCase()
                    .includes(intent.filters!.category!.toLowerCase()),
                );
              }

              contextData = formatProductsContext(filteredProducts);
              break;
            }

            case 'jobs': {
              const jobs = await getCached('jobs', getJobPostings);
              contextData = formatJobsContext(jobs);
              break;
            }
          }

          // Inject context into messages if data was found
          if (contextData) {
            cleanMessages.push(createContextMessage(contextData));
            hadContext = true;
          }
        } catch (sanityError) {
          // Log error but continue with chat (graceful degradation)
          if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching Sanity data for chat:', sanityError);
          }
          // Don't fail the entire request if Sanity fetch fails
        }
      } else {
        // === GENERAL / UNCLASSIFIED QUERY FALLBACK ===
        // Keyword-based intent detection couldn't classify this query (e.g. it
        // asks about a named event, partnership, or topic with no matching
        // keyword). Search across ALL content for relevant items, and if
        // nothing matches, fall back to the latest updates so the bot can still
        // answer "what's new" style questions.
        try {
          const [updates, projects, products, jobs] = await Promise.all([
            getCached('updates', getUpdatePosts),
            getCached('projects', getProjects),
            getCached('products', getProducts),
            getCached('jobs', getJobPostings),
          ]);

          const matches = searchContent(lastUserMessage.content, {
            updates,
            projects,
            products,
            jobs,
          });

          const sections: string[] = [];

          if (matches.topScore > 0) {
            if (matches.updates.length) {
              sections.push(formatUpdatesContext(matches.updates));
            }
            if (matches.projects.length) {
              sections.push(formatProjectsContext(matches.projects));
            }
            if (matches.products.length) {
              sections.push(formatProductsContext(matches.products));
            }
            if (matches.jobs.length) {
              sections.push(formatJobsContext(matches.jobs));
            }
          }

          // Baseline: no specific match → give the bot the latest updates so it
          // has recent, accurate context instead of guessing.
          const contextData = sections.length
            ? sections.join('\n\n')
            : formatUpdatesContext(updates);

          if (contextData) {
            cleanMessages.push(createContextMessage(contextData));
            hadContext = true;
          }
        } catch (sanityError) {
          if (process.env.NODE_ENV === 'development') {
            console.error(
              'Error fetching Sanity data for general query:',
              sanityError,
            );
          }
          // Graceful degradation: continue without injected context
        }
      }
    }
    // === END DYNAMIC CONTEXT INJECTION ===

    // Use Vercel AI SDK with Groq (streaming for useChat compatibility)
    const MODEL_ID = 'openai/gpt-oss-120b';
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    const userAgent = req.headers.get('user-agent');

    const result = await streamText({
      model: groq(MODEL_ID),
      messages: cleanMessages,
      maxTokens: 1000,
      temperature: 0.7,
      onFinish: async ({ text }) => {
        if (!lastUserMessage) {
          return;
        }
        // Best-effort: mirror this turn into the ERP's acobot_logs (source=website).
        await logAcobotWebsiteTurn({
          question: lastUserMessage.content,
          answer: text,
          hadContext,
          model: MODEL_ID,
          ipAddress,
          userAgent,
        });
      },
    });

    return result.toDataStreamResponse();
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
