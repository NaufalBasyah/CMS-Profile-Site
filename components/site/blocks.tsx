import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  tone?: "plain" | "mist" | "dark";
  children: ReactNode;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "py-16 sm:py-20 lg:py-24",
        tone === "mist" && "bg-mist",
        tone === "dark" && "bg-indigo-deep text-white/85 [&_h2]:text-white [&_h3]:text-white",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("mb-3 text-xs font-semibold tracking-[0.2em] text-palm uppercase", className)}>{children}</p>
  );
}

export function SectionHead({
  title,
  id,
  eyebrow,
  children,
  action,
}: {
  title: string;
  id?: string;
  eyebrow?: string;
  children?: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 id={id} className="text-4xl sm:text-5xl">
          {title}
        </h2>
        {children && <div className="mt-4 text-lg text-muted-foreground">{children}</div>}
      </div>
      {action && (
        <Link href={action.href} className="shrink-0 font-semibold text-primary hover:text-oxide">
          {action.label} →
        </Link>
      )}
    </div>
  );
}

export function PageHero({ title, eyebrow, children }: { title: string; eyebrow?: string; children?: ReactNode }) {
  return (
    <section className="border-b bg-mist">
      <Container className="py-14 sm:py-20">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
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
          <h2 className="text-3xl text-white sm:text-4xl">Looking for a reliable E.B.S. supplier?</h2>
          <p className="mt-2 text-white/80">Request samples, technical data or a supply quotation.</p>
        </div>
        <Link href="/partnership" className={cn(buttonVariants({ variant: "light", size: "lg" }), "no-underline")}>
          Contact our sales team
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

export function Figure({
  src,
  alt,
  width,
  height,
  caption,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-lg border bg-white">
      <Image src={src} alt={alt} width={width} height={height} className="h-auto w-full" sizes="(min-width: 1024px) 560px, 100vw" />
      {caption && <figcaption className="border-t px-4 py-3 text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

