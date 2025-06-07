'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js'; 
import { TabContext, TabList, Tab } from '@mui/material';
import CustomTabList from '@/components/mui/TabList';
import { FormControlLabel, Switch } from '@mui/material'; 
import { createPaymentIntent, createPaymentIntentPublic } from '@/app/server/actions';
 

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Stripe payment form component
const StripePaymentForm = ({ onPaymentSuccess, isProcessing, setIsProcessing, selectedAddress, selectedShipping, orderSummary, user, cartItems }) => {

 
  
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
      // console.log("orderSummary:", orderSummary);
  
  
      try {
        // Create payment intent using our API
        const response = await createPaymentIntentPublic({
          amount: Math.round(orderSummary.total * 100), // Convert to cents
          currency: "usd",
          saveCard,
          customerId: user?._id,
          cartItems: cartItems,
          orderData: {
            subtotal: orderSummary.subtotal,
            shipping: orderSummary.shipping,
            tax: orderSummary.tax || 0,
            total: orderSummary.total,
            shippingAddress: selectedAddress,
            shippingMethod: selectedShipping,
            paymentMethod: 'stripe',
            userId: user?._id
          }
        });
        console.log("response 3333333333333:", response); // Add this line to see the paymentIntent object
  
        if (!response.success) {
          setPaymentError(response.message || "Failed to create payment intent");
          return;
        }
  
        const { clientSecret } = response.data;
  
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
  
        console.log('paymentIntent:', paymentIntent);
        console.log('confirmError:', confirmError);
  
        if (confirmError) {
          setPaymentError(confirmError.message);
        } else {
          onPaymentSuccess({
            paymentIntentId: paymentIntent.id,
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
    );
  };

export default function PaymentPageClient({ initialData, cartId, clientId }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
 

const calculateTotals = () => {
    if (!initialData.cartItems || initialData.cartItems.length === 0) return {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0
    };

    const subtotal = initialData?.cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const discount = initialData?.orderSummary?.discount || 0;
    const shipping = initialData?.orderSummary?.shipping || 0;
    const total = subtotal - discount + shipping;

    return {
      subtotal,
      discount,
      shipping,
      total
    };
  };

  const totals = calculateTotals();

//   useEffect(() => {
//     async function initializePayment() {
//       try {
//         // Validate required data
//         if (!initialData?.cartItems?.length || !initialData.client) {
//           setError('Invalid payment data');
//           setIsLoading(false);
//           return;
//         }

//         // Initialize Stripe payment intent
//         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-payment-intent`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//           },
//           body: JSON.stringify({
//             cartId,
//             clientId,
//             amount: Math.round(initialData.orderSummary.total * 100), // Convert to cents for Stripe
//             currency: 'gbp',
//             items: initialData.cartItems.map(item => ({
//               id: item._id,
//               quantity: item.quantity,
//               price: item.price,
//               name: item.product?.name
//             }))
//           }),
//         });

//         // Check if response is JSON
//         const contentType = response.headers.get('content-type');
//         if (!contentType || !contentType.includes('application/json')) {
//           throw new Error('Server error: Invalid response format');
//         }

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.message || 'Failed to initialize payment');
//         }

//         if (!data.clientSecret) {
//           throw new Error('Invalid response: Missing client secret');
//         }

//         console.log('Payment intent created:', { 
//           clientSecret: data.clientSecret ? 'exists' : 'missing',
//           status: response.status,
//           contentType
//         });

//         setClientSecret(data.clientSecret);
//       } catch (err) {
//         console.error('Payment initialization error:', err);
//         setError(err.message || 'Failed to initialize payment. Please try again later.');
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     initializePayment();
//   }, [cartId, clientId, initialData]);

  const handlePaymentMethodChange = (event, newValue) => {
    setPaymentMethod(newValue);
  };

  const handlePaymentSuccess = () => {
    // Handle payment success
  };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-[400px]">
//         <CircularProgress />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-4">
//         <Alert severity="error" className="mb-4">
//           {error}
//         </Alert>
//         <Button 
//           variant="contained" 
//           onClick={() => router.push('/')}
//           sx={{
//             backgroundColor: '#991b1b',
//             '&:hover': {
//               backgroundColor: '#7f1d1d',
//             },
//           }}
//         >
//           Return to Home
//         </Button>
//       </div>
//     );
//   }

  return (
    <div className="p-4">
      <Grid container spacing={4}>
        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <div className="space-y-4">
                {initialData.cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${item?.product?.productFeaturedImage?.filePath}`}
                      alt={item.product?.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <Typography variant="subtitle1">
                        {item.product?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity} SQ.M
                      </Typography>
                      <Typography variant="body2">
                        £{(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
              
              <Divider className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Typography>Subtotal:</Typography>
                  <Typography>£{totals?.subtotal.toFixed(2)}</Typography>
                </div>
                <div className="flex justify-between">
                  <Typography>Shipping:</Typography>
                  <Typography>£{totals?.shipping.toFixed(2)}</Typography>
                </div>
                <Divider />
                <div className="flex justify-between font-bold">
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">£{totals?.total.toFixed(2)}</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              
              {/* Shipping Address */}
              <div className="mb-6">
                <Typography variant="subtitle1" gutterBottom>
                  Shipping Address
                </Typography>
                <Typography variant="body2">
                  {initialData.client.name}<br />
                  {initialData.shippingAddress?.addressLine1}<br />
                  {initialData.shippingAddress?.addressLine2 && (
                    <>{initialData.shippingAddress.addressLine2}<br /></>
                  )}
                  {initialData.shippingAddress?.city}, {initialData.shippingAddress?.state} {initialData.shippingAddress?.postalCode}<br />
                  {initialData.shippingAddress?.country}
                </Typography>
              </div>

              <Divider className="mb-6" />

              {/* Stripe payment form wrapped in Elements provider */}
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  onPaymentSuccess={handlePaymentSuccess}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                  orderSummary={totals} 
                  cartItems={initialData.cartItems} 
                  selectedAddress={initialData.client.shippingAddress}
                  selectedShipping={initialData.client.shippingMethod}
                  user={initialData.client}
                />
              </Elements>
              
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
} 