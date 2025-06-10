"use client";

// React Imports
import { useEffect, useState, useContext } from "react";

// Next Imports
import Link from "next/link";

// MUI Imports
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import TabContext from "@mui/lab/TabContext";
import Tab from "@mui/material/Tab";
import TabPanel from "@mui/lab/TabPanel";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Fade from "@mui/material/Fade";
import CircularProgress from "@mui/material/CircularProgress";

// Component Imports
import CustomTabList from "@core/components/mui/TabList";

// Context Import
import { CheckoutContext } from "./CheckoutWizard";

// Stripe imports
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPaymentIntent, verifyStripePayment, removeCart } from "@/app/server/actions";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

// Dynamically import StripeWrapper with no SSR
const StripeWrapper = dynamic(
  () => import('@/components/payment/StripeWrapper'),
  { ssr: false }
);

const StepPayment = ({ handleNext, handleBack }) => {
  // Context
  const {
    cartItems,
    orderSummary,
    selectedAddress,
    selectedShipping,
    addresses,
    user,
    adminSettings,
    setStepValid,
    loading,
    setOrderData
  } = useContext(CheckoutContext);

  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [saveCard, setSaveCard] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get selected address details
  const selectedAddressDetails = addresses.find((addr) => addr.id === selectedAddress);

  const handlePaymentSuccess = async (data) => {
    const paymentDetails = {
      ...data,
      details: {
        deliveryAddress: selectedAddress,
        amount: orderSummary.total,
      }
    };

    setOrderData(prev => ({
      ...prev,
      payment: paymentDetails
    }));

    handleNext();
  };

  if (!mounted || loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <CircularProgress />
      </div>
    );
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 8 }} className="flex flex-col gap-5">
        {paymentError && (
          <Alert severity="error" onClose={() => setPaymentError("")}>
            {paymentError}
          </Alert>
        )}

        <StripeWrapper>
          <form onSubmit={async (event) => {
            event.preventDefault();
            const stripe = useStripe();
            const elements = useElements();

            if (!stripe || !elements) {
              return;
            }

            setIsProcessing(true);
            setPaymentError(null);

            try {
              const response = await createPaymentIntent({
                amount: Math.round(orderSummary.total * 100),
                currency: "usd",
                saveCard,
                customerId: session?.user?._id,
                cartItems: cartItems,
                orderData: {
                  subtotal: orderSummary.subtotal,
                  shipping: orderSummary.shipping,
                  tax: orderSummary.tax || 0,
                  total: orderSummary.total,
                  shippingAddress: selectedAddress,
                  shippingMethod: selectedShipping,
                  paymentMethod: 'stripe',
                  userId: session?.user?._id
                }
              });

              if (!response.success) {
                setPaymentError(response.message || "Failed to create payment intent");
                return;
              }

              const { clientSecret } = response.data;

              const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                  card: elements.getElement(CardElement),
                  billing_details: {
                    name: session?.user?.name || "",
                    email: session?.user?.email || "",
                  },
                },
              });

              if (confirmError) {
                setPaymentError(confirmError.message);
              } else {
                handlePaymentSuccess({
                  paymentIntentId: paymentIntent.id,
                  paymentMethod: "stripe",
                  status: true
                });
              }
            } catch (error) {
              console.error("Error creating payment intent:", error);
              setPaymentError("An unexpected error occurred.");
            } finally {
              setIsProcessing(false);
            }
          }}>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12 }}>
                <div className="p-6 border rounded bg-white">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#424770",
                          "::placeholder": {
                            color: "#aab7c4",
                          },
                          padding: "16px",
                        },
                      },
                    }}
                  />
                </div>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={<Switch checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />}
                  label="Save Card for future billing?"
                />
              </Grid>
              <Grid size={{ xs: 12 }} className="flex gap-4">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isProcessing}
                  sx={{
                    backgroundColor: '#991b1b',
                    '&:hover': {
                      backgroundColor: '#7f1d1d',
                    },
                    minWidth: '200px'
                  }}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <CircularProgress size={20} color="inherit" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Pay £${orderSummary?.total?.toFixed(2) || "0.00"}`
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </StripeWrapper>

        <div className="flex justify-between mt-6">
          <Button variant="outlined" onClick={handleBack} disabled={isProcessing}>
            Back
          </Button>
        </div>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <div className="border rounded">
          <CardContent>
            <Typography className="font-medium mbe-4" color="text.primary">
              Order Summary
            </Typography>
            {cartItems && cartItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4 mb-4">
                <img
                  width={64}
                  height={64}
                  src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${item?.product?.productFeaturedImage?.filePath}` || "/placeholder.svg?height=140&width=140"}
                  alt={item?.product?.name || 'Product Image'}
                  className="object-cover rounded-lg"
                />
                <div>
                  <Typography variant="body2">
                    {item?.isSample ?
                      `${item?.product?.name} (${item?.sampleAttributes?.type} Sample)` :
                      item?.product?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Qty: {item.quantity} × £{item.price}
                  </Typography>
                </div>
              </div>
            ))}
            <Divider className="my-4" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Typography color="text.primary">Order Total</Typography>
                <Typography>£{orderSummary.subtotal?.toFixed(2) || "0.00"}</Typography>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Typography color="text.primary">Delivery Charges</Typography>
                <div className="flex gap-2">
                  {orderSummary.shipping === 0 ? (
                    <>
                      <Typography color="text.disabled" className="line-through">
                        £5.00
                      </Typography>
                      <Chip variant="tonal" size="small" color="success" label="Free" />
                    </>
                  ) : (
                    <Typography>£{orderSummary.shipping?.toFixed(2) || "0.00"}</Typography>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Typography color="text.primary">VAT ({orderSummary.vatRate || 0}%)</Typography>
                <Typography>£{orderSummary.vat?.toFixed(2) || "0.00"}</Typography>
              </div>
            </div>
          </CardContent>
          <Divider />
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Typography className="font-medium" color="text.primary">
                  Total Amount
                </Typography>
                <Typography className="font-medium">£{orderSummary.total?.toFixed(2) || "0.00"}</Typography>
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
                  {selectedAddressDetails.name} {selectedAddressDetails.isDefault ? "(Default)" : ""}
                </Typography>
                <Typography>{selectedAddressDetails.street},</Typography>
                <Typography>
                  {selectedAddressDetails.city}, {selectedAddressDetails.state}, {selectedAddressDetails.zipCode}
                </Typography>
                <Typography>Mobile: {selectedAddressDetails.phone}</Typography>
              </div>
            )}
          </CardContent>
        </div>
      </Grid>
    </Grid>
  );
};

export default StepPayment;
