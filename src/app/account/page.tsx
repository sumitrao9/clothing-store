import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import AccountDashboard from "@/components/AccountDashboard";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  return <AccountDashboard />;
}
