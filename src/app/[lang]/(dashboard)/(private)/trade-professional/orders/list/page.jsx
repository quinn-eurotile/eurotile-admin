// MUI Imports
import Grid from '@mui/material/Grid2'
import { fetchDashboardData } from '@/app/server/trade-professional'
import OrderListTable from '@/views/trade-professional/orders/OrderListTable';

export const getDashboardData = async () => {
  const data = await fetchDashboardData()
  return data
}

const DashboardAnalytics = async () => {
  return (
    <Grid container>
        <OrderListTable />
    </Grid>
  )
}

export default DashboardAnalytics
