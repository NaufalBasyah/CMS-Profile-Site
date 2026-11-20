import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "cms_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function key(): Uint8Array {
  const secret = process.env.SECRET_KEY;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("Set SECRET_KEY to a long random value before running in production.");
  }
  return new TextEncoder().encode(secret || "dev-only-secret-change-me-dev-only-secret");
}

export async function createSession(username: string) {
  const token = await new SignJWT({ sub: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The signed-in admin's username, or null. Verifies the signature every time. */
export async function currentUser(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Use at the top of every admin page and server action. */
export async function requireUser(next = "/admin"): Promise<string> {
  const user = await currentUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  return user;
}
