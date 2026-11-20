import type { Metadata } from "next";
import { Suspense } from "react";
import { Brand } from "@/components/site/brand";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

// Signed-in, per-request page: allowed to block instead of streaming a placeholder.
export const instant = false;

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-mist px-4 py-16">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
        <Brand />
        <h1 className="mt-6 text-3xl">Sign in to the admin panel</h1>
        <Suspense>
          <LoginFormWithNext searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginFormWithNext({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const sp = await searchParams;
  return <LoginForm next={typeof sp.next === "string" ? sp.next : "/admin"} />;
}
