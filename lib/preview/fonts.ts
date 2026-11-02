import { Great_Vibes, Yellowtail, Courier_Prime, Dancing_Script, Parisienne, Playfair_Display } from "next/font/google";

/**
 * Web stand-ins for the fonts the studio prints with, used only by the frame
 * preview. They are close, not identical — the preview also shows the real
 * printed sample for whichever font is picked.
 *
 * preload: false because a visitor only ever looks at one or two of these;
 * the browser fetches a face only once text is actually drawn in it.
 * Cormorant Garamond and DM Sans come from app/layout.tsx already.
 */
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--pv-great-vibes", display: "swap", preload: false });
const yellowtail = Yellowtail({ subsets: ["latin"], weight: "400", variable: "--pv-yellowtail", display: "swap", preload: false });
const courierPrime = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--pv-courier-prime", display: "swap", preload: false });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--pv-dancing-script", display: "swap", preload: false });
const parisienne = Parisienne({ subsets: ["latin"], weight: "400", variable: "--pv-parisienne", display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], variable: "--pv-playfair", display: "swap", preload: false });

/** Put on the preview's wrapper so every --pv-* variable is defined inside it. */
export const previewFontVariables = [
  greatVibes.variable,
  yellowtail.variable,
  courierPrime.variable,
  dancingScript.variable,
  parisienne.variable,
  playfair.variable,
].join(" ");
