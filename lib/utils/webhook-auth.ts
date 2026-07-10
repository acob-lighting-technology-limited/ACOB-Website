import { timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

export type WebhookAuthResult = 'authorized' | 'unauthorized' | 'unconfigured';

/**
 * Extract the webhook secret from request headers.
 * Query-string secrets are deliberately not supported — URLs end up in
 * access logs and browser history, which would leak the secret.
 */
export function getProvidedWebhookSecret(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim();
  }

  return request.headers.get('x-sanity-webhook-secret');
}

/**
 * Constant-time comparison of two secrets. Length differences short-circuit,
 * but never based on matching prefix contents.
 */
export function secretsMatch(provided: string, configured: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const configuredBuffer = Buffer.from(configured);
  if (providedBuffer.length !== configuredBuffer.length) {
    return false;
  }
  return timingSafeEqual(providedBuffer, configuredBuffer);
}

/**
 * Authorize a webhook request against SANITY_WEBHOOK_SECRET.
 *
 * Fails closed: when the secret is not configured on the server, the result
 * is 'unconfigured' and the caller must reject the request (503), never
 * process it.
 */
export function authorizeWebhookRequest(
  request: NextRequest,
): WebhookAuthResult {
  const configuredSecret = process.env.SANITY_WEBHOOK_SECRET?.trim();
  if (!configuredSecret) {
    return 'unconfigured';
  }

  const providedSecret = getProvidedWebhookSecret(request);
  if (!providedSecret || !secretsMatch(providedSecret, configuredSecret)) {
    return 'unauthorized';
  }

  return 'authorized';
}
