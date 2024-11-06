import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest): Promise<NextResponse> {
  let res: NextResponse;

  res = NextResponse.next({ headers: req.headers });

  return res;
}

export const config = { matcher: ['/auth/:path*', '/dashboard/:path*'] };
