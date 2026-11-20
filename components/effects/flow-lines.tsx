/**
 * Hero background: soft lines that flow from left (palm feedstock) to right
 * (finished polymer additive), with light travelling along them. Inspired by
 * Aceternity UI's Background Beams, kept calm for an industrial B2B audience.
 * Pure SVG + CSS (see .flow-* in globals.css): the global reduced-motion rule
 * stops it, and it is hidden from assistive tech.
 */
const PATHS = [
  "M-40 320 C 220 300, 360 140, 620 170 S 980 330, 1240 210",
  "M-40 360 C 240 350, 400 200, 640 230 S 1000 380, 1240 270",
  "M-40 400 C 260 400, 430 260, 660 290 S 1020 420, 1240 330",
  "M-40 280 C 200 250, 330 80, 600 110 S 960 280, 1240 150",
  "M-40 440 C 280 450, 460 320, 680 350 S 1040 460, 1240 390",
];

export function FlowLines({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 1200 560" preserveAspectRatio="xMidYMid slice" fill="none">
      <defs>
        <linearGradient id="flow-base" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#3f9a5f" stopOpacity="0.45" />
          <stop offset="1" stopColor="#a9b0d6" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {PATHS.map((d, i) => (
        <g key={d} style={{ animationDelay: `${i * 0.12}s` }}>
          <path d={d} pathLength={1} stroke="url(#flow-base)" strokeWidth={1.2} className="flow-base" style={{ animationDelay: `${i * 0.12}s` }} />
          <path
            d={d}
            pathLength={1}
            stroke={i % 2 ? "#c9cff0" : "#8fd1a6"}
            strokeWidth={2}
            strokeLinecap="round"
            className="flow-light"
            style={{ animationDuration: `${7 + i * 1.3}s`, animationDelay: `${i * 0.9}s` }}
          />
        </g>
      ))}
    </svg>
  );
}
