import { adminRole, teamMemberRole, tradeProfessionalRole } from "@/configs/constant";
import { getSession } from "next-auth/react";

export async function getDashboardRedirectUrl() {
  const session = await getSession();

  const roleIds = session?.user?.roles?.map(role => role?.id) || [];

  if (roleIds.includes(adminRole.id)) {
    return process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL;
  } else if (roleIds.includes(teamMemberRole.id)) {
    return process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL;
  } else if (roleIds.includes(tradeProfessionalRole.id)) {
    return process.env.NEXT_PUBLIC_TRADE_PROFESSIONAL_DASHBOARD_URL;
  }
  else {
    return null;
  }
}
