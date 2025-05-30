"use client"

// React Imports
import { useEffect, useState, useContext } from "react"

// Next Imports
import Link from "next/link"

// MUI Imports
import Grid from "@mui/material/Grid2"
import Typography from "@mui/material/Typography"
import Alert from "@mui/material/Alert"
import AlertTitle from "@mui/material/AlertTitle"
import TabContext from "@mui/lab/TabContext"
import Tab from "@mui/material/Tab"
import TabPanel from "@mui/lab/TabPanel"
import FormControlLabel from "@mui/material/FormControlLabel"
import Button from "@mui/material/Button"
import Switch from "@mui/material/Switch"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import CardContent from "@mui/material/CardContent"
import IconButton from "@mui/material/IconButton"
import Collapse from "@mui/material/Collapse"
import Fade from "@mui/material/Fade"
import CircularProgress from "@mui/material/CircularProgress"

// Component Imports
import CustomTabList from "@core/components/mui/TabList"

// Context Import
import { CheckoutContext } from "./CheckoutWizard"

// Stripe and Klarna imports (you'll need to install these)
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

// Stripe Payment Form Component
const StripePaymentForm = ({ onPaymentSuccess, isProcessing, setIsProcessing }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [saveCard, setSaveCard] = useState(true)
  const [paymentError, setPaymentError] = useState(null)

  const { orderSummary, user } = useContext(CheckoutContext)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    const cardElement = elements.getElement(CardElement)

    try {
      // Create payment intent
      const response = await fetch("/api/payment/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(orderSummary.total * 100), // Convert to cents
          currency: "usd",
          saveCard,
          customerId: user?.id,
        }),
      })

      const { clientSecret, error } = await response.json()

      if (error) {
        setPaymentError(error)
        return
      }

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user?.name || "",
            email: user?.email || "",
          },
        },
      })

      if (confirmError) {
        setPaymentError(confirmError.message)
      } else if (paymentIntent.status === "succeeded") {
        onPaymentSuccess({
          paymentIntentId: paymentIntent.id,
          paymentMethod: "stripe",
        })
      }
    } catch (error) {
      setPaymentError("An unexpected error occurred.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12 }}>
          <div className="p-4 border rounded">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                },
              }}
            />
          </div>
        </Grid>
        {paymentError && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">{paymentError}</Alert>
          </Grid>
        )}
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={<Switch checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />}
            label="Save Card for future billing?"
          />
        </Grid>
        <Grid size={{ xs: 12 }} className="flex gap-4">
          <Button type="submit" variant="contained" disabled={!stripe || isProcessing}>
            {isProcessing ? <CircularProgress size={24} /> : "Pay with Stripe"}
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

const StepPayment = ({ handleNext }) => {
  // Context
  const { orderSummary, selectedAddress, addresses, setStepValid } = useContext(CheckoutContext)

  // States
  const [value, setValue] = useState("stripe")
  const [openCollapse, setOpenCollapse] = useState(true)
  const [openFade, setOpenFade] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentData, setPaymentData] = useState(null)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  useEffect(() => {
    if (!openFade) {
      setTimeout(() => {
        setOpenCollapse(false)
      }, 300)
    }
  }, [openFade])

  // Handle Klarna payment
  const handleKlarnaPayment = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/payment/klarna/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(orderSummary.total * 100),
          currency: "USD",
        }),
      })

      const { session_id, redirect_url } = await response.json()

      if (redirect_url) {
        // Redirect to Klarna checkout
        window.location.href = redirect_url
      }
    } catch (error) {
      console.error("Klarna payment error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle Cash on Delivery
  const handleCashOnDelivery = () => {
    setPaymentData({
      paymentMethod: "cash_on_delivery",
    })
    handleNext()
  }

  // Handle successful payment
  const handlePaymentSuccess = (data) => {
    setPaymentData(data)
    setStepValid(2, true)
    handleNext()
  }

  // Get selected address details
  const selectedAddressDetails = addresses.find((addr) => addr.id === selectedAddress)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 8 }} className="flex flex-col gap-5">
        <Collapse in={openCollapse}>
          <Fade in={openFade} timeout={{ exit: 300 }}>
            <Alert
              icon={<i className="ri-percent-line" />}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setOpenFade(false)
                  }}
                >
                  <i className="ri-close-line" />
                </IconButton>
              }
            >
              <AlertTitle>Available Offers</AlertTitle>
              <Typography color="success.main">
                - 10% Instant Discount on Bank of America Corp Bank Debit and Credit cards
              </Typography>
              <Typography color="success.main">
                - 25% Cashback Voucher of up to $60 on first ever PayPal transaction. TCA
              </Typography>
            </Alert>
          </Fade>
        </Collapse>

        <TabContext value={value}>
          <CustomTabList
            variant="scrollable"
            scrollButtons="auto"
            onChange={handleChange}
            aria-label="payment methods"
            pill="true"
          >
            <Tab value="stripe" label="Credit Card (Stripe)" />
            <Tab value="klarna" label="Klarna" />
            <Tab value="cash-on-delivery" label="Cash On Delivery" />
          </CustomTabList>

          <Grid container>
            <Grid size={{ xs: 12, md: 8 }}>
              <TabPanel value="stripe" className="p-0">
                <Elements stripe={stripePromise}>
                  <StripePaymentForm
                    onPaymentSuccess={handlePaymentSuccess}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </Elements>
              </TabPanel>

              <TabPanel value="klarna" className="p-0">
                <Typography className="mbe-4" color="text.primary">
                  Pay with Klarna - Buy now, pay later options available.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleKlarnaPayment}
                  disabled={isProcessing}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  {isProcessing ? <CircularProgress size={24} /> : "Pay with Klarna"}
                </Button>
              </TabPanel>

              <TabPanel value="cash-on-delivery" className="p-0">
                <Typography className="mbe-4" color="text.primary">
                  Cash on Delivery is a type of payment method where the recipient makes payment for the order at the
                  time of delivery rather than in advance.
                </Typography>
                <Button variant="contained" onClick={handleCashOnDelivery} disabled={isProcessing}>
                  Pay On Delivery
                </Button>
              </TabPanel>
            </Grid>
          </Grid>
        </TabContext>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <div className="border rounded">
          <CardContent>
            <Typography className="font-medium mbe-4" color="text.primary">
              Price Details
            </Typography>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Typography color="text.primary">Order Total</Typography>
                <Typography>${orderSummary.subtotal?.toFixed(2) || "0.00"}</Typography>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Typography color="text.primary">Delivery Charges</Typography>
                <div className="flex gap-2">
                  {orderSummary.shipping === 0 ? (
                    <>
                      <Typography color="text.disabled" className="line-through">
                        $5.00
                      </Typography>
                      <Chip variant="tonal" size="small" color="success" label="Free" />
                    </>
                  ) : (
                    <Typography>${orderSummary.shipping?.toFixed(2) || "0.00"}</Typography>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <Divider />
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Typography className="font-medium" color="text.primary">
                  Total
                </Typography>
                <Typography className="font-medium">${orderSummary.total?.toFixed(2) || "0.00"}</Typography>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Typography className="font-medium" color="text.primary">
                  Deliver to:
                </Typography>
                <Chip variant="tonal" size="small" color="primary" label={selectedAddressDetails?.type || "Home"} />
              </div>
            </div>
            {selectedAddressDetails && (
              <div>
                <Typography className="font-medium" color="text.primary">
                  {selectedAddressDetails.name} {selectedAddressDetails.isDefault ? "(Default)" : ""},
                </Typography>
                <Typography>{selectedAddressDetails.street},</Typography>
                <Typography>
                  {selectedAddressDetails.city}, {selectedAddressDetails.state}, {selectedAddressDetails.zipCode}.
                </Typography>
                <Typography>Mobile: {selectedAddressDetails.phone}</Typography>
              </div>
            )}
            <Typography
              href="/"
              component={Link}
              onClick={(e) => e.preventDefault()}
              className="font-medium"
              color="primary.main"
            >
              Change address
            </Typography>
          </CardContent>
        </div>
      </Grid>
    </Grid>
  )
}

export default StepPayment
