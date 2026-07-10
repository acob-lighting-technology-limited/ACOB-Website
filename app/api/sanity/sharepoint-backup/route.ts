import { NextRequest, NextResponse } from 'next/server';
import {
  backupSanityDocumentAssets,
  isSharePointBackupEnabled,
} from '@/lib/sharepoint/sanity-backup';
import { authorizeWebhookRequest } from '@/lib/utils/webhook-auth';
import { rateLimit } from '@/lib/utils/rate-limit';

function getDocumentId(payload: Record<string, unknown>): string | null {
  const ids =
    payload.ids && typeof payload.ids === 'object'
      ? (payload.ids as Record<string, unknown>)
      : undefined;

  const candidates = [
    payload._id,
    payload.documentId,
    payload.id,
    ids?.published,
    ids?.created,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  return null;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    enabled: isSharePointBackupEnabled(),
  });
}

export async function POST(request: NextRequest) {
  if (rateLimit(request)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  const auth = authorizeWebhookRequest(request);
  if (auth === 'unconfigured') {
    return NextResponse.json(
      { error: 'Webhook secret is not configured on this environment' },
      { status: 503 },
    );
  }
  if (auth === 'unauthorized') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const documentId = getDocumentId(payload);
  if (!documentId) {
    return NextResponse.json(
      {
        error:
          'Missing document identifier. Expected _id, documentId, id, or ids.published.',
      },
      { status: 400 },
    );
  }

  try {
    const result = await backupSanityDocumentAssets(documentId);
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('SharePoint backup failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        documentId,
      },
      { status: 500 },
    );
  }
}
