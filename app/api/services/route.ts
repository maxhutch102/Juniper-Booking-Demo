import { asc, eq } from "drizzle-orm";
import { getDb, getD1 } from "../../../db";
import { stylistServices } from "../../../db/schema";
import { canAccessStylist, requireSalonAccess } from "../../../lib/authorization";

const starter = [
  ["Color", "All Over Color", "Color at roots and ends", 90, 15000, "Extra product|Gloss refresh"],
  ["Color", "Retouch", "Color at the roots to cover natural or gray hair", 90, 12500, "Gloss refresh"],
  ["Color", "Full Highlight", "Entire head of dimensional foils", 180, 26500, "Root melt|Haircut"],
  ["Color", "Partial Highlight", "Brightness around the face and crown", 120, 22000, "Root melt|Haircut"],
  ["Cut & Style", "Haircut", "Customized cut with a polished blowdry", 45, 8500, "Deep conditioning"],
  ["Cut & Style", "Blowout", "Shampoo and polished blow dry", 30, 6000, "Hot tool finish"],
  ["Treatments & Extensions", "Consultation", "Discuss your desired look and plan next steps", 15, 0, ""],
  ["Treatments & Extensions", "Brazilian Blowout", "Smoothing and straightening service", 150, 30000, "Haircut"],
  ["Treatments & Extensions", "Extension Color Match", "Match and plan a custom extension installation", 10, 0, ""],
] as const;

async function ensureServicesSchema() {
  const d1 = getD1();
  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS stylist_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stylist TEXT NOT NULL,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      duration_minutes INTEGER NOT NULL,
      price_cents INTEGER NOT NULL DEFAULT 0,
      add_ons TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    )`),
    d1.prepare("CREATE UNIQUE INDEX IF NOT EXISTS stylist_services_name_unique ON stylist_services(stylist, name)"),
  ]);
}

async function seedStylist(stylist: string) {
  const d1 = getD1();
  const now = new Date().toISOString();
  await d1.batch(starter.map((item, index) => d1.prepare(
    `INSERT OR IGNORE INTO stylist_services
      (stylist, category, name, detail, duration_minutes, price_cents, add_ons, active, sort_order, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
  ).bind(stylist, ...item, index, now)));
}

export async function GET(request: Request) {
  await ensureServicesSchema();
  const params = new URL(request.url).searchParams;
  const stylist = params.get("stylist") || "Morgan Reed";
  const seedFor = stylist === "Any available artist" ? "Morgan Reed" : stylist;
  if (params.get("manage") === "1") {
    const access = await requireSalonAccess();
    if (!access || !canAccessStylist(access, seedFor)) return Response.json({ error: "You cannot view that stylist." }, { status: 403 });
  }
  await seedStylist(seedFor);
  const rows = await getDb().select().from(stylistServices)
    .where(eq(stylistServices.stylist, seedFor))
    .orderBy(asc(stylistServices.sortOrder), asc(stylistServices.name));
  return Response.json({ services: params.get("manage") === "1" ? rows : rows.filter((row) => row.active), stylist: seedFor });
}

export async function POST(request: Request) {
  const access = await requireSalonAccess();
  if (!access) return Response.json({ error: "Salon access is required." }, { status: 403 });
  await ensureServicesSchema();
  const body = await request.json() as Record<string, string | number | boolean>;
  const stylist = String(body.stylist || "");
  if (!canAccessStylist(access, stylist)) return Response.json({ error: "You cannot update that stylist." }, { status: 403 });
  if (!body.name || !body.category || Number(body.durationMinutes) < 5) return Response.json({ error: "Name, category, and duration are required." }, { status: 400 });
  const now = new Date().toISOString();
  await getDb().insert(stylistServices).values({
    stylist, category: String(body.category), name: String(body.name), detail: String(body.detail || ""),
    durationMinutes: Number(body.durationMinutes), priceCents: Math.max(0, Number(body.priceCents) || 0),
    addOns: String(body.addOns || ""), active: body.active !== false, sortOrder: Number(body.sortOrder) || 99, updatedAt: now,
  }).onConflictDoUpdate({
    target: [stylistServices.stylist, stylistServices.name],
    set: { category: String(body.category), detail: String(body.detail || ""), durationMinutes: Number(body.durationMinutes), priceCents: Math.max(0, Number(body.priceCents) || 0), addOns: String(body.addOns || ""), active: body.active !== false, updatedAt: now },
  });
  return Response.json({ ok: true });
}

export async function PATCH(request: Request) {
  const access = await requireSalonAccess();
  if (!access) return Response.json({ error: "Salon access is required." }, { status: 403 });
  await ensureServicesSchema();
  const body = await request.json() as { id?: number; active?: boolean };
  const record = body.id ? await getDb().select().from(stylistServices).where(eq(stylistServices.id, body.id)).get() : null;
  if (!record || !canAccessStylist(access, record.stylist)) return Response.json({ error: "You cannot update that service." }, { status: 403 });
  await getDb().update(stylistServices).set({ active: Boolean(body.active), updatedAt: new Date().toISOString() }).where(eq(stylistServices.id, record.id));
  return Response.json({ ok: true });
}
