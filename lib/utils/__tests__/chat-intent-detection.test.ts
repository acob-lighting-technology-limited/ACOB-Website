import { detectIntent, shouldFetchSanityData } from '../chat-intent-detection';

describe('detectIntent', () => {
  it('detects a projects intent', () => {
    const intent = detectIntent('Tell me about your mini-grid projects');
    expect(intent.type).toBe('projects');
    expect(intent.confidence).toBeGreaterThan(0.7);
  });

  it('extracts a state filter from a projects query', () => {
    const intent = detectIntent('What projects have you done in Lagos?');
    expect(intent.type).toBe('projects');
    expect(intent.filters?.state).toBe('Lagos');
  });

  it('extracts a category filter from a projects query', () => {
    const intent = detectIntent('Show me your street light projects');
    expect(intent.type).toBe('projects');
    expect(intent.filters?.category).toBe('Street Lighting');
  });

  it('detects an updates intent', () => {
    const intent = detectIntent('What is the latest news from ACOB?');
    expect(intent.type).toBe('updates');
  });

  it('detects a products intent', () => {
    const intent = detectIntent('How much does a solar panel cost?');
    expect(intent.type).toBe('products');
    expect(intent.filters?.category).toBe('Solar Panels');
  });

  it('detects a jobs intent', () => {
    const intent = detectIntent('Are there any job vacancies right now?');
    expect(intent.type).toBe('jobs');
  });

  it('falls back to general for unmatched queries', () => {
    const intent = detectIntent('What is the capital of Nigeria?');
    expect(intent.type).toBe('general');
    expect(intent.confidence).toBeLessThanOrEqual(0.7);
  });
});

describe('shouldFetchSanityData', () => {
  it('is true for high-confidence non-general intents', () => {
    expect(shouldFetchSanityData({ type: 'projects', confidence: 0.9 })).toBe(
      true,
    );
  });

  it('is false for general intent regardless of confidence', () => {
    expect(shouldFetchSanityData({ type: 'general', confidence: 0.9 })).toBe(
      false,
    );
  });

  it('is false for low-confidence non-general intents', () => {
    expect(shouldFetchSanityData({ type: 'jobs', confidence: 0.5 })).toBe(
      false,
    );
  });
});
