export async function register() {
  // Only validate in the Node.js server runtime — not the Edge runtime or browser.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/lib/env');
    validateEnv();
  }
}
