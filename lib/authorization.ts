import { eq, sql } from "drizzle-orm";
import { getD1, getDb } from "../db";
import { staffAccounts } from "../db/schema";
import { getChatGPTUser } from "../app/chatgpt-auth";

export type SalonAccess = {
  email: string;
  displayName: string;
  role: "owner" | "stylist";
  stylist: string | null;
};

export async function ensureStaffSchema() {
  const d1 = getD1();
  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS staff_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      display_name TEXT NOT NULL,
      stylist TEXT,
      role TEXT NOT NULL DEFAULT 'stylist',
      status TEXT NOT NULL DEFAULT 'invited',
      invited_at TEXT NOT NULL,
      activated_at TEXT
    )`),
    d1.prepare("CREATE UNIQUE INDEX IF NOT EXISTS staff_accounts_email_unique ON staff_accounts(email)"),
  ]);
}

export async function requireSalonAccess(): Promise<SalonAccess | null> {
  const user = await getChatGPTUser();
  if (!user) return null;
  await ensureStaffSchema();
  const db = getDb();
  const email = user.email.trim().toLowerCase();
  let [account] = await db.select().from(staffAccounts).where(eq(staffAccounts.email, email)).limit(1);

  if (!account) {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(staffAccounts);
    if (Number(count) === 0) {
      [account] = await db.insert(staffAccounts).values({
        email,
        displayName: user.displayName,
        stylist: "Morgan Reed",
        role: "owner",
        status: "active",
        invitedAt: new Date().toISOString(),
        activatedAt: new Date().toISOString(),
      }).returning();
    } else {
      return null;
    }
  } else if (account.status === "invited") {
    [account] = await db.update(staffAccounts).set({
      status: "active",
      activatedAt: new Date().toISOString(),
      displayName: account.displayName || user.displayName,
    }).where(eq(staffAccounts.id, account.id)).returning();
  }

  if (account.status !== "active") return null;
  return {
    email: account.email,
    displayName: account.displayName,
    role: account.role === "owner" ? "owner" : "stylist",
    stylist: account.stylist,
  };
}

export function canAccessStylist(access: SalonAccess, stylist: string) {
  return access.role === "owner" || access.stylist === stylist;
}
