import { NextRequest } from 'next/server';
import {
  authorizeWebhookRequest,
  getProvidedWebhookSecret,
  secretsMatch,
} from '../webhook-auth';

function makeRequest(headers: Record<string, string>): NextRequest {
  return new NextRequest('http://localhost/api/webhook', { headers });
}

describe('getProvidedWebhookSecret', () => {
  it('reads a Bearer token from the Authorization header', () => {
    const request = makeRequest({ authorization: 'Bearer my-secret' });
    expect(getProvidedWebhookSecret(request)).toBe('my-secret');
  });

  it('falls back to the x-sanity-webhook-secret header', () => {
    const request = makeRequest({ 'x-sanity-webhook-secret': 'my-secret' });
    expect(getProvidedWebhookSecret(request)).toBe('my-secret');
  });

  it('returns null when no secret is provided', () => {
    expect(getProvidedWebhookSecret(makeRequest({}))).toBeNull();
  });
});

describe('secretsMatch', () => {
  it('returns true for identical secrets', () => {
    expect(secretsMatch('abc123', 'abc123')).toBe(true);
  });

  it('returns false for different secrets of the same length', () => {
    expect(secretsMatch('abc123', 'xyz123')).toBe(false);
  });

  it('returns false for secrets of different lengths', () => {
    expect(secretsMatch('short', 'a-much-longer-secret')).toBe(false);
  });
});

describe('authorizeWebhookRequest', () => {
  const originalEnv = process.env.SANITY_WEBHOOK_SECRET;

  afterEach(() => {
    process.env.SANITY_WEBHOOK_SECRET = originalEnv;
  });

  it('fails closed as "unconfigured" when no secret is set on the server', () => {
    delete process.env.SANITY_WEBHOOK_SECRET;
    const request = makeRequest({ authorization: 'Bearer anything' });
    expect(authorizeWebhookRequest(request)).toBe('unconfigured');
  });

  it('fails closed as "unconfigured" even with a matching-looking header', () => {
    process.env.SANITY_WEBHOOK_SECRET = '';
    const request = makeRequest({ authorization: 'Bearer ' });
    expect(authorizeWebhookRequest(request)).toBe('unconfigured');
  });

  it('returns "unauthorized" when the provided secret does not match', () => {
    process.env.SANITY_WEBHOOK_SECRET = 'correct-secret';
    const request = makeRequest({ authorization: 'Bearer wrong-secret' });
    expect(authorizeWebhookRequest(request)).toBe('unauthorized');
  });

  it('returns "unauthorized" when no secret is provided at all', () => {
    process.env.SANITY_WEBHOOK_SECRET = 'correct-secret';
    expect(authorizeWebhookRequest(makeRequest({}))).toBe('unauthorized');
  });

  it('returns "authorized" when the provided secret matches', () => {
    process.env.SANITY_WEBHOOK_SECRET = 'correct-secret';
    const request = makeRequest({ authorization: 'Bearer correct-secret' });
    expect(authorizeWebhookRequest(request)).toBe('authorized');
  });
});
