import Link from "next/link";
import { connection } from "next/server";
import { getSettings } from "@/lib/content";
import { Brand } from "./brand";
import { NAV } from "./nav";

/** Footer with contact details from the admin panel. Rendered at request time. */
export async function SiteFooter() {
  await connection();
  const s = await getSettings();
  const year = new Date().getFullYear();
  return (
    <footer className="bg-indigo-deep text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Brand light />
          <p className="font-semibold text-white">{s.company_name}</p>
          <address className="whitespace-pre-line not-italic">{s.address}</address>
          <p>
            {s.phone}
            <br />
            <a className="text-white underline decoration-white/40 hover:decoration-white" href={`mailto:${s.email}`}>
              {s.email}
            </a>
          </p>
        </div>
        <FooterList title="Company" links={[...NAV, { href: "/partnership", label: "Send an inquiry" }]} />
        <FooterList
          title="Products"
          links={[
            { href: "/products#grades", label: "HI-LUB B50 and B80 beads" },
            { href: "/products#grades", label: "HI-LUB P130 and P200 powders" },
            { href: "/products#applications", label: "Applications" },
            { href: "/partnership?interest=Sample", label: "Samples" },
          ]}
        />
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-white/60 sm:flex-row sm:justify-between sm:px-6">
          <span>
            © {s.founded}–{year} {s.company_name}
          </span>
          {s.show_demo_notice === "1" && <span>Some content on this site is sample data for demonstration.</span>}
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="mb-3 font-semibold text-white">{title}</p>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="inline-flex min-h-11 items-center text-white/80 no-underline hover:text-white hover:underline md:min-h-0 md:py-0.5">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FooterFallback() {
  return <footer className="h-80 bg-indigo-deep" />;
}
