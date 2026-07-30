import { and, eq } from "drizzle-orm";
import { getD1, getDb } from "../../../db";
import { blockedTime, stylistSettings } from "../../../db/schema";
import { canAccessStylist, requireSalonAccess } from "../../../lib/authorization";

async function ensureSchema() {
  const d1 = getD1();
  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS stylist_settings (
      stylist TEXT PRIMARY KEY,
      work_days TEXT NOT NULL DEFAULT '1,2,3,4,5,6',
      start_time TEXT NOT NULL DEFAULT '09:00',
      end_time TEXT NOT NULL DEFAULT '18:00',
      break_start TEXT,
      break_end TEXT,
      payment_methods TEXT NOT NULL DEFAULT 'Zelle',
      updated_at TEXT NOT NULL
    )`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS blocked_time (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stylist TEXT NOT NULL,
      block_date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      reason TEXT,
      created_at TEXT NOT NULL
    )`),
  ]);
}

export async function GET(request: Request) {
  const access = await requireSalonAccess();
  if (!access) return Response.json({ error: "Salon access is required." }, { status: 403 });
  await ensureSchema();
  const stylist = new URL(request.url).searchParams.get("stylist") || "Morgan Reed";
  if (!canAccessStylist(access, stylist)) return Response.json({ error: "You cannot view that stylist." }, { status: 403 });
  const db = getDb();
  const [settings] = await db.select().from(stylistSettings).where(eq(stylistSettings.stylist, stylist)).limit(1);
  const blocks = await db.select().from(blockedTime).where(eq(blockedTime.stylist, stylist));
  return Response.json({ settings: settings ?? { stylist, workDays:"1,2,3,4,5,6", startTime:"09:00", endTime:"18:00", breakStart:"12:00", breakEnd:"12:30", paymentMethods:"Zelle" }, blocks });
}

export async function PUT(request: Request) {
  const access = await requireSalonAccess();
  if (!access) return Response.json({ error: "Salon access is required." }, { status: 403 });
  await ensureSchema();
  const body = await request.json() as Record<string, string>;
  if (!body.stylist) return Response.json({ error: "Stylist is required." }, { status: 400 });
  if (!canAccessStylist(access, body.stylist)) return Response.json({ error: "You cannot update that stylist." }, { status: 403 });
  const values = {
    stylist: body.stylist,
    workDays: body.workDays || "1,2,3,4,5,6",
    startTime: body.startTime || "09:00",
    endTime: body.endTime || "18:00",
    breakStart: body.breakStart || null,
    breakEnd: body.breakEnd || null,
    paymentMethods: body.paymentMethods || "Zelle",
    updatedAt: new Date().toISOString(),
  };
  await getDb().insert(stylistSettings).values(values).onConflictDoUpdate({
    target: stylistSettings.stylist,
    set: values,
  });
  return Response.json({ settings: values });
}

export async function POST(request: Request) {
  const access = await requireSalonAccess();
  if (!access) return Response.json({ error: "Salon access is required." }, { status: 403 });
  await ensureSchema();
  const body = await request.json() as Record<string, string>;
  if (!body.stylist || !body.blockDate) return Response.json({ error: "Stylist and date are required." }, { status: 400 });
  if (!canAccessStylist(access, body.stylist)) return Response.json({ error: "You cannot update that stylist." }, { status: 403 });
  const [created] = await getDb().insert(blockedTime).values({
    stylist: body.stylist,
    blockDate: body.blockDate,
    startTime: body.startTime || null,
    endTime: body.endTime || null,
    reason: body.reason || "Time off",
    createdAt: new Date().toISOString(),
  }).returning();
  return Response.json({ block: created }, { status: 201 });
}

export async function DELETE(request: Request) {
  const access = await requireSalonAccess();
  if (!access) return Response.json({ error: "Salon access is required." }, { status: 403 });
  await ensureSchema();
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "Block is required." }, { status: 400 });
  const [record] = await getDb().select().from(blockedTime).where(eq(blockedTime.id, id)).limit(1);
  if (!record || !canAccessStylist(access, record.stylist)) return Response.json({ error: "You cannot remove that block." }, { status: 403 });
  await getDb().delete(blockedTime).where(and(eq(blockedTime.id, id)));
  return Response.json({ ok: true });
}
