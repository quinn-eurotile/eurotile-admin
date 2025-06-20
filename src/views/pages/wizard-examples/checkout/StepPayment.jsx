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

// Stripe and Klarna imports (you'll need to install these)
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPaymentIntent, createKlarnaSession, verifyKlarnaPayment, verifyStripePayment, removeCart, removeCartByUserId } from "@/app/server/actions";
import { paymentApi } from "@/services/payment";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

// Dynamically import StripeWrapper with no SSR
const StripeWrapper = dynamic(
  () => import('@/components/payment/StripeWrapper'),
  { ssr: false }
);

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function calculateCartTotal(cartItems) {
  return cartItems.reduce((total, item) => {
    let pricePerItem = 0;

    if (item.isSample) {
      // Use sampleAttributes.price if available, else fallback to 0
      pricePerItem = Number(item.sampleAttributes?.price ?? 0);
    } else {
      pricePerItem = Number(item.price ?? 0);
    }

    return total + pricePerItem * (item.quantity ?? 1);
  }, 0);
}

let cartTotal = 0;

// Stripe Payment Form Component
const StripePaymentForm = ({ onPaymentSuccess, isProcessing, setIsProcessing, selectedAddress, selectedShipping, orderSummary, user, cartItems, setOrderSummary }) => {

  // //console.log(JSON.stringify(user), 'user 317');

  // //console.log("orderSummary:", orderSummary, "cartItems:", cartItems);

  cartTotal = calculateCartTotal(cartItems);

  const stripe = useStripe();
  const elements = useElements();
  const [saveCard, setSaveCard] = useState(true);
  const [paymentError, setPaymentError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    // //console.log("orderSummary:", orderSummary);

    try {
      // Create payment intent using our API
      const response = await createPaymentIntent({
        amount: Math.round(orderSummary.total * 100), // Convert to cents
        currency: "gbp",
        saveCard,
        customerId: user?._id,
        cartItems: cartItems,
        orderData: {
          userId: user?._id,
          subtotal: orderSummary.subtotal,
          shipping: orderSummary.shipping,
          tax: orderSummary.tax || 0,
          total: orderSummary.total,
          shippingAddress: selectedAddress,
          shippingMethod: selectedShipping,
          shippingOption: orderSummary.shippingOption,
          paymentMethod: 'stripe',
          userId: user?._id,
          email: user?.email,
        }
      });

      if (cartTotal === 0 && response?.data?.orderId) {
        onPaymentSuccess({
          paymentIntentId: null,
          orderId: response.data.orderId,
          paymentMethod: "free",
          status: true
        });
        return;
      }

      //console.log('response: data data', response.data);

      if (!response.success) {
        setPaymentError(response.message || "Failed to create payment intent");
        return;
      }

      const { clientSecret, orderId, order } = response.data;

      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user?.name || "",
            email: user?.email || "",
          },
        },
      });

      if (confirmError) {
        setPaymentError(confirmError.message);
      } else {
        setOrderSummary(prev => ({
          ...prev,
          orderId : orderId,
          order:order
        }));
        onPaymentSuccess({
          paymentIntentId: paymentIntent.id,
          orderId: orderId,
          paymentMethod: "stripe",
          status: true
        });
      }
      // setPaymentError("Payment verification failed. Please contact support.");
    } catch (error) {
      console.error("Error creating payment intent:", error);
      setPaymentError("An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5}>
        {cartTotal > 0 &&
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
        }
        {paymentError && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">{paymentError}</Alert>
          </Grid>
        )}
        {/* <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={<Switch checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />}
            label="Save Card for future billing?"
          />
        </Grid> */}
        <Grid size={{ xs: 12 }} className="flex gap-4">
          {/* <Button type="submit" variant="contained" disabled={!stripe || isProcessing}>
            {true ? <CircularProgress size={24} /> : "Pay with Stripe"}
          </Button> */}
          {cartTotal > 0 ? (
            <Button
              type='submit'
              variant='contained'
              disabled={!stripe || isProcessing}
              startIcon={isProcessing && <i className="ri-loader-line animate-spin" />}
            >
              {isProcessing ? 'Submitting...' : 'Pay with Stripe'}
            </Button>
          ) : (
            <div className="flex gap-4  flex-col">
              <p><strong>Ready to place your order?</strong><br/>
              Click below to confirm and complete your purchase.</p>
              <Button
              className="w-auto"
              size="large"
              type='submit'
              variant='contained'
              disabled={!stripe || isProcessing}
              startIcon={isProcessing && <i className="ri-loader-line animate-spin" />}
            >
              {isProcessing ? 'Submitting...' : 'Confirm Order'}
            </Button>
              
            </div>
            
          )}
        </Grid>
      </Grid>
    </form>
  );
};

const StepPayment = ({ handleNext, handleBack, cartItems, orderSummary, selectedAddress, selectedShipping, addresses, user }) => {

  //console.log("cartItems:", cartItems);
  // //console.log("orderSummary:", orderSummary);
  // //console.log("selectedAddress:", selectedAddress);
  // //console.log("selectedShipping:", selectedShipping);
  // //console.log("addresses:", addresses);
  const { data: session, status } = useSession();
  // Context
  const { setStepValid, loading, setOrderData, setOrderSummary } = useContext(CheckoutContext);
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState("stripe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    // Reset any previous payment data and errors
    setPaymentData(null);
    setError("");
  };

  const calculateTotals = () => {
    if (!cartItems || cartItems.length === 0) return {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0
    };

    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const discount = orderSummary?.discount || 0;
    const shipping = orderSummary?.shipping || 0;
    const total = subtotal - discount + shipping;

    return {
      subtotal,
      discount,
      shipping,
      total
    };
  };

  const totals = calculateTotals();

  // Handle Klarna payment
  const handleKlarnaPayment = async () => {
    setIsProcessing(true);
    setError("");
    try {
      const response = await createKlarnaSession({
        amount: Math.round(orderSummary.total * 100),
        currency: "USD",
        order_lines: cartItems.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          unit_price: Math.round(item.price * 100),
          total_amount: Math.round(item.price * item.quantity * 100)
        })),
        shipping_address: {
          given_name: selectedAddress?.name?.split(' ')[0] || '',
          family_name: selectedAddress?.name?.split(' ').slice(1).join(' ') || '',
          email: selectedAddress?.email,
          street_address: selectedAddress?.street,
          city: selectedAddress?.city,
          postal_code: selectedAddress?.zipCode,
          country: 'US',
          phone: selectedAddress?.phone
        }
      });

      if (response.success && response.data.redirect_url) {
        // Save payment method before redirect
        setPaymentData({
          paymentMethod: "klarna",
          sessionId: response.data.session_id
        });

        // Store session ID in localStorage for verification after redirect
        localStorage.setItem('klarnaSessionId', response.data.session_id);

        // Redirect to Klarna checkout
        window.location.href = response.data.redirect_url;
      } else {
        setError(response.message || "Failed to initialize Klarna payment");
      }
    } catch (error) {
      console.error("Klarna payment error:", error);
      setError("Failed to initialize Klarna payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Cash on Delivery
  const handleCashOnDelivery = () => {
    setPaymentData({
      paymentMethod: "cash_on_delivery",
      details: {
        deliveryAddress: selectedAddress,
        amount: orderSummary.total
      }
    });
    setStepValid(2, true);
    handleNext();
  };

  // Handle successful payment
  const handlePaymentSuccess = async (data) => {
    const paymentDetails = {
      ...data,
      details: {
        deliveryAddress: selectedAddress,
        amount: orderSummary.total,
      }

    };
    // Delete the cart using the existing removeCart action
    try {
      // const response = await removeCart(cartItems[0]?.cartId);
      // //console.log("response removeCartWholeremoveCartWhole:", response);
    } catch (cartError) {
      console.error('Failed to delete cart, but payment was successful:', cartError);
    }
    // For Klarna, verify the payment status
    // if (data.paymentMethod === 'klarna' && data.sessionId) {
    //   const verifyResponse = await verifyKlarnaPayment(data.sessionId);
    //   if (!verifyResponse.success) {
    //     setError("Payment verification failed. Please contact support.");
    //     return;
    //   }
    //   paymentDetails.status = verifyResponse.data.status;
    // }
    // await removeCart();
    //console.log('user?._id: user?._id', user);
    const response = await removeCartByUserId(user?._id);
    //console.log("response removeCartWholeremoveCartWhole:", response);
    setPaymentData(paymentDetails);
    setStepValid(2, true);
    handleNext();
  };

  // Check for Klarna redirect
  useEffect(() => {
    const checkKlarnaPayment = async () => {
      const sessionId = localStorage.getItem('klarnaSessionId');
      const isKlarnaRedirect = new URLSearchParams(window.location.search).get('klarna_order_id');

      if (sessionId && isKlarnaRedirect) {
        setIsProcessing(true);
        try {
          const response = await verifyKlarnaPayment(sessionId);
          if (response.success) {
            handlePaymentSuccess({
              paymentMethod: 'klarna',
              sessionId,
              status: response.data.status
            });
          } else {
            setError("Klarna payment verification failed. Please try again.");
          }
        } catch (error) {
          setError("Failed to verify Klarna payment. Please contact support.");
        } finally {
          setIsProcessing(false);
          localStorage.removeItem('klarnaSessionId');
        }
      }
    };

    checkKlarnaPayment();
  }, []);

  // Get selected address details
  const selectedAddressDetails = addresses?.find((addr) => addr.id === selectedAddress);

 

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
        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <TabContext value={value}>
          <CustomTabList
            variant="scrollable"
            scrollButtons="auto"
            onChange={handleChange}
            aria-label="payment methods"
            pill="true"
          >
            {cartTotal > 0 && (
              <Tab value="stripe" label="Credit Card (Stripe)" />
            ) }
            {/* <Tab value="klarna" label="Klarna" />
            <Tab value="cash-on-delivery" label="Cash On Delivery" /> */}
          </CustomTabList>

          <Grid container>
            <Grid size={{ xs: 12, md: 8 }}>
              <TabPanel value="stripe" className="p-0">
                <StripeWrapper>
                  <StripePaymentForm
                    onPaymentSuccess={handlePaymentSuccess}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    orderSummary={totals}
                    user={session?.user}
                    cartItems={cartItems}
                    selectedAddress={selectedAddress}
                    selectedShipping={selectedShipping}
                    setOrderSummary={setOrderSummary}
                  />
                </StripeWrapper>
              </TabPanel>

              {/* <TabPanel value="klarna" className="p-0">
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
              </TabPanel> */}
            </Grid>
          </Grid>
        </TabContext>

        <div className="flex justify-between mt-6">
          <Button variant="outlined" onClick={handleBack} disabled={isProcessing}>
            Back
          </Button>
          {value === 'cash-on-delivery' && (
            <Button
              variant="contained"
              onClick={handleCashOnDelivery}
              disabled={isProcessing}
            >
              Confirm Order
            </Button>
          )}
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
                  src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${item?.variation?.variationImages[0]?.filePath}` || "/placeholder.svg?height=140&width=140"}
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
                    Qty: {item.quantity} × ${item.price}
                  </Typography>
                </div>
              </div>
            ))}
            <Divider className="my-4" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Typography color="text.primary">Order Total</Typography>
                <Typography>${totals.subtotal?.toFixed(2) || "0.00"}</Typography>
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
              <div className="flex items-center justify-between gap-2">
                <Typography color="text.primary">Vat</Typography>
                <div className="flex gap-2">
                    <Typography>${orderSummary.vat?.toFixed(2) || "0.00"}</Typography>
                </div>
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
