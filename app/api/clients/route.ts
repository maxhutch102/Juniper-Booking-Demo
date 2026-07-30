import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { appointments, clients } from "../../../db/schema";
import { requireSalonAccess } from "../../../lib/authorization";

export async function GET() {
  const access = await requireSalonAccess();
  if (!access) return Response.json({ error: "Salon access is required." }, { status: 403 });

  const rows = await getDb().select({
    id: clients.id,
    fullName: clients.fullName,
    email: clients.email,
    phone: clients.phone,
    notes: clients.notes,
    createdAt: clients.createdAt,
    appointmentCount: sql<number>`count(${appointments.id})`,
    lastAppointment: sql<string | null>`max(${appointments.serviceDate})`,
  }).from(clients)
    .innerJoin(appointments, eq(clients.id, appointments.clientId))
    .where(access.role === "owner" ? undefined : eq(appointments.stylist, access.stylist || ""))
    .groupBy(clients.id)
    .orderBy(desc(sql`max(${appointments.serviceDate})`));

  return Response.json({ clients: rows });
}

export async function PATCH(request: Request) {
  const access = await requireSalonAccess();
  if (!access) return Response.json({ error: "Salon access is required." }, { status: 403 });
  const body = await request.json() as { id?: number; notes?: string };
  if (!body.id || typeof body.notes !== "string") {
    return Response.json({ error: "Choose a client and enter valid notes." }, { status: 400 });
  }
  if (access.role !== "owner") {
    const [allowed] = await getDb().select({ id: appointments.id }).from(appointments)
      .where(and(eq(appointments.clientId, body.id), eq(appointments.stylist, access.stylist || "")))
      .limit(1);
    if (!allowed) return Response.json({ error: "You cannot update that client." }, { status: 403 });
  }
  await getDb().update(clients).set({ notes: body.notes.trim() || null }).where(eq(clients.id, body.id));
  return Response.json({ ok: true });
}
