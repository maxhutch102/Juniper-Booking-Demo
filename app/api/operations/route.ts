import { asc, desc, eq, sql } from "drizzle-orm";
import { getD1, getDb } from "../../../db";
import { appointments, boothRent, inventoryItems, salonExpenses } from "../../../db/schema";
import { requireSalonAccess } from "../../../lib/authorization";

async function ownerOnly() {
  const access = await requireSalonAccess();
  return access?.role === "owner" ? access : null;
}

async function ensureOperationsSchema() {
  const d1 = getD1();
  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT 'units',
      reorder_at INTEGER NOT NULL DEFAULT 0,
      unit_cost_cents INTEGER NOT NULL DEFAULT 0,
      supplier TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    )`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS salon_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expense_date TEXT NOT NULL,
      category TEXT NOT NULL,
      vendor TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      amount_cents INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS booth_rent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stylist TEXT NOT NULL,
      period TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      due_date TEXT NOT NULL,
      paid_date TEXT,
      status TEXT NOT NULL DEFAULT 'due',
      note TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    )`),
    d1.prepare("CREATE UNIQUE INDEX IF NOT EXISTS booth_rent_stylist_period_unique ON booth_rent(stylist, period)"),
  ]);
}

export async function GET(request: Request) {
  if (!await ownerOnly()) return Response.json({ error: "Owner access is required." }, { status: 403 });
  await ensureOperationsSchema();
  const db = getDb();
  const resource = new URL(request.url).searchParams.get("resource");
  if (resource === "inventory") {
    return Response.json({ items: await db.select().from(inventoryItems).orderBy(asc(inventoryItems.category), asc(inventoryItems.name)) });
  }
  if (resource === "expenses") {
    return Response.json({ expenses: await db.select().from(salonExpenses).orderBy(desc(salonExpenses.expenseDate), desc(salonExpenses.id)) });
  }
  if (resource === "rent") {
    return Response.json({ rent: await db.select().from(boothRent).orderBy(desc(boothRent.period), asc(boothRent.stylist)) });
  }
  if (resource === "reports") {
    const appts = await db.select().from(appointments);
    const expenses = await db.select().from(salonExpenses);
    const rent = await db.select().from(boothRent);
    const completed = appts.filter(a => a.status === "completed");
    const active = appts.filter(a => a.status !== "cancelled");
    const byStylist = Object.values(active.reduce<Record<string, { stylist:string; bookings:number; revenueCents:number }>>((all, a) => {
      all[a.stylist] ||= { stylist: a.stylist, bookings: 0, revenueCents: 0 };
      all[a.stylist].bookings++;
      all[a.stylist].revenueCents += a.priceCents;
      return all;
    }, {})).sort((a,b) => b.revenueCents-a.revenueCents);
    const byService = Object.values(active.reduce<Record<string, { service:string; bookings:number; revenueCents:number }>>((all, a) => {
      all[a.service] ||= { service: a.service, bookings: 0, revenueCents: 0 };
      all[a.service].bookings++;
      all[a.service].revenueCents += a.priceCents;
      return all;
    }, {})).sort((a,b) => b.bookings-a.bookings);
    return Response.json({
      summary: {
        bookings: active.length,
        completed: completed.length,
        bookedRevenueCents: active.reduce((n,a)=>n+a.priceCents,0),
        expenseCents: expenses.reduce((n,e)=>n+e.amountCents,0),
        rentCollectedCents: rent.filter(r=>r.status==="paid").reduce((n,r)=>n+r.amountCents,0),
        cancellationRate: appts.length ? Math.round(appts.filter(a=>a.status==="cancelled").length/appts.length*100) : 0,
      },
      byStylist, byService,
    });
  }
  const [inventoryCount] = await db.select({ count: sql<number>`count(*)` }).from(inventoryItems);
  return Response.json({ inventoryCount: Number(inventoryCount.count) });
}

export async function POST(request: Request) {
  if (!await ownerOnly()) return Response.json({ error: "Owner access is required." }, { status: 403 });
  await ensureOperationsSchema();
  const body = await request.json() as Record<string, unknown>;
  const now = new Date().toISOString();
  if (body.resource === "inventory") {
    await getDb().insert(inventoryItems).values({
      name:String(body.name||""), category:String(body.category||"Supplies"), quantity:Number(body.quantity)||0,
      unit:String(body.unit||"units"), reorderAt:Number(body.reorderAt)||0, unitCostCents:Math.round(Number(body.unitCost)||0),
      supplier:String(body.supplier||""), updatedAt:now,
    });
  } else if (body.resource === "expenses") {
    await getDb().insert(salonExpenses).values({
      expenseDate:String(body.expenseDate||now.slice(0,10)), category:String(body.category||"Other"), vendor:String(body.vendor||""),
      description:String(body.description||""), amountCents:Math.round(Number(body.amountCents)||0), createdAt:now,
    });
  } else if (body.resource === "rent") {
    await getDb().insert(boothRent).values({
      stylist:String(body.stylist||""), period:String(body.period||now.slice(0,7)), amountCents:Math.round(Number(body.amountCents)||0),
      dueDate:String(body.dueDate||now.slice(0,10)), status:"due", note:String(body.note||""), updatedAt:now,
    }).onConflictDoUpdate({
      target:[boothRent.stylist,boothRent.period],
      set:{ amountCents:Math.round(Number(body.amountCents)||0), dueDate:String(body.dueDate||now.slice(0,10)), note:String(body.note||""), updatedAt:now },
    });
  } else return Response.json({ error: "Unknown operation." }, { status: 400 });
  return Response.json({ ok:true });
}

export async function PATCH(request: Request) {
  if (!await ownerOnly()) return Response.json({ error: "Owner access is required." }, { status: 403 });
  await ensureOperationsSchema();
  const body = await request.json() as { resource?:string; id?:number; quantity?:number; status?:string };
  if (!body.id) return Response.json({ error:"A record is required." }, { status:400 });
  if (body.resource === "inventory") {
    await getDb().update(inventoryItems).set({ quantity:Math.max(0,Number(body.quantity)||0), updatedAt:new Date().toISOString() }).where(eq(inventoryItems.id,body.id));
  } else if (body.resource === "rent") {
    const paid = body.status === "paid";
    await getDb().update(boothRent).set({ status:paid?"paid":"due", paidDate:paid?new Date().toISOString().slice(0,10):null, updatedAt:new Date().toISOString() }).where(eq(boothRent.id,body.id));
  }
  return Response.json({ ok:true });
}

export async function DELETE(request: Request) {
  if (!await ownerOnly()) return Response.json({ error: "Owner access is required." }, { status: 403 });
  await ensureOperationsSchema();
  const params = new URL(request.url).searchParams, id = Number(params.get("id"));
  if (params.get("resource") === "inventory") await getDb().delete(inventoryItems).where(eq(inventoryItems.id,id));
  if (params.get("resource") === "expenses") await getDb().delete(salonExpenses).where(eq(salonExpenses.id,id));
  if (params.get("resource") === "rent") await getDb().delete(boothRent).where(eq(boothRent.id,id));
  return Response.json({ ok:true });
}
