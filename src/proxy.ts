import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/env";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-config";
import { ADMIN_REQUEST_HEADER } from "@/lib/admin-request-header";

function devAdminSession(request: NextRequest): boolean {
  return request.cookies.get(ADMIN_SESSION_COOKIE)?.value === "1";
}

function isCustomerGatePath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/checkout")
  );
}

/**
 * Rebuild NextResponse.next so request headers (e.g. admin flag) are visible
 * to route handlers, while preserving cookies set during session refresh.
 */
function nextWithRequestHeaders(
  requestHeaders: Headers,
  sessionResponse: NextResponse,
): NextResponse {
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  sessionResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-jj-pathname", pathname);
  // Always overwrite, never trust a client-supplied admin flag.
  requestHeaders.set(ADMIN_REQUEST_HEADER, "0");

  if (!isSupabaseConfigured()) {
    const isDevAdmin = devAdminSession(request);
    if (isDevAdmin) {
      requestHeaders.set(ADMIN_REQUEST_HEADER, "1");
    }

    if (pathname.startsWith("/admin")) {
      if (pathname.startsWith("/admin/login")) {
        if (isDevAdmin) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
        return NextResponse.next({ request: { headers: requestHeaders } });
      }

      if (!isDevAdmin) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const { supabase, user, supabaseResponse } = await updateSession(
    request,
    requestHeaders,
  );

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? null;
  }

  if (role === "admin") {
    requestHeaders.set(ADMIN_REQUEST_HEADER, "1");
  }

  const response = nextWithRequestHeaders(requestHeaders, supabaseResponse);
  response.headers.set("x-jj-pathname", pathname);

  // Admins may browse the catalogue but not customer auth surfaces.
  // Send them back to cart with a clear notice (not a silent /admin dump).
  if (role === "admin" && isCustomerGatePath(pathname)) {
    const noticeUrl = new URL("/cart", request.url);
    noticeUrl.searchParams.set("notice", "admin_customer_required");
    return NextResponse.redirect(noticeUrl);
  }

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login")) {
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return response;
    }

    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== "admin") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }
  }

  // Checkout / account require a customer session
  if (pathname.startsWith("/checkout") || pathname.startsWith("/account")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "customer") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // api/cart does its own session lookup; skipping it saves two auth round-trips per add.
    "/((?!_next/static|_next/image|favicon.ico|images/|brand/|api/webhooks|api/cart).*)",
  ],
};
