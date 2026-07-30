import { and, asc, eq, gte } from "drizzle-orm";
import { getD1, getDb } from "../../../db";
import { appointments, blockedTime, clients, stylistSettings } from "../../../db/schema";
import { canAccessStylist, requireSalonAccess } from "../../../lib/authorization";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

async function ensureSchema() {
  const d1 = getD1();
  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      last_visit_at TEXT
    )`),
    d1.prepare("CREATE UNIQUE INDEX IF NOT EXISTS clients_email_unique ON clients(email)"),
    d1.prepare(`CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      stylist TEXT NOT NULL,
      service TEXT NOT NULL,
      service_date TEXT NOT NULL,
      service_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      price_cents INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'confirmed',
      notes TEXT,
      created_at TEXT NOT NULL
    )`),
    d1.prepare("CREATE UNIQUE INDEX IF NOT EXISTS appointments_stylist_slot_unique ON appointments(stylist, service_date, service_time)"),
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

export async function PATCH(request: Request) {
  const access = await requireSalonAccess();
  if (!access) return Response.json({ error: "Salon access is required." }, { status: 403 });
  await ensureSchema();
  const body = await request.json() as { id?: number; status?: string };
  const allowed = ["confirmed", "completed", "cancelled", "no-show"];
  if (!body.id || !allowed.includes(body.status ?? "")) {
    return Response.json({ error: "Choose a valid appointment status." }, { status: 400 });
  }
  const [record] = await getDb().select({ stylist: appointments.stylist }).from(appointments).where(eq(appointments.id, body.id)).limit(1);
  if (!record || !canAccessStylist(access, record.stylist)) return Response.json({ error: "You cannot update that appointment." }, { status: 403 });
  await getDb().update(appointments).set({ status: body.status! }).where(eq(appointments.id, body.id));
  return Response.json({ ok: true });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const availabilityOnly = url.searchParams.get("availability") === "1";
  const stylist = url.searchParams.get("stylist");
  const date = url.searchParams.get("date");

  await ensureSchema();
  const db = getDb();

  if (availabilityOnly && stylist && datePattern.test(date ?? "")) {
    const rows = await db.select({ time: appointments.serviceTime })
      .from(appointments)
      .where(and(
        eq(appointments.stylist, stylist),
        eq(appointments.serviceDate, date!),
      ));
    const [settings] = await db.select().from(stylistSettings).where(eq(stylistSettings.stylist, stylist)).limit(1);
    const blocks = await db.select().from(blockedTime).where(and(eq(blockedTime.stylist, stylist),eq(blockedTime.blockDate,date!)));
    return Response.json({ bookedTimes: rows.map((row) => row.time), settings: settings ?? null, blocks });
  }

  const access = await requireSalonAccess();
  if (!access) return Response.json({ error: "Salon access is required." }, { status: 403 });

  const rows = await db.select({
    id: appointments.id,
    stylist: appointments.stylist,
    service: appointments.service,
    serviceDate: appointments.serviceDate,
    serviceTime: appointments.serviceTime,
    durationMinutes: appointments.durationMinutes,
    priceCents: appointments.priceCents,
    status: appointments.status,
    notes: appointments.notes,
    clientId: clients.id,
    clientName: clients.fullName,
    clientEmail: clients.email,
    clientPhone: clients.phone,
  }).from(appointments)
    .innerJoin(clients, eq(appointments.clientId, clients.id))
    .where(access.role === "owner"
      ? gte(appointments.serviceDate, new Date().toISOString().slice(0, 10))
      : and(gte(appointments.serviceDate, new Date().toISOString().slice(0, 10)), eq(appointments.stylist, access.stylist || "")))
    .orderBy(asc(appointments.serviceDate), asc(appointments.serviceTime));

  return Response.json({ appointments: rows, access });
}

export async function POST(request: Request) {
  await ensureSchema();
  const body = await request.json() as Record<string, unknown>;
  const required = ["fullName", "email", "phone", "stylist", "service", "serviceDate", "serviceTime"];
  if (required.some((key) => typeof body[key] !== "string" || !(body[key] as string).trim())) {
    return Response.json({ error: "Please complete every required field." }, { status: 400 });
  }
  if (!datePattern.test(body.serviceDate as string) || !timePattern.test(body.serviceTime as string)) {
    return Response.json({ error: "That appointment time is invalid." }, { status: 400 });
  }

  const db = getDb();
  const email = (body.email as string).trim().toLowerCase();
  const now = new Date().toISOString();

  try {
    await db.insert(clients).values({
      fullName: (body.fullName as string).trim(),
      email,
      phone: (body.phone as string).trim(),
      notes: typeof body.notes === "string" ? body.notes.trim() : null,
      createdAt: now,
    }).onConflictDoUpdate({
      target: clients.email,
      set: {
        fullName: (body.fullName as string).trim(),
        phone: (body.phone as string).trim(),
        notes: typeof body.notes === "string" ? body.notes.trim() : null,
      },
    });

    const [client] = await db.select().from(clients).where(eq(clients.email, email)).limit(1);
    const [created] = await db.insert(appointments).values({
      clientId: client.id,
      stylist: body.stylist as string,
      service: body.service as string,
      serviceDate: body.serviceDate as string,
      serviceTime: body.serviceTime as string,
      durationMinutes: Number(body.durationMinutes) || 60,
      priceCents: Number(body.priceCents) || 0,
      status: "confirmed",
      notes: typeof body.notes === "string" ? body.notes.trim() : null,
      createdAt: now,
    }).returning({ id: appointments.id });

    return Response.json({ appointmentId: created.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("appointments_stylist_slot_unique") || message.includes("UNIQUE constraint")) {
      return Response.json({ error: "That time was just booked. Please choose another opening." }, { status: 409 });
    }
    return Response.json({ error: "We couldn't save the appointment. Please try again." }, { status: 500 });
  }
}
