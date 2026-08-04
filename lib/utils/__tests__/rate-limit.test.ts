import { NextRequest } from 'next/server';
import { rateLimit, getClientIdentifier } from '../rate-limit';

function makeRequest(headers: Record<string, string>): NextRequest {
  return new NextRequest('http://localhost/api/test', { headers });
}

describe('getClientIdentifier', () => {
  it('prefers x-real-ip when present', () => {
    const request = makeRequest({
      'x-real-ip': '1.2.3.4',
      'x-forwarded-for': '9.9.9.9, 8.8.8.8',
    });
    expect(getClientIdentifier(request)).toBe('1.2.3.4');
  });

  it('falls back to the first x-forwarded-for entry', () => {
    const request = makeRequest({
      'x-forwarded-for': '1.2.3.4, 5.6.7.8',
    });
    expect(getClientIdentifier(request)).toBe('1.2.3.4');
  });

  it('does not let extra x-forwarded-for entries mint a new identity', () => {
    const first = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    const second = makeRequest({ 'x-forwarded-for': '1.2.3.4, spoofed-hop' });
    expect(getClientIdentifier(first)).toBe(getClientIdentifier(second));
  });

  it('returns "anonymous" when no identifying header is present', () => {
    expect(getClientIdentifier(makeRequest({}))).toBe('anonymous');
  });
});

describe('rateLimit', () => {
  it('allows requests within the configured limit', () => {
    const config = { interval: 60_000, uniqueTokenPerInterval: 2 };
    const request = makeRequest({ 'x-real-ip': '10.0.0.1' });

    expect(rateLimit(request, config)).toBe(false);
    expect(rateLimit(request, config)).toBe(false);
  });

  it('blocks requests once the limit is exceeded', () => {
    const config = { interval: 60_000, uniqueTokenPerInterval: 1 };
    const request = makeRequest({ 'x-real-ip': '10.0.0.2' });

    expect(rateLimit(request, config)).toBe(false);
    expect(rateLimit(request, config)).toBe(true);
  });

  it('tracks separate identifiers independently', () => {
    const config = { interval: 60_000, uniqueTokenPerInterval: 1 };
    const requestA = makeRequest({ 'x-real-ip': '10.0.0.3' });
    const requestB = makeRequest({ 'x-real-ip': '10.0.0.4' });

    expect(rateLimit(requestA, config)).toBe(false);
    expect(rateLimit(requestB, config)).toBe(false);
    expect(rateLimit(requestA, config)).toBe(true);
  });
});
