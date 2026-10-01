import { User } from "@/lib/db/models/User";

/**
 * Phones are saved exactly as the customer typed them at signup
 * ("9876543210", "+91 98765 43210", ...). To find an account from a number
 * typed again later, try the usual Indian spellings of the same 10 digits.
 */
export function phoneCandidates(raw: string): string[] {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  const ten = /^[6-9]\d{9}$/.test(digits) ? digits
    : /^0[6-9]\d{9}$/.test(digits) ? digits.slice(1)
    : /^91[6-9]\d{9}$/.test(digits) ? digits.slice(2)
    : null;
  if (!ten) return trimmed ? [trimmed] : [];
  const spaced = `${ten.slice(0, 5)} ${ten.slice(5)}`;
  return Array.from(new Set([
    trimmed, ten, `0${ten}`, `91${ten}`, `+91${ten}`, `+91 ${ten}`, `+91 ${spaced}`, spaced,
  ]));
}

export async function findUserByPhone(raw: string) {
  const candidates = phoneCandidates(raw);
  if (!candidates.length) return null;
  return User.findOne({ phone: { $in: candidates }, isDeleted: { $ne: true } });
}
