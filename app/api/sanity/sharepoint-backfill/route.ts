import { NextRequest, NextResponse } from 'next/server';
import {
  backupSanityDocumentAssets,
  isSharePointBackupEnabled,
  listBackfillCandidates,
} from '@/lib/sharepoint/sanity-backup';

type SupportedDocumentType = 'project' | 'product' | 'updatePost';

const SUPPORTED_TYPES: SupportedDocumentType[] = [
  'project',
  'product',
  'updatePost',
];

function getSecret(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim();
  }

  return request.nextUrl.searchParams.get('secret');
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
  const configuredSecret = process.env.SANITY_WEBHOOK_SECRET?.trim();
  const providedSecret = getSecret(request);

  if (configuredSecret && providedSecret !== configuredSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
  const configuredSecret = process.env.SANITY_WEBHOOK_SECRET?.trim();
  const providedSecret = getSecret(request);

  if (configuredSecret && providedSecret !== configuredSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
