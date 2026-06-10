import { type NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  // Inject the current pathname as a reliable header for the root layout
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
