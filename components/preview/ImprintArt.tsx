"use client";

import { useId } from "react";

/**
 * A baby's hand and foot imprint in metallic foil.
 *
 * These are drawn rather than photographed so they can take any foil colour
 * and stay sharp at any size. They stand in for the customer's own prints,
 * which only exist once the kit has been used.
 */

function FoilDefs({ id, stops }: { id: string; stops: string[] }) {
  return (
    <defs>
      <linearGradient id={`${id}-foil`} x1="0" y1="0" x2="1" y2="1">
        {stops.map((c, i) => (
          <stop key={i} offset={`${(i / (stops.length - 1)) * 100}%`} stopColor={c} />
        ))}
      </linearGradient>
      {/* A faint grain, so the print reads as pressed foil rather than flat paint. */}
      <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="noise" />
        <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
        <feComponentTransfer in="mono" result="soft">
          <feFuncA type="linear" slope="0.18" />
        </feComponentTransfer>
        <feComposite in="soft" in2="SourceGraphic" operator="in" result="grainOnShape" />
        <feBlend in="SourceGraphic" in2="grainOnShape" mode="multiply" />
      </filter>
    </defs>
  );
}

/** SVG ids from useId contain colons, which some browsers reject inside url(). */
function useSvgId() {
  return `pv${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}

export function HandImprint({ stops, className }: { stops: string[]; className?: string }) {
  const id = useSvgId();
  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label="Baby handprint">
      <FoilDefs id={id} stops={stops} />
      <g fill={`url(#${id}-foil)`} filter={`url(#${id}-grain)`}>
        <ellipse cx="60" cy="103" rx="33" ry="38" />
        <ellipse cx="29" cy="60" rx="8" ry="16" transform="rotate(-20 29 60)" />
        <ellipse cx="45" cy="45" rx="8.5" ry="19" transform="rotate(-7 45 45)" />
        <ellipse cx="62" cy="40" rx="9" ry="21" transform="rotate(2 62 40)" />
        <ellipse cx="79" cy="46" rx="8.5" ry="19" transform="rotate(12 79 46)" />
        <ellipse cx="97" cy="88" rx="9" ry="17" transform="rotate(50 97 88)" />
      </g>
    </svg>
  );
}

export function FootImprint({ stops, className }: { stops: string[]; className?: string }) {
  const id = useSvgId();
  return (
    <svg viewBox="0 0 100 160" className={className} role="img" aria-label="Baby footprint">
      <FoilDefs id={id} stops={stops} />
      <g fill={`url(#${id}-foil)`} filter={`url(#${id}-grain)`}>
        <path d="M52 42c26 0 33 27 28 50-3 15-11 21-11 35 0 19-9 29-22 29-15 0-21-12-19-28 2-15-6-26-6-46 0-24 10-40 30-40z" />
        <circle cx="67" cy="27" r="10.5" />
        <circle cx="49" cy="21" r="7.2" />
        <circle cx="36" cy="25" r="6.2" />
        <circle cx="26" cy="32" r="5.2" />
        <circle cx="19" cy="42" r="4.4" />
      </g>
    </svg>
  );
}
