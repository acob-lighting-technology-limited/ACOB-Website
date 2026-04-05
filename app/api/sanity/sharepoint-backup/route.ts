import { NextRequest, NextResponse } from 'next/server';
import {
  backupSanityDocumentAssets,
  isSharePointBackupEnabled,
} from '@/lib/sharepoint/sanity-backup';

function getWebhookSecret(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim();
  }

  return (
    request.headers.get('x-sanity-webhook-secret') ||
    request.nextUrl.searchParams.get('secret')
  );
}

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
  const configuredSecret = process.env.SANITY_WEBHOOK_SECRET?.trim();
  const providedSecret = getWebhookSecret(request);

  if (configuredSecret && providedSecret !== configuredSecret) {
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
