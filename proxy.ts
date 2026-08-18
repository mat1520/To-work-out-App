import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

const SUPABASE_URL = 'https://nyuvxwnbkqbebkdvxkpl.supabase.co';

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self' ${SUPABASE_URL} wss://${SUPABASE_URL.replace('https://', '')}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const sessionResponse = await updateSession(request);

  const isRedirect = sessionResponse.status >= 300 && sessionResponse.status < 400;

  const response = isRedirect
    ? sessionResponse
    : NextResponse.next({ request: { headers: requestHeaders } });

  if (!isRedirect) {
    sessionResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  }

  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|exercises|.*\\.gif).*)'],
};