import { client, writeClient } from '@/sanity/lib/config';
import { OneDriveService } from '@/lib/sharepoint/onedrive';

type SupportedDocumentType = 'project' | 'product' | 'updatePost';
type BackupStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface SanityAssetRef {
  _id?: string;
  url?: string;
  originalFilename?: string;
  mimeType?: string;
}

interface SanityMediaItem {
  _type?: string;
  alt?: string;
  title?: string;
  asset?: SanityAssetRef;
}

interface SanityDocumentForBackup {
  _id: string;
  _type: SupportedDocumentType;
  _createdAt?: string;
  title?: string;
  slug?: {
    current?: string;
  };
  general?: {
    title?: string;
  };
  projectDate?: string;
  publishedAt?: string;
  projectImage?: SanityMediaItem;
  featuredImage?: SanityMediaItem;
  content?: SanityMediaItem[];
  projectContent?: {
    images?: SanityMediaItem[];
  };
  sharepointBackup?: {
    folderPath?: string;
  };
  media?: {
    productImage?: SanityMediaItem;
    productImages?: SanityMediaItem[];
    datasheet?: SanityMediaItem;
  };
}

interface BackupAsset {
  assetId: string;
  url: string;
  fileName: string;
  mimeType?: string;
  targetPath: string;
}

export interface BackupResult {
  documentId: string;
  documentType: SupportedDocumentType;
  slug: string;
  folderPath: string;
  uploadedCount: number;
  uploadedFiles: string[];
}

export interface BackfillDocumentRow {
  _id: string;
  _type: SupportedDocumentType;
  _createdAt?: string;
  title?: string;
  slug?: { current?: string };
  general?: { title?: string };
  projectDate?: string;
  publishedAt?: string;
  sharepointBackup?: {
    status?: string;
    folderPath?: string;
  };
}

const SHAREPOINT_ROOT_FOLDER =
  process.env.SHAREPOINT_WEBSITE_ROOT_FOLDER || '/Website';

const DOCUMENT_TYPE_FOLDER: Record<SupportedDocumentType, string> = {
  project: 'project',
  product: 'product',
  updatePost: 'update',
};

const BACKFILL_LIST_QUERY = `
  *[_type in $types]{
    _id,
    _type,
    _createdAt,
    title,
    slug,
    general,
    projectDate,
    publishedAt,
    sharepointBackup
  } | order(_type asc, _createdAt asc)
`;

const DOCUMENT_QUERY = `
  *[_id == $id][0]{
    _id,
    _type,
    _createdAt,
    title,
    slug,
    general,
    projectDate,
    publishedAt,
    projectImage{
      alt,
      asset->{
        _id,
        url,
        originalFilename,
        mimeType
      }
    },
    featuredImage{
      alt,
      asset->{
        _id,
        url,
        originalFilename,
        mimeType
      }
    },
    content[]{
      _type,
      alt,
      title,
      asset->{
        _id,
        url,
        originalFilename,
        mimeType
      }
    },
    projectContent{
      images[]{
        _type,
        alt,
        title,
        asset->{
          _id,
          url,
          originalFilename,
          mimeType
        }
      }
    },
    sharepointBackup{
      folderPath
    },
    media{
      productImage{
        alt,
        asset->{
          _id,
          url,
          originalFilename,
          mimeType
        }
      },
      productImages[]{
        _type,
        alt,
        title,
        asset->{
          _id,
          url,
          originalFilename,
          mimeType
        }
      },
      datasheet{
        title,
        asset->{
          _id,
          url,
          originalFilename,
          mimeType
        }
      }
    }
  }
`;

function normalizePath(path: string): string {
  const normalized = `/${path || ''}`.replace(/\/+/g, '/');
  return normalized.length > 1 && normalized.endsWith('/')
    ? normalized.slice(0, -1)
    : normalized;
}

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getDocumentSlug(document: SanityDocumentForBackup): string {
  const rawValue =
    document.slug?.current ||
    document.general?.title ||
    document.title ||
    document._id;

  const sanitized = sanitizeSegment(rawValue);
  return sanitized || sanitizeSegment(document._id);
}

function parseIsoDate(value?: string): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getPreferredDocumentDate(
  document: SanityDocumentForBackup,
): Date | null {
  if (document._type === 'project') {
    return (
      parseIsoDate(document.projectDate) || parseIsoDate(document._createdAt)
    );
  }

  if (document._type === 'updatePost') {
    return (
      parseIsoDate(document.publishedAt) || parseIsoDate(document._createdAt)
    );
  }

  return parseIsoDate(document._createdAt);
}

function getDateSuffix(document: SanityDocumentForBackup): string {
  const explicitDate =
    document._type === 'project'
      ? parseIsoDate(document.projectDate)
      : document._type === 'updatePost'
        ? parseIsoDate(document.publishedAt)
        : null;

  if (!explicitDate) {
    return '';
  }

  const day = String(explicitDate.getUTCDate()).padStart(2, '0');
  const month = String(explicitDate.getUTCMonth() + 1).padStart(2, '0');
  const year = explicitDate.getUTCFullYear();
  return `-${day}-${month}-${year}`;
}

function buildDocumentFolderPath(document: SanityDocumentForBackup): {
  slug: string;
  folderPath: string;
} {
  const slug = getDocumentSlug(document);
  const year = String(
    (getPreferredDocumentDate(document) || new Date()).getUTCFullYear(),
  );
  const datedFolderName = `${slug}${getDateSuffix(document)}`;

  return {
    slug,
    folderPath: normalizePath(
      `${SHAREPOINT_ROOT_FOLDER}/${DOCUMENT_TYPE_FOLDER[document._type]}/${year}/${datedFolderName}`,
    ),
  };
}

function getFileExtension(asset: SanityAssetRef): string {
  const filename = asset.originalFilename || '';
  const filenameMatch = filename.match(/(\.[a-z0-9]+)$/i);
  if (filenameMatch) {
    return filenameMatch[1].toLowerCase();
  }

  try {
    const urlPath = new URL(asset.url || '').pathname;
    const urlMatch = urlPath.match(/(\.[a-z0-9]+)$/i);
    return urlMatch ? urlMatch[1].toLowerCase() : '';
  } catch {
    return '';
  }
}

function addAsset(
  assets: Map<string, BackupAsset>,
  asset: SanityAssetRef | undefined,
  folderPath: string,
  baseName: string,
  fallbackExtension = '',
): void {
  if (!asset?._id || !asset.url) {
    return;
  }

  const extension = getFileExtension(asset) || fallbackExtension;
  const fileName = `${baseName}${extension}`;

  assets.set(asset._id, {
    assetId: asset._id,
    url: asset.url,
    fileName,
    mimeType: asset.mimeType,
    targetPath: normalizePath(`${folderPath}/${fileName}`),
  });
}

function collectAssets(
  document: SanityDocumentForBackup,
  folderPath: string,
): BackupAsset[] {
  const assets = new Map<string, BackupAsset>();

  if (document._type === 'project') {
    addAsset(assets, document.projectImage?.asset, folderPath, 'main-image');

    let contentImageIndex = 0;
    for (const item of document.content || []) {
      if (item._type !== 'image') {
        continue;
      }

      contentImageIndex += 1;
      addAsset(
        assets,
        item.asset,
        folderPath,
        `content-image-${contentImageIndex}`,
      );
    }

    let galleryImageIndex = 0;
    let galleryVideoIndex = 0;
    for (const item of document.projectContent?.images || []) {
      if (item._type === 'image') {
        galleryImageIndex += 1;
        addAsset(
          assets,
          item.asset,
          folderPath,
          `gallery-image-${galleryImageIndex}`,
        );
      }

      if (item._type === 'video') {
        galleryVideoIndex += 1;
        addAsset(
          assets,
          item.asset,
          folderPath,
          `gallery-video-${galleryVideoIndex}`,
          '.mp4',
        );
      }
    }
  }

  if (document._type === 'updatePost') {
    addAsset(
      assets,
      document.featuredImage?.asset,
      folderPath,
      'featured-image',
    );

    let imageIndex = 0;
    let videoIndex = 0;
    for (const item of document.content || []) {
      if (item._type === 'image') {
        imageIndex += 1;
        addAsset(assets, item.asset, folderPath, `content-image-${imageIndex}`);
      }

      if (item._type === 'video') {
        videoIndex += 1;
        addAsset(assets, item.asset, folderPath, `video-${videoIndex}`, '.mp4');
      }
    }
  }

  if (document._type === 'product') {
    addAsset(
      assets,
      document.media?.productImage?.asset,
      folderPath,
      'main-image',
    );

    let galleryImageIndex = 0;
    let galleryVideoIndex = 0;
    for (const item of document.media?.productImages || []) {
      if (item._type === 'image') {
        galleryImageIndex += 1;
        addAsset(
          assets,
          item.asset,
          folderPath,
          `gallery-image-${galleryImageIndex}`,
        );
      }

      if (item._type === 'video') {
        galleryVideoIndex += 1;
        addAsset(
          assets,
          item.asset,
          folderPath,
          `gallery-video-${galleryVideoIndex}`,
          '.mp4',
        );
      }
    }

    addAsset(
      assets,
      document.media?.datasheet?.asset,
      folderPath,
      'datasheet',
      '.pdf',
    );
  }

  return [...assets.values()];
}

async function downloadAsset(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download Sanity asset: ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

async function patchBackupStatus(
  documentId: string,
  status: BackupStatus,
  values: Partial<{
    folderPath: string;
    assetCount: number;
    lastError: string;
  }> = {},
): Promise<void> {
  try {
    await writeClient
      .patch(documentId)
      .set({
        sharepointBackup: {
          status,
          lastSyncedAt: new Date().toISOString(),
          folderPath: values.folderPath,
          assetCount: values.assetCount,
          lastError: values.lastError,
        },
      })
      .commit();
  } catch (error) {
    console.error('Failed to patch SharePoint backup status in Sanity:', error);
  }
}

async function fetchDocumentForBackup(
  documentId: string,
): Promise<SanityDocumentForBackup | null> {
  return client.fetch<SanityDocumentForBackup | null>(DOCUMENT_QUERY, {
    id: documentId,
  });
}

export function isSharePointBackupEnabled(): boolean {
  return new OneDriveService().isEnabled();
}

export async function listBackfillCandidates(
  types: SupportedDocumentType[],
): Promise<BackfillDocumentRow[]> {
  return client.fetch<BackfillDocumentRow[]>(BACKFILL_LIST_QUERY, {
    types,
  });
}

export async function backupSanityDocumentAssets(
  documentId: string,
): Promise<BackupResult> {
  const onedrive = new OneDriveService();
  if (!onedrive.isEnabled()) {
    throw new Error('OneDrive/SharePoint integration is not enabled');
  }

  const document = await fetchDocumentForBackup(documentId);
  if (!document) {
    throw new Error(`Sanity document not found for id: ${documentId}`);
  }

  if (!['project', 'product', 'updatePost'].includes(document._type)) {
    throw new Error(`Unsupported document type for backup: ${document._type}`);
  }

  const { slug, folderPath } = buildDocumentFolderPath(document);
  const previousFolderPath = normalizePath(
    document.sharepointBackup?.folderPath || '',
  );
  const shouldMoveExistingFolder =
    !!document.sharepointBackup?.folderPath &&
    previousFolderPath !== folderPath;

  await patchBackupStatus(document._id, 'syncing', { folderPath });

  try {
    if (shouldMoveExistingFolder) {
      const moved = await onedrive.moveFolder(previousFolderPath, folderPath);
      if (!moved) {
        console.warn(
          `SharePoint folder move skipped for ${document._id}: ${previousFolderPath} -> ${folderPath}`,
        );
      }
    }

    const assets = collectAssets(document, folderPath);
    await onedrive.createFolder(folderPath);

    for (const asset of assets) {
      const content = await downloadAsset(asset.url);
      await onedrive.uploadFile(asset.targetPath, content, asset.mimeType);
    }

    await patchBackupStatus(document._id, 'synced', {
      folderPath,
      assetCount: assets.length,
      lastError: '',
    });

    return {
      documentId: document._id,
      documentType: document._type,
      slug,
      folderPath,
      uploadedCount: assets.length,
      uploadedFiles: assets.map(asset => asset.fileName),
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown SharePoint backup error';

    await patchBackupStatus(document._id, 'error', {
      folderPath,
      lastError: message,
    });

    throw error;
  }
}
