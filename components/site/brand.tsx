import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 no-underline">
      <Image src="/img/logo.png" alt="" width={52} height={34} priority={!light} />
      <span className={cn("font-display text-xl leading-none", light ? "text-white" : "text-heading")}>
        PT. CMS Chemical
        <small className={cn("block text-[0.62rem] font-semibold tracking-[0.3em] uppercase", light ? "text-white/70" : "text-muted-foreground")}>
          Indonesia
        </small>
      </span>
    </Link>
  );
}
