// Next Imports
import { redirect } from 'next/navigation'

// Component Imports
import OrderDetails from '@/views/admin/ecommerce/orders/details'

// Services
import { orderServices } from '@/services/order'

const OrderDetailsPage = async ({ params }) => {
  try {
    const response = await orderServices.getById(params.id)

    if (!response?.data) {
      redirect('/not-found')
    }

    return <OrderDetails orderData={response.data} orderId={params.id} />
  } catch (error) {
    console.error('Failed to fetch order details:', error)
    redirect('/not-found')
  }
}

export default OrderDetailsPage
