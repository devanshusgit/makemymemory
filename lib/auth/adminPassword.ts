import bcrypt from "bcryptjs";
import { createHash, timingSafeEqual } from "crypto";
import { connectDB } from "@/lib/db/connect";
import Settings from "@/lib/db/models/Settings";

/**
 * One place that decides whether a password is the admin password, used by
 * both login and "change password" so they can never disagree again (the old
 * change-password form saved a plaintext field that login never read, so the
 * change silently did nothing).
 *
 * Order: the hash saved from Settings > Change password, then
 * ADMIN_PASSWORD_HASH, then ADMIN_PASSWORD from the environment.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (typeof password !== "string" || !password) return false;

  let dbHash = "";
  try {
    await connectDB();
    const settings = await Settings.findOne({}).select("+adminPasswordHash").lean<{ adminPasswordHash?: string }>();
    dbHash = settings?.adminPasswordHash || "";
  } catch {
    // DB unreachable — fall back to the environment below.
  }

  const hash = dbHash || process.env.ADMIN_PASSWORD_HASH;
  if (hash) return bcrypt.compare(password, hash);

  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envPassword) return false;
  // Compare digests so the lengths always match and nothing leaks by timing.
  const a = createHash("sha256").update(password).digest();
  const b = createHash("sha256").update(envPassword).digest();
  return timingSafeEqual(a, b);
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  const hash = await bcrypt.hash(newPassword, 12);
  await connectDB();
  await Settings.updateOne(
    {},
    { $set: { adminPasswordHash: hash }, $unset: { adminPassword: "" } },
    { upsert: true }
  );
}
