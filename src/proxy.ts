import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/env";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-config";

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-jj-pathname", pathname);

  if (!isSupabaseConfigured()) {
    if (pathname.startsWith("/admin")) {
      if (pathname.startsWith("/admin/login")) {
        if (devAdminSession(request)) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
        return NextResponse.next({ request: { headers: requestHeaders } });
      }

      if (!devAdminSession(request)) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const { supabase, user, supabaseResponse } = await updateSession(request);

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? null;
  }

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
      supabaseResponse.headers.set("x-jj-pathname", pathname);
      return supabaseResponse;
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

  supabaseResponse.headers.set("x-jj-pathname", pathname);
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|brand/|api/webhooks).*)"],
};
