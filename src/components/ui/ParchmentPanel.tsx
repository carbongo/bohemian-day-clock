import type { ReactNode } from "react";

interface ParchmentPanelProps {
  children: ReactNode;
  id: string;
  title: string;
}

const CORNERS = [
  "left-1 top-1",
  "right-1 top-1 -scale-x-100",
  "bottom-1 left-1 -scale-y-100",
  "bottom-1 right-1 -scale-100",
];

/** A sheet of parchment with a rubricated heading and drawn corner flourishes. */
export function ParchmentPanel({ children, id, title }: ParchmentPanelProps) {
  return (
    <section
      id={id}
      className="parchment relative w-[min(21rem,calc(100vw-1.5rem))] rounded-xs px-5 pt-4 pb-5 font-dial"
      aria-label={title}
    >
      {CORNERS.map((position) => (
        <Flourish key={position} className={position} />
      ))}
      <h2 className="text-center text-2xl leading-8 font-bold">
        <span className="text-[1.35em] text-rubric">{title.slice(0, 1)}</span>
        {title.slice(1)}
      </h2>
      <Rule />
      {children}
    </section>
  );
}

/** An ink rule with a red lozenge, under headings and between sections. */
export function Rule() {
  return (
    <svg
      className="mx-auto my-2 h-3 w-full"
      viewBox="0 0 300 12"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <path
        d="M4 6H136M164 6H296"
        stroke="#4a3212"
        strokeOpacity="0.7"
        strokeWidth="1"
      />
      <path d="M150 1l6 5-6 5-6-5z" fill="#8a1c12" />
      <path d="M136 6l4-2.6v5.2zM164 6l-4-2.6v5.2z" fill="#4a3212" />
    </svg>
  );
}

function Flourish({ className }: { className: string }) {
  return (
    <svg
      className={`pointer-events-none absolute h-9 w-9 ${className}`}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 34V10C2 5 5 2 10 2H34"
        stroke="#4a3212"
        strokeOpacity="0.75"
        strokeWidth="1.2"
      />
      <path
        d="M6 26c0-7 2-12 6-15s8-5 14-5M10 18c3 1 5 0 6-2s0-4-2-4-3 2-2 3"
        stroke="#8a1c12"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
      <circle
        cx="6"
        cy="6"
        r="2"
        fill="#b8963e"
        stroke="#4a3212"
        strokeWidth="0.6"
      />
    </svg>
  );
}
