import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/account'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const hasSession =
    Boolean(request.cookies.get('auth-session')?.value) ||
    Boolean(request.cookies.get('auth-token')?.value);

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For API requests where the user has a session, validate backend response.
  // Avoid infinite middleware recursion by using a guard header.
  const isApi = pathname.startsWith('/api');
  const guardHeader = 'x-middleware-checked';

  if (isApi && hasSession && request.headers.get(guardHeader) !== '1') {
    try {
      const fetchReq = new Request(request.url, {
        method: request.method,
        headers: new Headers(request.headers),
        body: request.body,
        redirect: 'manual',
        // Preserve credentials if needed
      });
      fetchReq.headers.set(guardHeader, '1');

      const res = await fetch(fetchReq);

      if (res.status === 401 || res.status === 403) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Return the original response for API consumer
      return res;
    } catch (err) {
      // If fetching the API fails while user has a session, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};