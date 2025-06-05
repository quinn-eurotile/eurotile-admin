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


export const paymentStatus = {
  2: { text: 'Paid', color: 'success', colorClassName: 'text-success' },
  1: { text: 'Pending', color: 'warning', colorClassName: 'text-warning' },
  4: { text: 'Refunded', color: 'secondary', colorClassName: 'text-secondary' },
  3: { text: 'Failed', color: 'error', colorClassName: 'text-error' }
}

export const statusChipColor = {
  0: { text: 'Cancelled', color: 'error', colorClassName: 'text-error' },
  1: { text: 'Delivered', color: 'success', colorClassName: 'text-success' },
  2: { text: 'Processing', color: 'warning', colorClassName: 'text-warning' },
  3: { text: 'New', color: 'info', colorClassName: 'text-info' },
  4: { text: 'Shipped', color: 'secondary', colorClassName: 'text-secondary' }
};
