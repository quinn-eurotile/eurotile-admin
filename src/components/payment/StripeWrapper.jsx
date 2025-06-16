"use client"

import { useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
// Stripe appearance object
const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#991b1b',
    colorBackground: '#ffffff',
    colorText: '#424770',
    colorDanger: '#df1b41',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    spacingUnit: '4px',
    borderRadius: '4px',
  }
}

const options = {
  mode: 'payment',
  amount: 1099,
  currency: 'gbp',
  appearance,
}

export default function StripeWrapper({ children }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null // Return null on server-side and first render
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}
