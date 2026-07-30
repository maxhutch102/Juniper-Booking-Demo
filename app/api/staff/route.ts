import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { staffAccounts } from "../../../db/schema";
import { ensureStaffSchema, requireSalonAccess } from "../../../lib/authorization";

export async function GET() {
  const access = await requireSalonAccess();
  if (!access) return Response.json({ error: "Salon access is required." }, { status: 403 });
  await ensureStaffSchema();
  if (access.role !== "owner") {
    return Response.json({ access, staff: [] });
  }
  const staff = await getDb().select().from(staffAccounts).orderBy(asc(staffAccounts.displayName));
  return Response.json({ access, staff });
}

export async function POST(request: Request) {
  const access = await requireSalonAccess();
  if (!access || access.role !== "owner") return Response.json({ error: "Owner access is required." }, { status: 403 });
  await ensureStaffSchema();
  const body = await request.json() as Record<string, string>;
  const email = (body.email || "").trim().toLowerCase();
  const displayName = (body.displayName || "").trim();
  const stylist = (body.stylist || "").trim();
  if (!email.includes("@") || !displayName || !stylist) {
    return Response.json({ error: "Name, stylist, and a valid email are required." }, { status: 400 });
  }
  const values = {
    email,
    displayName,
    stylist,
    role: body.role === "owner" ? "owner" : "stylist",
    status: "invited",
    invitedAt: new Date().toISOString(),
    activatedAt: null,
  };
  await getDb().insert(staffAccounts).values(values).onConflictDoUpdate({
    target: staffAccounts.email,
    set: values,
  });
  return Response.json({ ok: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  const access = await requireSalonAccess();
  if (!access || access.role !== "owner") return Response.json({ error: "Owner access is required." }, { status: 403 });
  const body = await request.json() as { id?: number; status?: string };
  if (!body.id || !["active", "disabled", "invited"].includes(body.status || "")) {
    return Response.json({ error: "Choose a valid team status." }, { status: 400 });
  }
  await getDb().update(staffAccounts).set({ status: body.status! }).where(eq(staffAccounts.id, body.id));
  return Response.json({ ok: true });
}
