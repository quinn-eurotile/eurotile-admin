'use server';
// Next Imports
import dynamic from 'next/dynamic';

// MUI Imports
import Grid from '@mui/material/Grid2';

// Component Imports

// Data Imports
import { getOrderHistory } from '@/app/server/actions';
import UserLeftOverview from '@/views/admin/retail-customers/view/user-left-overview';
import UserRight from '@/views/admin/retail-customers/view/user-right';
import { retailCustomerService } from '@/services/retail-customer';

import OverViewTab from '@/views/admin/retail-customers/view/user-right/overview';
import { fetchDashboardData } from '@/app/server/trade-professional';
const OrderList = dynamic(() => import('@/views/admin/retail-customers/view/user-right/orders/list'));
const CommissionList = dynamic(() => import('@/views/admin/retail-customers/view/user-right/commission/list'))
// const BillingPlans = dynamic(() => import('@views/apps/user/view/user-right/billing-plans'))
// const NotificationsTab = dynamic(() => import('@views/apps/user/view/user-right/notifications'))
// const ConnectionsTab = dynamic(() => import('@views/apps/user/view/user-right/connections'))



export async function fetchById(id) {
  try {
    return await retailCustomerService.getById(id);
  } catch (error) {
    console.error('Failed to fetch Trade Professional', error);
  }
}


export async function update(id, data) {
  try {
    return await retailCustomerService.update(id, data);
  } catch (error) {
    console.error('Failed to Update Trade Professional', error);
  }
}

export async function orderData() {
  try {
    return await getOrderHistory();
  } catch (error) {
    console.error('Failed to fetch ecommerce data', error);
  }
}

const UserViewTab = async props => {
  const params = await props.params; // Ensure await if needed (based on error)
  const userId = params?.id;

  console.log(userId, 'userIduserId')

  const response = await fetchById(userId);
  console.log(response, 'responseresponse')
  const data = response?.data;

  const overviewTab = await OverViewTab({ data, params });
  const commissionTab = await CommissionList({ userId })

  const dashboardData = await fetchDashboardData();

  const tabContentList = {
    overview: overviewTab,
    //security: <SecurityTab userId={userId} data={data} />,
    orders: <OrderList dashboardData={dashboardData} />,
    commission: commissionTab,
  };

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <UserLeftOverview data={data} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <UserRight tabContentList={tabContentList} data={data} />
      </Grid>
    </Grid>
  );
};



export default UserViewTab;
