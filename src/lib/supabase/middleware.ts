import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey } from "@/lib/env";

export async function updateSession(
  request: NextRequest,
  requestHeaders?: Headers,
) {
  const headers = requestHeaders ?? request.headers;
  let supabaseResponse = NextResponse.next({ request: { headers } });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          const cookie = request.cookies
            .getAll()
            .map((item) => `${item.name}=${item.value}`)
            .join("; ");
          if (cookie) headers.set("cookie", cookie);
          supabaseResponse = NextResponse.next({ request: { headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user, supabaseResponse };
}
