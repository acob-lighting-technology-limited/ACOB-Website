import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { client } from '../sanity/lib/config';
import { backupSanityDocumentAssets } from '../lib/sharepoint/sanity-backup';

type SupportedDocumentType = 'project' | 'product' | 'updatePost';

interface BackfillDocumentRow {
  _id: string;
  _type: SupportedDocumentType;
  title?: string;
  slug?: { current?: string };
  sharepointBackup?: {
    status?: string;
  };
}

const SUPPORTED_TYPES: SupportedDocumentType[] = [
  'project',
  'product',
  'updatePost',
];

const LIST_QUERY = `
  *[_type in $types]{
    _id,
    _type,
    title,
    slug,
    general,
    sharepointBackup
  } | order(_type asc, _createdAt asc)
`;

function parseArgs() {
  const args = process.argv.slice(2);
  const has = (flag: string) => args.includes(flag);
  const getValue = (flag: string) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };

  const typeArg = getValue('--type');
  const types = typeArg
    ? typeArg
        .split(',')
        .map(value => value.trim())
        .filter((value): value is SupportedDocumentType =>
          SUPPORTED_TYPES.includes(value as SupportedDocumentType),
        )
    : SUPPORTED_TYPES;

  return {
    dryRun: has('--dry-run'),
    force: has('--force'),
    limit: Number.parseInt(getValue('--limit') || '', 10) || undefined,
    types,
  };
}

function getLabel(doc: BackfillDocumentRow): string {
  return doc.slug?.current || doc.title || doc._id;
}

async function main() {
  const options = parseArgs();

  const documents = await client.fetch<BackfillDocumentRow[]>(LIST_QUERY, {
    types: options.types,
  });

  const filtered = documents.filter(doc => {
    if (options.force) {
      return true;
    }
    return doc.sharepointBackup?.status !== 'synced';
  });

  const targets = options.limit ? filtered.slice(0, options.limit) : filtered;

  console.log(
    `Found ${documents.length} documents, ${targets.length} selected for backfill (${options.types.join(', ')}).`,
  );

  if (options.dryRun) {
    for (const doc of targets) {
      console.log(`[dry-run] ${doc._type}: ${getLabel(doc)} (${doc._id})`);
    }
    return;
  }

  let successCount = 0;
  let failureCount = 0;

  for (const doc of targets) {
    try {
      const result = await backupSanityDocumentAssets(doc._id);
      successCount += 1;
      console.log(
        `[synced] ${doc._type}: ${getLabel(doc)} -> ${result.folderPath} (${result.uploadedCount} files)`,
      );
    } catch (error) {
      failureCount += 1;
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[failed] ${doc._type}: ${getLabel(doc)} -> ${message}`);
    }
  }

  console.log(
    `Backfill complete. Success: ${successCount}. Failed: ${failureCount}.`,
  );

  if (failureCount > 0) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
