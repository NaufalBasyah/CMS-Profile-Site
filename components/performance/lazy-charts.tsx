"use client";

/**
 * Charts load their code only when they are about to scroll into view, so the
 * charting library doesn't slow down the first moments on the page.
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AnnualPoint, MonthlyPoint } from "./charts";

const Annual = dynamic(() => import("./charts").then((m) => m.AnnualChart), { ssr: false, loading: () => <Box tall /> });
const Monthly = dynamic(() => import("./charts").then((m) => m.MonthlyChart), { ssr: false, loading: () => <Box /> });

function Box({ tall = false }: { tall?: boolean }) {
  return <div aria-hidden className={tall ? "h-80 w-full rounded-md bg-mist/60 sm:h-96" : "h-72 w-full rounded-md bg-mist/60"} />;
}

function WhenVisible({ children, tall = false }: { children: ReactNode; tall?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{show ? children : <Box tall={tall} />}</div>;
}

export function LazyAnnualChart({ data }: { data: AnnualPoint[] }) {
  return (
    <WhenVisible tall>
      <Annual data={data} />
    </WhenVisible>
  );
}

export function LazyMonthlyChart({ data, years }: { data: MonthlyPoint[]; years: string[] }) {
  return (
    <WhenVisible>
      <Monthly data={data} years={years} />
    </WhenVisible>
  );
}
