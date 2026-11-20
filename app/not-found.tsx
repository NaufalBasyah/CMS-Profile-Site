import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Brand } from "@/components/site/brand";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <Brand />
      <h1 className="text-5xl sm:text-6xl">Page not found</h1>
      <p className="max-w-md text-muted-foreground">The page you were looking for has moved or no longer exists.</p>
      <Link href="/" className={cn(buttonVariants(), "no-underline")}>Back to the home page</Link>
    </main>
  );
}
