import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const clients = sqliteTable("clients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  lastVisitAt: text("last_visit_at"),
}, (table) => [
  uniqueIndex("clients_email_unique").on(table.email),
]);

export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientId: integer("client_id").notNull().references(() => clients.id),
  stylist: text("stylist").notNull(),
  service: text("service").notNull(),
  serviceDate: text("service_date").notNull(),
  serviceTime: text("service_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  priceCents: integer("price_cents").notNull().default(0),
  status: text("status").notNull().default("confirmed"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
}, (table) => [
  uniqueIndex("appointments_stylist_slot_unique").on(
    table.stylist,
    table.serviceDate,
    table.serviceTime,
  ),
]);

export const stylistSettings = sqliteTable("stylist_settings", {
  stylist: text("stylist").primaryKey(),
  workDays: text("work_days").notNull().default("1,2,3,4,5,6"),
  startTime: text("start_time").notNull().default("09:00"),
  endTime: text("end_time").notNull().default("18:00"),
  breakStart: text("break_start"),
  breakEnd: text("break_end"),
  paymentMethods: text("payment_methods").notNull().default("Zelle"),
  updatedAt: text("updated_at").notNull(),
});

export const blockedTime = sqliteTable("blocked_time", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stylist: text("stylist").notNull(),
  blockDate: text("block_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  reason: text("reason"),
  createdAt: text("created_at").notNull(),
});

export const staffAccounts = sqliteTable("staff_accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  stylist: text("stylist"),
  role: text("role").notNull().default("stylist"),
  status: text("status").notNull().default("invited"),
  invitedAt: text("invited_at").notNull(),
  activatedAt: text("activated_at"),
}, (table) => [
  uniqueIndex("staff_accounts_email_unique").on(table.email),
]);

export const stylistServices = sqliteTable("stylist_services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stylist: text("stylist").notNull(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  detail: text("detail").notNull().default(""),
  durationMinutes: integer("duration_minutes").notNull(),
  priceCents: integer("price_cents").notNull().default(0),
  addOns: text("add_ons").notNull().default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("stylist_services_name_unique").on(table.stylist, table.name),
]);

export const inventoryItems = sqliteTable("inventory_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull().default("units"),
  reorderAt: integer("reorder_at").notNull().default(0),
  unitCostCents: integer("unit_cost_cents").notNull().default(0),
  supplier: text("supplier").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
});

export const salonExpenses = sqliteTable("salon_expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  expenseDate: text("expense_date").notNull(),
  category: text("category").notNull(),
  vendor: text("vendor").notNull(),
  description: text("description").notNull().default(""),
  amountCents: integer("amount_cents").notNull(),
  createdAt: text("created_at").notNull(),
});

export const boothRent = sqliteTable("booth_rent", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stylist: text("stylist").notNull(),
  period: text("period").notNull(),
  amountCents: integer("amount_cents").notNull(),
  dueDate: text("due_date").notNull(),
  paidDate: text("paid_date"),
  status: text("status").notNull().default("due"),
  note: text("note").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("booth_rent_stylist_period_unique").on(table.stylist, table.period),
]);
