"use client";

// React Imports
import { useContext } from "react";

// Next Imports
import Link from "next/link";

// MUI Imports
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CardContent from "@mui/material/CardContent";

// Context Import
import { CheckoutContext } from "./CheckoutWizard";

const StepConfirmation = () => {
  const { cartItems, orderSummary, selectedAddress, addresses, selectedShipping, user } = useContext(CheckoutContext);

  // Get selected address details
  const selectedAddressDetails = addresses.find((addr) => addr.id === selectedAddress);

  // Generate order ID (in real app, this would come from the server)
  const orderId = `#${Date.now().toString().slice(-8)}`;

  // Get current date and time
  const currentDate = new Date().toLocaleString();

  // Get shipping method details
  const getShippingMethodName = () => {
    switch (selectedShipping) {
      case "express":
        return "Express Delivery";
      case "overnight":
        return "Overnight Delivery";
      default:
        return "Standard Delivery";
    }
  };

  const getShippingDescription = () => {
    switch (selectedShipping) {
      case "express":
        return "(Normally 3-4 business days)";
      case "overnight":
        return "(Next business day)";
      default:
        return "(Normally 5-7 business days)";
    }
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
  console.log('cartItems', cartItems);

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <div className="flex items-center flex-col text-center gap-4">
          <Typography variant="h4">Thank You! 😇</Typography>
          <Typography>
            Your order <span className="font-medium text-textPrimary">{orderId}</span> has been placed!
          </Typography>
          <div>
            <Typography>
              We sent an email to <span className="font-medium text-textPrimary">{user?.email || "your email"}</span>{" "}
              with your order confirmation and receipt.
            </Typography>
            <Typography>
              If the email hasn't arrived within two minutes, please check your spam folder to see if the email was
              routed there.
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <i className="ri-time-line text-xl" />
            <Typography>Time placed: {currentDate}</Typography>
          </div>
        </div>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <div className="flex flex-col md:flex-row border rounded">
          <div className="flex flex-col is-full p-5 gap-4 items-center sm:items-start max-md:[&:not(:last-child)]:border-be md:[&:not(:last-child)]:border-ie">
            <div className="flex items-center gap-2">
              <i className="ri-map-pin-line text-xl text-textPrimary" />
              <Typography className="font-medium" color="text.primary">
                Shipping
              </Typography>
            </div>
            {selectedAddressDetails ? (
              <div>
                <Typography>{selectedAddressDetails.name}</Typography>
                <Typography>{selectedAddressDetails.street},</Typography>
                <Typography>
                  {selectedAddressDetails.city}, {selectedAddressDetails.state} {selectedAddressDetails.zipCode},
                </Typography>
                <Typography>USA</Typography>
              </div>
            ) : (
              <div>
                <Typography>John Doe</Typography>
                <Typography>4135 Parkway Street,</Typography>
                <Typography>Los Angeles, CA 90017,</Typography>
                <Typography>USA</Typography>
              </div>
            )}
            <Typography className="font-medium">{selectedAddressDetails?.phone || "+123456789"}</Typography>
          </div>

          <div className="flex flex-col is-full p-5 gap-4 items-center sm:items-start max-md:[&:not(:last-child)]:border-be md:[&:not(:last-child)]:border-ie">
            <div className="flex items-center gap-2">
              <i className="ri-bank-card-line text-xl text-textPrimary" />
              <Typography className="font-medium" color="text.primary">
                Billing Address
              </Typography>
            </div>
            {selectedAddressDetails ? (
              <div>
                <Typography>{selectedAddressDetails.name}</Typography>
                <Typography>{selectedAddressDetails.street},</Typography>
                <Typography>
                  {selectedAddressDetails.city}, {selectedAddressDetails.state} {selectedAddressDetails.zipCode},
                </Typography>
                <Typography>USA</Typography>
              </div>
            ) : (
              <div>
                <Typography>John Doe</Typography>
                <Typography>4135 Parkway Street,</Typography>
                <Typography>Los Angeles, CA 90017,</Typography>
                <Typography>USA</Typography>
              </div>
            )}
            <Typography className="font-medium">{selectedAddressDetails?.phone || "+123456789"}</Typography>
          </div>

          <div className="flex flex-col is-full p-5 gap-4 items-center sm:items-start">
            <div className="flex items-center gap-2">
              <i className="ri-ship-2-line text-xl text-textPrimary" />
              <Typography className="font-medium" color="text.primary">
                Shipping Method
              </Typography>
            </div>
            <Typography className="font-medium">Preferred Method:</Typography>
            <div>
              <Typography>{getShippingMethodName()}</Typography>
              <Typography>{getShippingDescription()}</Typography>
            </div>
          </div>
        </div>
      </Grid>

      <Grid size={{ xs: 12, md: 8, xl: 9 }}>
        <div className="border rounded">
          {cartItems.map((product, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center [&:not(:last-child)]:border-be">
              <img
                height={80}
                width={80}
                src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${product?.variation?.variationImages[0]?.filePath}` || "/placeholder.svg?height=80&width=80"}
                alt={product?.product?.name || 'Product Image'}
              />
              <div className="flex justify-between is-full p-5 flex-col sm:flex-row items-center sm:items-start">
                <div className="flex flex-col gap-2 items-center sm:items-start">
                  <Typography className="font-medium" color="text.primary">
                    {product?.product?.name}
                  </Typography>
                  <div className="flex items-center gap-1">
                    <Typography>Sold By:</Typography>
                    <Typography href="/" component={Link} onClick={(e) => e.preventDefault()} color="primary.main">
                      {product?.product?.supplier?.companyName || 'N/A'}
                    </Typography>
                  </div>
                  {product.inStock && <Chip variant="tonal" size="small" color="success" label="In Stock" />}
                  <Typography>Quantity: {product?.quantity}</Typography>
                </div>
                <div className="flex items-center">
                  <Typography color="primary.main">{`$${product.price}`}</Typography>
                  {product.originalPrice && (
                    <Typography color="text.disabled" className="line-through">
                      {`/$${product.originalPrice}`}
                    </Typography>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Grid>

      <Grid size={{ xs: 12, md: 4, xl: 3 }}>
        <div className="border rounded">
          <CardContent className="flex gap-4 flex-col">
            <Typography className="font-medium" color="text.primary">
              Price Details
            </Typography>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <Typography color="text.primary">Order Total</Typography>
                <Typography>${totals.subtotal?.toFixed(2) || "0.00"}</Typography>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Typography color="text.primary">Delivery Charges</Typography>
                <div className="flex gap-2">
                  {totals.shipping === 0 ? (
                    <>
                      <Typography className="line-through" color="text.disabled">
                        $5.00
                      </Typography>
                      <Chip variant="tonal" size="small" color="success" label="Free" />
                    </>
                  ) : (
                    <Typography>${totals.shipping?.toFixed(2) || "0.00"}</Typography>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <Divider />
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <Typography className="font-medium" color="text.primary">
                Total
              </Typography>
              <Typography className="font-medium" color="text.primary">
                ${totals.total?.toFixed(2) || "0.00"}
              </Typography>
            </div>
          </CardContent>
        </div>
      </Grid>
    </Grid>
  );
};

export default StepConfirmation;
