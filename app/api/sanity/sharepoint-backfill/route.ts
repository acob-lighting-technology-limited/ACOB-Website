import { NextRequest, NextResponse } from 'next/server';
import {
  backupSanityDocumentAssets,
  isSharePointBackupEnabled,
  listBackfillCandidates,
} from '@/lib/sharepoint/sanity-backup';
import { authorizeWebhookRequest } from '@/lib/utils/webhook-auth';
import { rateLimit } from '@/lib/utils/rate-limit';

type SupportedDocumentType = 'project' | 'product' | 'updatePost';

const SUPPORTED_TYPES: SupportedDocumentType[] = [
  'project',
  'product',
  'updatePost',
];

/**
 * Shared gate for both handlers: rate limit first, then webhook auth that
 * fails closed when no secret is configured.
 */
function rejectUnauthorized(request: NextRequest): NextResponse | null {
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

  return null;
}

function parseTypes(value: string | null): SupportedDocumentType[] {
  if (!value) {
    return SUPPORTED_TYPES;
  }

  const parsed = value
    .split(',')
    .map(item => item.trim())
    .filter((item): item is SupportedDocumentType =>
      SUPPORTED_TYPES.includes(item as SupportedDocumentType),
    );

  return parsed.length > 0 ? parsed : SUPPORTED_TYPES;
}

function parseLimit(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function getLabel(doc: {
  slug?: { current?: string };
  general?: { title?: string };
  title?: string;
  _id: string;
}) {
  return doc.slug?.current || doc.general?.title || doc.title || doc._id;
}

async function resolveTargets(request: NextRequest) {
  const types = parseTypes(request.nextUrl.searchParams.get('type'));
  const limit = parseLimit(request.nextUrl.searchParams.get('limit'));
  const force = request.nextUrl.searchParams.get('force') === 'true';
  const dryRun = request.nextUrl.searchParams.get('dryRun') === 'true';

  const documents = await listBackfillCandidates(types);
  const filtered = documents.filter(doc => {
    if (force) {
      return true;
    }
    return doc.sharepointBackup?.status !== 'synced';
  });

  const targets = limit ? filtered.slice(0, limit) : filtered;

  return {
    dryRun,
    force,
    limit,
    types,
    total: documents.length,
    selected: targets,
  };
}

export async function GET(request: NextRequest) {
  const rejection = rejectUnauthorized(request);
  if (rejection) {
    return rejection;
  }

  const targetInfo = await resolveTargets(request);

  return NextResponse.json({
    ok: true,
    enabled: isSharePointBackupEnabled(),
    dryRun: true,
    force: targetInfo.force,
    types: targetInfo.types,
    total: targetInfo.total,
    selected: targetInfo.selected.length,
    targets: targetInfo.selected.map(doc => ({
      id: doc._id,
      type: doc._type,
      label: getLabel(doc),
      status: doc.sharepointBackup?.status || 'unknown',
      folderPath: doc.sharepointBackup?.folderPath || null,
    })),
  });
}

export async function POST(request: NextRequest) {
  const rejection = rejectUnauthorized(request);
  if (rejection) {
    return rejection;
  }

  const targetInfo = await resolveTargets(request);

  if (targetInfo.dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      total: targetInfo.total,
      selected: targetInfo.selected.length,
      types: targetInfo.types,
    });
  }

  const results: Array<{
    id: string;
    type: SupportedDocumentType;
    label: string;
    success: boolean;
    folderPath?: string;
    uploadedCount?: number;
    error?: string;
  }> = [];

  let successCount = 0;
  let failureCount = 0;

  for (const doc of targetInfo.selected) {
    try {
      const result = await backupSanityDocumentAssets(doc._id);
      successCount += 1;
      results.push({
        id: doc._id,
        type: doc._type,
        label: getLabel(doc),
        success: true,
        folderPath: result.folderPath,
        uploadedCount: result.uploadedCount,
      });
    } catch (error) {
      failureCount += 1;
      results.push({
        id: doc._id,
        type: doc._type,
        label: getLabel(doc),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return NextResponse.json({
    ok: failureCount === 0,
    total: targetInfo.total,
    selected: targetInfo.selected.length,
    successCount,
    failureCount,
    types: targetInfo.types,
    results,
  });
}
