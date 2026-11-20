import { cn } from "@/lib/utils";

/* Operations page diagrams, rebuilt from the Miro board "CMS Chemical website diagrams"
   (Fig A business scope, Fig B palm oil value chain). Real text, no images; the wide
   layouts switch to a single column on phones. Arrows are decoration (aria-hidden). */

type Tone = "plain" | "palm" | "indigo";

const NODE: Record<Tone, string> = {
  plain: "border-input bg-white text-heading",
  palm: "border-palm bg-[#d7eadd] text-[#143f23]",
  indigo: "border-indigo-deep bg-primary text-white",
};

function Node({ tone = "plain", note, className, children }: { tone?: Tone; note?: string; className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative flex min-h-16 flex-col items-center justify-center rounded-md border-2 px-3 py-2 text-center font-display text-lg leading-tight",
        NODE[tone],
        className,
      )}
    >
      <span>{children}</span>
      {note && <span className={cn("mt-1 font-sans text-sm font-semibold", tone === "indigo" ? "text-white/85" : "text-palm")}>{note}</span>}
    </div>
  );
}

/** A down arrow filling the 2.5rem gap below its parent. */
function DownArrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 12 40" className={cn("absolute top-full left-1/2 h-10 w-3 -translate-x-1/2 text-foreground", className)}>
      <path d="M6 3v27" stroke="currentColor" strokeWidth="2" />
      <path d="M1 28l5 8 5-8z" fill="currentColor" />
    </svg>
  );
}

/** A right arrow filling the 3rem gap to the right of its parent. */
function RightArrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 48 12" className={cn("absolute top-1/2 left-full h-3 w-12 -translate-y-1/2 text-foreground", className)}>
      <path d="M3 6h36" stroke="currentColor" strokeWidth="2" />
      <path d="M37 1l8 5-8 5z" fill="currentColor" />
    </svg>
  );
}

/* ---------- Fig A: business scope ---------- */

const LANES = [
  { name: "Palm supply, local", text: "Stearic acid bought from major Indonesian mills.", head: "bg-palm", panel: "bg-[#eaf3ed]", col: "lg:col-start-1" },
  { name: "PT. CMS Chemical, Medan", text: "E.B.S. made in our own chemical reaction process.", head: "bg-primary", panel: "bg-[#eceefa]", col: "lg:col-start-2" },
  { name: "Customers", text: "Exported to major chemical companies worldwide.", head: "bg-indigo-deep", panel: "bg-mist", col: "lg:col-start-3" },
];

// Row classes are written out so Tailwind sees them. Each lane picks up where the last one ends.
const STEPS: { label: string; lane: number; row: string; tone?: Tone; note?: string; next: "down" | "right" | null }[] = [
  { label: "Plantation", lane: 0, row: "lg:row-start-2", next: "down" },
  { label: "Oil palm mills", lane: 0, row: "lg:row-start-3", next: "down" },
  { label: "Crude palm oil", lane: 0, row: "lg:row-start-4", next: "down" },
  { label: "Refining", lane: 0, row: "lg:row-start-5", next: "down" },
  { label: "Stearic acid", lane: 0, row: "lg:row-start-6", tone: "palm", note: "Our raw material", next: "right" },
  { label: "Reaction with ethylenediamine", lane: 1, row: "lg:row-start-6", next: "down" },
  { label: "HI-LUB E.B.S.", lane: 1, row: "lg:row-start-7", tone: "indigo", note: "Our product", next: "right" },
  { label: "Export by sea", lane: 2, row: "lg:row-start-7", next: "down" },
  { label: "Global chemical companies", lane: 2, row: "lg:row-start-8", next: null },
];

export function BusinessScope() {
  return (
    <div className="lg:p-4">
      <div className="grid gap-y-10 lg:grid-cols-3 lg:grid-rows-[auto_repeat(7,4.5rem)] lg:gap-x-12">
        {LANES.map((lane) => (
          <div key={`bg-${lane.name}`} aria-hidden className={cn("-mx-4 -my-4 hidden rounded-lg lg:row-span-8 lg:row-start-1 lg:block", lane.col, lane.panel)} />
        ))}
        {LANES.map((lane, i) => (
          <div key={lane.name} className={cn("lg:row-start-1", lane.col, i > 0 && "max-lg:mt-2")}>
            <h3 className={cn("rounded-md px-4 py-3 text-center text-xl text-white", lane.head)}>{lane.name}</h3>
            <p className="mt-3 flex gap-3 text-[0.95rem]">
              <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white", lane.head)}>{i + 1}</span>
              {lane.text}
            </p>
            {/* Steps follow in source order, so on phones each lane reads top to bottom */}
          </div>
        )).flatMap((head, i) => [
          head,
          ...STEPS.filter((s) => s.lane === i).map((s) => (
            <Node key={s.label} tone={s.tone} note={s.note} className={cn("lg:h-full", LANES[s.lane].col, s.row)}>
              {s.label}
              {s.next === "down" && <DownArrow />}
              {s.next === "right" && (
                <>
                  <DownArrow className="lg:hidden" />
                  <RightArrow className="hidden lg:block" />
                </>
              )}
            </Node>
          )),
        ])}
      </div>
      <p className="mt-8 text-sm text-muted-foreground lg:-mx-4">E.B.S. = ethylene bis stearamide</p>
    </div>
  );
}

/* ---------- Fig B: palm oil value chain ---------- */

const STAGES = [
  { head: "FFB", activity: "Cultivation and harvesting" },
  { head: "CPO and PKO", activity: "Milling and crushing" },
  { head: "Refining", activity: "Refining and fractionation" },
  { head: "Downstream", activity: "Hydrolysis, transesterification and more" },
];
const USES = ["Foods & fats", "Oleochemicals, base and speciality", "Biodiesel", "Other"];
const OLEO = "Stearic acid comes from here";

/** Two-way branch: a stem from the middle of the cell to arrows at 25% and 75% of its height. */
function Fork() {
  return (
    <div aria-hidden className="relative text-foreground">
      <span className="absolute top-1/2 left-0 h-0.5 w-1/2 -translate-y-1/2 bg-current" />
      <span className="absolute top-1/4 right-2 bottom-1/4 left-1/2 border-y-2 border-l-2 border-current" />
      {["top-1/4", "top-3/4"].map((t) => (
        <svg key={t} viewBox="0 0 10 12" className={cn("absolute right-0 h-3 w-2.5 -translate-y-1/2", t)}>
          <path d="M0 0l10 6-10 6z" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}

function Straight() {
  return (
    <div aria-hidden className="relative self-center text-foreground">
      <svg viewBox="0 0 40 12" preserveAspectRatio="none" className="h-3 w-full">
        <path d="M0 6h32" stroke="currentColor" strokeWidth="2" />
        <path d="M30 0l10 6-10 6z" fill="currentColor" />
      </svg>
    </div>
  );
}

export function ValueChain() {
  return (
    <div>
      {/* Wide screens (xl): the full chain left to right */}
      <div className="hidden xl:grid xl:grid-cols-[1fr_2.5rem_1.15fr_2.5rem_0.9fr_2.5rem_1.05fr_2.5rem_1.25fr] xl:grid-rows-[auto_auto_auto_repeat(4,5.25rem)_0.75rem]">
        {[
          ["Upstream", "col-span-3 col-start-1"],
          ["Midstream", "col-span-3 col-start-5"],
          ["Downstream", "col-start-9"],
        ].map(([label, cls]) => (
          <p key={label} className={cn("row-start-1 mb-4 border-b-2 border-input pb-2 text-center font-display text-xl text-muted-foreground", cls)}>
            {label}
          </p>
        ))}
        {["col-start-1", "col-start-3", "col-span-3 col-start-5", "col-start-9"].map((cls) => (
          <div key={cls} aria-hidden className={cn("row-span-7 row-start-2 rounded-lg bg-mist", cls)} />
        ))}
        {STAGES.map((s, i) => (
          <div key={s.head} className={cn("row-span-2 row-start-2 px-3 pt-3 pb-4", ["col-start-1", "col-start-3", "col-span-3 col-start-5", "col-start-9"][i])}>
            <h3 className="rounded-md bg-primary px-3 py-3 text-center text-xl text-white">{s.head}</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">{s.activity}</p>
          </div>
        ))}
        <Node className="col-start-1 row-span-4 row-start-4 mx-3 self-center">FFB<span className="block font-sans text-sm font-normal">Fresh fruit bunch</span></Node>
        <div className="col-start-2 row-span-4 row-start-4 grid"><Fork /></div>
        <Node className="col-start-3 row-span-2 row-start-4 mx-3 self-center">CPO<span className="block font-sans text-sm font-normal">Crude palm oil</span></Node>
        <Node className="col-start-3 row-span-2 row-start-6 mx-3 self-center">CPKO<span className="block font-sans text-sm font-normal">Crude palm kernel oil</span></Node>
        <div className="col-start-4 row-span-2 row-start-4 grid"><Straight /></div>
        <div className="col-start-4 row-span-2 row-start-6 grid"><Straight /></div>
        <Node className="col-start-5 row-span-2 row-start-4 ml-3 self-center">RBD PO</Node>
        <Node className="col-start-5 row-span-2 row-start-6 ml-3 self-center">RBD PKO</Node>
        <div className="col-start-6 row-span-2 row-start-4 grid"><Fork /></div>
        <div className="col-start-6 row-span-2 row-start-6 grid"><Fork /></div>
        {["RBD palm olein", "RBD palm stearin", "RBD palm kernel olein", "RBD palm kernel stearin"].map((f, i) => (
          <Node key={f} className={cn("col-start-7 mr-3 self-center text-base", ["row-start-4", "row-start-5", "row-start-6", "row-start-7"][i])}>
            {f}
          </Node>
        ))}
        {USES.map((u, i) => (
          <Node
            key={u}
            tone={i === 1 ? "indigo" : "plain"}
            note={i === 1 ? OLEO : undefined}
            className={cn("col-start-9 mx-3 self-center text-base", ["row-start-4", "row-start-5", "row-start-6", "row-start-7"][i])}
          >
            {u}
          </Node>
        ))}
      </div>

      {/* Phones and tablets: one stage after another */}
      <ol className="grid gap-10 xl:hidden">
        {[
          { stage: "Upstream", items: [["FFB", "Fresh fruit bunch"]] },
          { stage: "Upstream", items: [["CPO", "Crude palm oil"], ["CPKO", "Crude palm kernel oil"]] },
          { stage: "Midstream", items: [["RBD PO", "Palm olein, palm stearin"], ["RBD PKO", "Palm kernel olein, palm kernel stearin"]] },
          { stage: "Downstream", items: USES.map((u) => [u, ""]) },
        ].map((block, i) => (
          <li key={STAGES[i].head} className="relative rounded-lg bg-mist p-4">
            <p className="text-sm font-semibold text-muted-foreground">{block.stage}</p>
            <h3 className="mt-1 rounded-md bg-primary px-3 py-2.5 text-center text-xl text-white">{STAGES[i].head}</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">{STAGES[i].activity}</p>
            <div className={cn("mt-4 grid gap-3", block.items.length > 1 && "sm:grid-cols-2")}>
              {block.items.map(([name, sub]) => {
                const oleo = name.startsWith("Oleochemicals");
                return (
                  <Node key={name} tone={oleo ? "indigo" : "plain"} note={oleo ? OLEO : undefined}>
                    {name}
                    {sub && <span className="block font-sans text-sm font-normal">{sub}</span>}
                  </Node>
                );
              })}
            </div>
            {i < 3 && <DownArrow />}
          </li>
        ))}
      </ol>
      <p className="mt-8 text-sm text-muted-foreground">
        RBD = refined, bleached and deodorised. PO and PKO = palm oil and palm kernel oil.
      </p>
    </div>
  );
}
