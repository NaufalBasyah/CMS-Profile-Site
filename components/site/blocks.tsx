import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** The site's one main action. Keep this wording everywhere. */
export const MAIN_ACTION = { href: "/partnership", label: "Send an inquiry" };

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

export function Section({
  className,
  tone = "plain",
  children,
  id,
  labelledBy,
}: {
  className?: string;
  tone?: "plain" | "mist";
  children: ReactNode;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("py-16 sm:py-20 lg:py-24", tone === "mist" && "bg-mist", className)}
    >
      <Container>{children}</Container>
    </section>
  );
}

/** A plain text link that stands on its own line: underlined, 44px tall for fingers. */
export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-indigo-deep hover:decoration-current",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SectionHead({
  title,
  id,
  children,
  action,
}: {
  title: string;
  id?: string;
  children?: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
      <div className="max-w-2xl">
        <h2 id={id} className="text-4xl sm:text-5xl">
          {title}
        </h2>
        {children && <div className="mt-4 text-lg text-muted-foreground">{children}</div>}
      </div>
      {action && <TextLink href={action.href} className="shrink-0">{action.label}</TextLink>}
    </div>
  );
}

export function PageHero({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="border-b bg-mist">
      <Container className="py-12 sm:py-20">
        <h1 className="max-w-4xl text-5xl sm:text-6xl lg:text-7xl">{title}</h1>
        {children && <div className="mt-6 max-w-3xl text-lg leading-relaxed sm:text-xl">{children}</div>}
      </Container>
    </section>
  );
}

export function Cta() {
  return (
    <section className="bg-primary text-white">
      <Container className="flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl text-white sm:text-4xl">Samples, data sheets and supply quotes</h2>
          <p className="mt-2 max-w-xl text-white/85">
            Tell us the grade and volume you need. Our sales team in Medan replies within two working days.
          </p>
        </div>
        <Link
          href={MAIN_ACTION.href}
          className={cn(buttonVariants({ variant: "light", size: "lg" }), "w-full no-underline sm:w-auto")}
        >
          {MAIN_ACTION.label}
        </Link>
      </Container>
    </section>
  );
}

/** Placeholder shown for a split second while a page's content streams in. */
export function PageFallback() {
  return (
    <div aria-busy="true" className="animate-pulse">
      <div className="h-72 border-b bg-mist" />
      <Container className="space-y-4 py-16">
        <div className="h-8 w-1/3 rounded bg-mist" />
        <div className="h-4 w-2/3 rounded bg-mist" />
        <div className="h-4 w-1/2 rounded bg-mist" />
      </Container>
    </div>
  );
}

/** A picture in a frame. No caption: the alt text and surrounding copy carry the meaning. */
export function Figure({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <Image src={src} alt={alt} width={width} height={height} className="h-auto w-full" sizes="(min-width: 1024px) 560px, 100vw" />
    </div>
  );
}
