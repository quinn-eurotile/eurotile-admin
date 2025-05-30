// Component Imports
import { fetchUserProfile } from '@/app/front-pages/checkout/page';
import { authOptions } from '@/libs/auth';
import { addressService } from '@/services/address';
import { cartService } from '@/services/cart';
import Checkout from '@views/front-pages/CheckoutPage'
import { getServerSession } from 'next-auth';

// Server-side data fetching functions
export async function fetchCartData(userId) {
  try {
    const cartData = await cartService.getById(userId)
    return {
      items: cartData?.items || [],
      subtotal: cartData?.subtotal || 0,
      total: cartData?.total || 0
    }
  } catch (error) {
    console.error('Failed to fetch cart data:', error)
    return { items: [], subtotal: 0, total: 0 }
  }
}
export async function fetchUserAddresses(userId) {
  try {
    const addresses = await addressService.getById(userId)
    return addresses || []
  } catch (error) {
    console.error('Failed to fetch user addresses:', error)
    return []
  }
}

const CheckoutPage = async () => {
   // Get session on server side
  const session = await getServerSession(authOptions)

  // Initialize data
  let initialData = {
    cartItems: [],
    addresses: [],
    user: null,
    orderSummary: {
      subtotal: 0,
      shipping: 0,
      total: 0
    }
  }

  // Fetch data if user is authenticated
  if (session?.user?.id) {
    const [cartData, addresses, userProfile] = await Promise.all([
      fetchCartData(session.user.id),
      fetchUserAddresses(session.user.id),
      fetchUserProfile(session.user.id)
    ])

    initialData = {
      cartItems: cartData.items,
      addresses: addresses,
      user: userProfile || session.user,
      orderSummary: {
        subtotal: cartData.subtotal,
        shipping: 0,
        total: cartData.total
      }
    }
  }
  return <Checkout   initialData={initialData}   session={session} />
}

export default CheckoutPage
