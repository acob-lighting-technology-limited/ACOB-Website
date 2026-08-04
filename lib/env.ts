import { z } from 'zod';

// Required in every environment — the app cannot render without Sanity config.
const requiredEnvSchema = z.object({
  NEXT_PUBLIC_SANITY_PROJECT_ID: z
    .string()
    .min(1, 'Sanity project ID is required'),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1, 'Sanity dataset is required'),
});

// Feature keys — missing values degrade the corresponding feature gracefully
// (see the call sites in app/api/*), so these only warn, never throw.
const OPTIONAL_ENV_KEYS = [
  'SANITY_API_TOKEN',
  'RESEND_API_KEY',
  'GROQ_API_KEY',
  'SANITY_WEBHOOK_SECRET',
] as const;

/**
 * Validate required and optional environment variables. Throws if a
 * required variable is missing; logs a warning for missing optional ones.
 * Call this once at server startup (see instrumentation.ts).
 */
export function validateEnv(): void {
  const required = requiredEnvSchema.safeParse({
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  });

  if (!required.success) {
    const message = required.error.errors
      .map(err => `${err.path.join('.')}: ${err.message}`)
      .join('\n');
    throw new Error(`Missing required environment variables:\n${message}`);
  }

  for (const key of OPTIONAL_ENV_KEYS) {
    if (!process.env[key]?.trim()) {
      console.warn(
        `[env] ${key} is not set — the corresponding feature will be disabled.`,
      );
    }
  }
}
