interface AzureTokenResponse {
  access_token: string;
  expires_in: number;
}

interface OneDriveDrive {
  id: string;
  name: string;
}

interface OneDriveDriveResponse {
  value: OneDriveDrive[];
}

interface OneDriveItem {
  id: string;
  name: string;
}

export interface OneDriveUploadResult {
  id: string;
  name: string;
  webUrl: string;
  size: number;
}

interface OneDriveConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  siteId: string;
  siteHostname: string;
  sitePath: string;
  driveId: string;
  driveName: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;
let cachedResolvedSiteId: string | null = null;
const cachedDriveBaseUrls = new Map<string, string>();

function normalizeGraphPath(path: string): string {
  const normalized = `/${path || ''}`.replace(/\/+/g, '/');
  return normalized.length > 1 && normalized.endsWith('/')
    ? normalized.slice(0, -1)
    : normalized;
}

function buildChildrenEndpoint(relativePath: string): string {
  const normalizedRelativePath = normalizeGraphPath(relativePath);
  if (normalizedRelativePath === '/') {
    return '/root/children';
  }

  const encodedPath = encodeURIComponent(
    normalizedRelativePath.replace(/^\//, ''),
  );
  return `/root:/${encodedPath}:/children`;
}

function buildItemEndpoint(relativePath: string, suffix = ''): string {
  const normalizedRelativePath = normalizeGraphPath(relativePath);
  const encodedPath = encodeURIComponent(
    normalizedRelativePath.replace(/^\//, ''),
  );
  return `/root:/${encodedPath}${suffix}`;
}

export class OneDriveService {
  private config: OneDriveConfig;

  constructor() {
    this.config = {
      tenantId: process.env.AZURE_TENANT_ID || '',
      clientId: process.env.AZURE_CLIENT_ID || '',
      clientSecret: process.env.AZURE_CLIENT_SECRET || '',
      siteId: process.env.ONEDRIVE_SITE_ID || '',
      siteHostname: process.env.ONEDRIVE_SITE_HOSTNAME || '',
      sitePath: process.env.ONEDRIVE_SITE_PATH || '',
      driveId: process.env.ONEDRIVE_DRIVE_ID || '',
      driveName: process.env.ONEDRIVE_DRIVE_NAME || '',
    };
  }

  isEnabled(): boolean {
    const hasSiteTarget =
      !!this.config.driveId ||
      !!this.config.siteId ||
      (!!this.config.siteHostname && !!this.config.sitePath);

    return (
      process.env.ONEDRIVE_ENABLED === 'true' &&
      !!this.config.tenantId &&
      !!this.config.clientId &&
      !!this.config.clientSecret &&
      hasSiteTarget
    );
  }

  private async getAccessToken(): Promise<string> {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
      return cachedToken.token;
    }

    const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${await response.text()}`);
    }

    const data = (await response.json()) as AzureTokenResponse;
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    return data.access_token;
  }

  private async graphApiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await this.getAccessToken();
    const response = await fetch(
      `https://graph.microsoft.com/v1.0${endpoint}`,
      {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Graph API error (${response.status}): ${await response.text()}`,
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  private async driveRequest<T>(
    baseUrl: string,
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await this.getAccessToken();
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Graph API error (${response.status}): ${await response.text()}`,
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  private async resolveSiteId(): Promise<string> {
    if (this.config.siteId) {
      return this.config.siteId;
    }

    if (cachedResolvedSiteId) {
      return cachedResolvedSiteId;
    }

    if (!this.config.siteHostname || !this.config.sitePath) {
      throw new Error('OneDrive site configuration is incomplete');
    }

    const normalizedSitePath = normalizeGraphPath(this.config.sitePath);
    const response = await this.graphApiRequest<{ id: string }>(
      `/sites/${this.config.siteHostname}:${normalizedSitePath}`,
    );

    cachedResolvedSiteId = response.id;
    return response.id;
  }

  private async resolveSingleDriveBaseUrl(): Promise<string> {
    if (cachedDriveBaseUrls.has('__single__')) {
      return cachedDriveBaseUrls.get('__single__')!;
    }

    let baseUrl = '';

    if (this.config.driveId) {
      baseUrl = `https://graph.microsoft.com/v1.0/drives/${this.config.driveId}`;
    } else {
      const siteId = await this.resolveSiteId();
      const drives = await this.graphApiRequest<OneDriveDriveResponse>(
        `/sites/${siteId}/drives`,
      );

      const matchingDrive =
        (this.config.driveName
          ? drives.value.find(
              drive =>
                drive.name.toLowerCase() ===
                this.config.driveName.toLowerCase(),
            )
          : undefined) ||
        drives.value.find(drive => drive.name.toLowerCase() === 'documents');

      if (!matchingDrive) {
        throw new Error(
          'No matching document library was found. Set ONEDRIVE_DRIVE_NAME or ONEDRIVE_DRIVE_ID.',
        );
      }

      baseUrl = `https://graph.microsoft.com/v1.0/drives/${matchingDrive.id}`;
    }

    cachedDriveBaseUrls.set('__single__', baseUrl);
    return baseUrl;
  }

  async createFolder(folderPath: string): Promise<void> {
    const baseUrl = await this.resolveSingleDriveBaseUrl();
    const normalizedPath = normalizeGraphPath(folderPath);
    const pathParts = normalizedPath
      .replace(/^\//, '')
      .split('/')
      .filter(Boolean);
    let currentPath = '';

    for (const part of pathParts) {
      try {
        await this.driveRequest<OneDriveItem>(
          baseUrl,
          buildChildrenEndpoint(currentPath || '/'),
          {
            method: 'POST',
            body: JSON.stringify({
              name: part,
              folder: {},
              '@microsoft.graph.conflictBehavior': 'replace',
            }),
          },
        );
      } catch (error) {
        if (
          !(error instanceof Error) ||
          !error.message.includes('nameAlreadyExists')
        ) {
          throw error;
        }
      }

      currentPath = currentPath ? `${currentPath}/${part}` : part;
    }
  }

  async uploadFile(
    filePath: string,
    content: Uint8Array | ArrayBuffer,
    mimeType?: string,
  ): Promise<OneDriveUploadResult> {
    const baseUrl = await this.resolveSingleDriveBaseUrl();
    const normalizedPath = normalizeGraphPath(filePath);
    const token = await this.getAccessToken();

    const response = await fetch(
      `${baseUrl}${buildItemEndpoint(normalizedPath, ':/content')}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': mimeType || 'application/octet-stream',
        },
        body: new Blob([
          content instanceof ArrayBuffer
            ? content
            : content.slice(
                content.byteOffset,
                content.byteOffset + content.byteLength,
              ),
        ]),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${await response.text()}`);
    }

    return response.json() as Promise<OneDriveUploadResult>;
  }
}




