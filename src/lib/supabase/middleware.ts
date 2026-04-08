import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/signup" ||
    request.nextUrl.pathname === "/forgot";
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth/");
  const isReset = request.nextUrl.pathname === "/reset";

  if (!user && !isAuthPage && !isAuthCallback && !isReset) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Preserve the original destination (path + query) so the user lands there
    // after sign-in. This is what makes the Finder → Tracker handoff work for
    // unauthenticated users — the prefill query string survives the auth detour.
    url.search = "";
    url.searchParams.set(
      "next",
      request.nextUrl.pathname + request.nextUrl.search
    );
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get("next");
    url.pathname = next && next.startsWith("/") ? next.split("?")[0] : "/";
    url.search = next && next.includes("?") ? next.slice(next.indexOf("?")) : "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
