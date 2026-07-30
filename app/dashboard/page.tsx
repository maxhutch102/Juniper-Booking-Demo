import { redirect } from "next/navigation";
import { requireSalonAccess } from "../../lib/authorization";
import DashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const access = await requireSalonAccess();
  if (!access) redirect("/no-access");
  return <DashboardClient initialAccess={access} />;
}
