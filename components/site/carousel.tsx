"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import type { Photo } from "@/lib/gallery";
import { cn } from "@/lib/utils";

/*
 * Two carousels, both usable without JavaScript and with a keyboard:
 *
 * - HeroSlideshow: photos stacked in one frame that crossfade, with a slow zoom on the
 *   current one. Plays by itself, pauses on hover, focus or the pause button, and never
 *   plays when the visitor has asked for reduced motion.
 * - PhotoGallery: a row of photos you swipe, scroll or step through with the arrows.
 *   It is a CSS scroll-snap strip, so it also works before JavaScript loads.
 */

const REDUCED = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(REDUCED).matches;
}

/** Reduced-motion setting as React state; the server and first render assume "no preference". */
function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    prefersReducedMotion,
    () => false,
  );
}

function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute top-3 left-3 z-10 rounded-sm bg-white/90 px-2 py-0.5 text-xs font-semibold text-indigo-deep shadow-sm",
        className,
      )}
    >
      Sample photo
    </span>
  );
}

const arrowButton =
  "inline-flex size-11 items-center justify-center rounded-full border transition-[background-color,border-color,color,transform,opacity] active:scale-95 disabled:pointer-events-none disabled:opacity-35";

/* ---------------------------------------------------------------- Hero slideshow */

export function HeroSlideshow({
  photos,
  label,
  interval = 6000,
}: {
  photos: Photo[];
  label: string;
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  // null until the visitor presses play or pause; until then it plays unless motion is reduced.
  const [choice, setChoice] = useState<boolean | null>(null);
  const playing = choice ?? !reduced;
  const [held, setHeld] = useState(false); // hover or keyboard focus inside
  const count = photos.length;

  useEffect(() => {
    if (!playing || held || count < 2) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), interval);
    return () => window.clearTimeout(id);
  }, [playing, held, index, count, interval]);

  const go = useCallback((i: number) => setIndex((i + count) % count), [count]);
  const running = playing && !held;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className="group/hero relative"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false);
      }}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-white/15 bg-indigo-deep shadow-2xl shadow-black/30 lg:aspect-[4/3]">
        {photos.map((p, i) => {
          const active = i === index;
          return (
            <div
              key={p.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-out",
                active ? "z-[1] opacity-100" : "opacity-0",
              )}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 540px, 100vw"
                className={cn("object-cover object-[30%_50%]", active && running && "hero-kenburns")}
                style={{ animationDuration: `${interval + 1500}ms` }}
              />
              {p.sample && <SampleBadge />}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setChoice(!playing)}
          aria-label={playing ? "Pause slideshow" : "Play slideshow"}
          className={cn(arrowButton, "border-white/30 text-white hover:border-white hover:bg-white/10")}
        >
          {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
        </button>
        {/* Progress bars double as slide pickers; the current one fills while it plays. */}
        <div className="flex flex-1 gap-1.5">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show photo ${i + 1} of ${count}`}
              aria-current={i === index ? "true" : undefined}
              className="group/dot flex h-11 flex-1 items-center"
            >
              <span className="relative block h-1 w-full overflow-hidden rounded-full bg-white/25 transition-colors group-hover/dot:bg-white/45">
                <span
                  key={i === index ? `on-${index}-${running}` : "off"}
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full bg-white",
                    i < index && "w-full",
                    i > index && "w-0",
                    i === index && (running ? "hero-progress" : "w-full"),
                  )}
                  style={i === index && running ? { animationDuration: `${interval}ms` } : undefined}
                />
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous photo"
            className={cn(arrowButton, "border-white/30 text-white hover:border-white hover:bg-white/10")}
          >
            <ChevronLeft aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next photo"
            className={cn(arrowButton, "border-white/30 text-white hover:border-white hover:bg-white/10")}
          >
            <ChevronRight aria-hidden />
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live={running ? "off" : "polite"}>
        Photo {index + 1} of {count}: {photos[index]?.alt}
      </p>
    </section>
  );
}

/* ---------------------------------------------------------------- Photo gallery */

export function PhotoGallery({
  photos,
  label,
  className,
}: {
  photos: Photo[];
  label: string;
  className?: string;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [state, setState] = useState({ index: 0, progress: 0, atStart: true, atEnd: false });
  const count = photos.length;

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const items = el.children;
    const max = el.scrollWidth - el.clientWidth;
    const step = items.length > 1 ? (items[1] as HTMLElement).offsetLeft - (items[0] as HTMLElement).offsetLeft : el.clientWidth;
    const atEnd = el.scrollLeft >= max - 4;
    const index = atEnd ? count - 1 : Math.min(count - 1, Math.round(el.scrollLeft / Math.max(step, 1)));
    setState({ index, progress: max > 0 ? el.scrollLeft / max : 1, atStart: el.scrollLeft <= 4, atEnd: atEnd || max <= 4 });
  }, [count]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure]);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    const second = el.children[1] as HTMLElement | undefined;
    const distance = first && second ? second.offsetLeft - first.offsetLeft : el.clientWidth;
    el.scrollBy({ left: dir * distance, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <section aria-roledescription="carousel" aria-label={label} className={cn("relative", className)}>
      <ul
        ref={track}
        tabIndex={0}
        aria-label={`${label}: scroll or use the arrow keys`}
        className="gallery-track -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 outline-offset-4 sm:-mx-6 sm:scroll-px-6 sm:gap-6 sm:px-6"
      >
        {photos.map((p, i) => (
          <li
            key={p.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className="group/slide shrink-0 basis-[85%] snap-start sm:basis-[60%] lg:basis-[calc((100%-3rem)/2.4)]"
          >
            <figure className="m-0">
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg border bg-mist">
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 1024px) 460px, (min-width: 640px) 60vw, 85vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover/slide:scale-[1.03]"
                />
                {p.sample && <SampleBadge />}
              </div>
              {p.caption && (
                <figcaption className="mt-3 flex gap-3 text-[0.95rem]">
                  <span className="font-semibold text-palm tabular-nums">
                    {i + 1}/{count}
                  </span>
                  <span className="text-heading">{p.caption}</span>
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center gap-4">
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-border" aria-hidden>
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(state.progress, 1 / count) * 100}%` }}
          />
        </div>
        <p className="min-w-[3.5rem] text-right text-sm text-muted-foreground tabular-nums" aria-live="polite">
          <span className="sr-only">Photo </span>
          {state.index + 1} / {count}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={state.atStart}
            aria-label="Previous photos"
            className={cn(arrowButton, "border-input bg-card text-heading hover:border-primary hover:text-primary")}
          >
            <ChevronLeft aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={state.atEnd}
            aria-label="Next photos"
            className={cn(arrowButton, "border-input bg-card text-heading hover:border-primary hover:text-primary")}
          >
            <ChevronRight aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
