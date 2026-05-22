import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOGIN_PATH = '/login';
const DASHBOARD_PATH = '/dashboard';
const SESSION_MARKER_COOKIE = 'auth-session';

/** Routes that require an authenticated session (set via auth-session cookie). */
const PROTECTED_PREFIXES = [DASHBOARD_PATH, '/account', '/sites'];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isLoginPath(pathname: string): boolean {
  return pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`);
}

function isAuthenticated(request: NextRequest): boolean {
  return Boolean(request.cookies.get(SESSION_MARKER_COOKIE)?.value);
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = isAuthenticated(request);

  if (isProtectedPath(pathname) && !authenticated) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPath(pathname) && authenticated) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/account',
    '/account/:path*',
    '/sites',
    '/sites/:path*',
    '/login',
    '/login/:path*',
  ],
};
