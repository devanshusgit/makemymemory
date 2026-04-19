/**
 * Simple utility to merge class names conditionally.
 * Use clsx or tailwind-merge for more complex cases.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
