import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware just ensures the locale cookie is set
export function middleware(request: NextRequest) {
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';

  // Let the request through - no redirects needed with localePrefix: 'never'
  const response = NextResponse.next();

  // Ensure cookie is set for future requests
  if (!request.cookies.has('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 31536000 });
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
