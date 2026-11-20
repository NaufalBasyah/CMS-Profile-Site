import { NextResponse, type NextRequest } from "next/server";

/**
 * Quick gate for the admin panel: no session cookie, no admin pages.
 * Every admin page and server action still verifies the session itself
 * (lib/auth/session.ts), so this is only the first line of defence.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!request.cookies.has("cms_session")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
