"use client";

// React Imports
import { useState, useEffect, useContext } from "react";

// Next Imports
import Link from "next/link";

// MUI Imports
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Rating from "@mui/material/Rating";
import CardContent from "@mui/material/CardContent";
import Collapse from "@mui/material/Collapse";
import Fade from "@mui/material/Fade";
import CircularProgress from "@mui/material/CircularProgress";


// Component Imports
import DirectionalIcon from "@components/DirectionalIcon";

// Context Import
import { CheckoutContext } from "./CheckoutWizard";
import { cartApi } from "@/services/cart/index";
import { removeCartItem, updateCartItem } from "@/app/server/actions";
import { toast } from "react-toastify";

// API Import


const StepCart = ({ handleNext }) => {
  // States
  const [openCollapse, setOpenCollapse] = useState(true);
  const [openFade, setOpenFade] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Context
  const {
    cartItems,
    setCartItems,
    orderSummary,
    setOrderSummary,
    setStepValid,
    loading,
    user,
    adminSettings,
    calculateOrderSummary
  } = useContext(CheckoutContext);

  //console.log(cartItems, 'cartItems.............');

  useEffect(() => {
    if (!openFade) {
      setTimeout(() => {
        setOpenCollapse(false);
      }, 300);
    }
  }, [openFade]);

  // Update cart item quantity
  const updateItemQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    setError("");
    try {
      const response = await updateCartItem(itemId, newQuantity);
      //console.log(response, 'response updateCartItem');
      if (response.success) {
        const { items, orderSummary: newOrderSummary } = response.data;
        setCartItems(items);
        setOrderSummary(newOrderSummary);
      } else {
        setError(response.message || "Error updating cart");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      setError("Failed to update cart item");
    } finally {
      setIsUpdating(false);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    setIsUpdating(true);
    setError("");
    try {
      const response = await removeCartItem(itemId);

      if (response.success) {
        const { items, orderSummary: newOrderSummary } = response.data;
        setCartItems(items);
        setOrderSummary(newOrderSummary);
        setStepValid(0, items.length > 0);
      } else {
        setError(response.message || "Error removing item");
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      setError("Failed to remove item from cart");
    } finally {
      setIsUpdating(false);
    }
  };

  // Move item to wishlist
  const moveToWishlist = async (itemId) => {
    setIsUpdating(true);
    setError("");
    try {
      const response = await cartApi.addToWishlist(itemId);

      if (response.success) {
        // Remove from cart after adding to wishlist
        await removeItem(itemId);
      } else {
        setError(response.message || "Error moving item to wishlist");
      }
    } catch (error) {
      console.error("Error moving item to wishlist:", error);
      setError("Failed to move item to wishlist");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setIsUpdating(true);
    setError("");
    try {
      const response = await cartApi.applyPromoCode(couponCode);

      if (response.success) {
        const { orderSummary: newOrderSummary } = response.data;
        setOrderSummary(newOrderSummary);
        setCouponCode("");
        setShowCouponInput(false);
        toast.success("Coupon applied successfully!");
      } else {
        setError(response.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setError("Failed to apply coupon");
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if cart is empty and update validation
  useEffect(() => {
    setStepValid(0, cartItems.length > 0);
  }, [cartItems, setStepValid]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <CircularProgress />
      </div>
    );
  }
  // // //console.log(JSON.stringify(orderSummary, null, 2), 'orderSummary');

  console.log(cartItems, 'cartItemscartItems')
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 8 }} className="flex flex-col gap-4">
        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* <Collapse in={openCollapse}>
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
        </Collapse> */}

        <Typography className="rounded" variant="h4">
          {/* My Shopping Bag ({cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}) */}
          Your Basket
        </Typography>

        {cartItems.length === 0 ? (
          <Alert severity="info">Your cart is empty. Please add items to your cart to continue shopping.</Alert>
        ) : (
          <div className="border rounded">
            {cartItems.map((product, index) => {
              const prod = product.product;
              const variation = product.variation;
              const locale = typeof window !== 'undefined' ? (window.location.pathname.split('/')[1] || 'en') : 'en';
              // Attribute extraction helpers
              const getAttr = (slug) => variation?.attributeVariations?.find(av => av.metaKey === slug);
              const sizeAttr = getAttr('size');
              const thicknessAttr = getAttr('thinkness') || getAttr('thickness');
              const finishAttr = getAttr('finish');
              const colorAttr = getAttr('color');
              // Fallbacks
              const size = sizeAttr?.metaValue || `${variation?.dimensions?.width || ''}x${variation?.dimensions?.length || ''}`;
              const thickness = thicknessAttr?.metaValue || variation?.dimensions?.height;
              const finish = finishAttr?.metaValue || 'N/A';
              // Box logic
              const boxSize = variation?.boxSize || 1;
              const boxes = product?.quantity || 0;
              const sqm = (boxes * boxSize).toFixed(2);
              return (
                <div
                  key={product._id || index}
                  className="relative p-5 gap-4 [&:not(:last-child)]:border-be"
                >
                  <IconButton
                    size="small"
                    className="absolute block-start-2 inline-end-2"
                    onClick={() => removeItem(product._id)}
                    disabled={isUpdating}
                  >
                    <i className="ri-close-line text-lg" />
                  </IconButton>

                  <div className="flex flex-col sm:flex-row sm:justify-between w-full mt-6">
                    <img
                      height={140}
                      width={140}
                      src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${variation?.variationImages?.[0]?.filePath}` || "/placeholder.svg?height=140&width=140"}
                      alt={prod?.name || 'Product Image'}
                      className="object-cover rounded-lg"
                    />

                    <div className="flex flex-col sm:flex-row items-center sm:justify-between w-full">
                      <div className="flex flex-col  items-center sm:items-start">
                        {/* Tile Name (linked) */}
                        <Typography className="font-medium text-red-800 mb-3">
                          <Link
                            href={`/${locale}/products/${prod?._id}?vid=${variation?._id}`}
                            className="underline hover:text-primary cursor-pointer"
                          >
                            {prod?.name}
                          </Link>
                        </Typography>
                        {/* Factory Name (linked) */}
                        <Typography className="text-sm text-black">
                          Factory: {prod?.supplier ? (
                            <Link
                              href={{ pathname: `/${locale}/products`, query: { supplier: prod?.supplier?._id } }}
                              className="underline hover:text-primary cursor-pointer text-red-800"
                            >
                              {prod?.supplier?.companyName}
                            </Link>
                          ) : 'N/A'}
                        </Typography>
                        {/* Collection Name (linked) */}
                        <Typography className="text-sm text-black">
                          Collection: {variation?.categories?.length > 0 ? variation.categories.map((cat, idx) => (
                            <Link
                              key={cat._id}
                              href={{ pathname: `/${locale}/products`, query: { category: cat._id } }}
                              className="underline hover:text-primary cursor-pointer text-red-800"
                              style={{ marginRight: 4 }}
                            >
                              {cat.name}{idx < variation.categories.length - 1 ? ', ' : ''}
                            </Link>
                          )) : 'N/A'}
                        </Typography>
                        {/* Size, Thickness, Finish */}

                        <Typography className="text-sm text-black">Size: <span>{size || 'N/A'}</span></Typography>

                        <Typography className="text-sm text-black">Thickness: <span>{thickness || 'N/A'}</span></Typography>

                        <Typography className="text-sm text-black">Color: <span>{colorAttr?.metaValue || 'N/A'}</span></Typography>


                     

                      </div>

                      <div className="flex flex-col justify-between items-center mt-4 gap-3 sm:items-end">
                        <div className="flex flex-col items-end">
                          <Typography variant="h6" color="primary.main" className="font-semibold">
                            £{(product?.price || 0).toFixed(2)}/SQ.M
                          </Typography>
                          <Typography color="text.secondary" className="text-sm font-semibold ">
                            Total (ex.VAT): <br /> £{((product?.price || 0) * (product?.quantity || 0)).toFixed(2)}
                          </Typography>
                          {product?.isCustomPrice && (
                            <Chip
                              size="small"
                              variant="tonal"
                              color="info"
                              label="Custom Price"
                              className="mt-1"
                            />
                          )}
                        </div>
                      </div>

                    </div>

                       
                  </div>
                  {/* Quantity Controls */}
                        <div className="flex items-center gap-4 mt-6">
                          <TextField
                            size="small"
                            type="number"
                            value={boxes}
                            onChange={(e) => updateItemQuantity(product._id, Number(e.target.value))}
                            className="block max-w-[130px]"
                            disabled={isUpdating}
                            inputProps={{ min: 1, step: 1 }}
                            label="No. of Boxes"
                          />
                          <TextField
                            size="small"
                            value={sqm}
                            className="block max-w-[130px]"
                            label="Total SQ.M"
                            InputProps={{ readOnly: true }}
                          />
                        </div>

                </div>
              );
            })}
          </div>
        )}

        {/* <Typography
          href="/"
          component={Link}
          onClick={(e) => e.preventDefault()}
          className="flex items-center font-medium justify-between gap-4 plb-2 pli-5 border rounded"
          color="primary.main"
        >
          Add more products from wishlist
          <DirectionalIcon
            ltrIconClass="ri-arrow-right-s-line"
            rtlIconClass="ri-arrow-left-s-line"
            className="text-base"
          />
        </Typography> */}
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }} className="flex flex-col gap-2">


        <div className="border rounded">
          <CardContent className="flex gap-4 flex-col">
            <Typography className="font-medium" color="text.primary">
              Subtotal (Standard Delivery Included)
            </Typography>
            <Typography className="font-medium" color="text.primary">
              Price Details
            </Typography>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Typography color="text.primary"> Items Subtotal (ex. VAT)</Typography>
                <Typography>£{orderSummary?.subtotal?.toFixed(2)}</Typography>
              </div>

              {/* <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Typography color="text.primary">Coupon Discount</Typography>
                  {!showCouponInput ? (
                    <Button
                      color="primary"
                      onClick={() => setShowCouponInput(true)}
                      disabled={isUpdating}
                    >
                      Apply Coupon
                    </Button>
                  ) : (
                    <Typography color="success.main">
                      -£{orderSummary.discount?.toFixed(2)}
                    </Typography>
                  )}
                </div>

                {showCouponInput && (
                  <div className="flex gap-2">
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={isUpdating}
                    />
                    <Button
                      variant="contained"
                      onClick={handleApplyCoupon}
                      disabled={isUpdating || !couponCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div> */}

              {/* <div className="flex items-center justify-between">
                <Typography color="text.primary">Shipping Charges</Typography>
                <div className="flex items-center gap-2">
                  {orderSummary?.shipping > 0 ? (
                    <Typography>£{orderSummary?.shipping?.toFixed(2)}</Typography>
                  ) : (
                    <>
                      <Typography color="text.disabled" className="line-through">
                        £5.00
                      </Typography>
                      <Chip variant="tonal" size="small" color="success" label="Free" />
                    </>
                  )}
                </div>
              </div> */}

              <div className="flex items-center justify-between">
                <Typography color="text.primary">VAT ({orderSummary?.vatRate || 0}%)</Typography>
                <Typography>£{orderSummary?.vat?.toFixed(2)}</Typography>
              </div>

              {error && (
                <Alert severity="error" onClose={() => setError("")}>
                  {error}
                </Alert>
              )}
            </div>
          </CardContent>
          <Divider />
          <CardContent>
            <div className="flex items-center justify-between">
              <Typography className="font-medium" color="text.primary">
                Total Amount
              </Typography>
              <Typography className="font-medium" color="text.primary">
                £{orderSummary?.total?.toFixed(2)}
              </Typography>
            </div>
          </CardContent>
        </div>

        <div className="flex justify-normal sm:justify-end xl:justify-normal">
          <Button
            fullWidth
            size="large"
            variant="contained"
            onClick={handleNext}
            disabled={cartItems.length === 0 || isUpdating}
            className="bg-red-800 hover:bg-red-900 font-bold"
          >
            {isUpdating ? (
              <CircularProgress size={24} />
            ) : (
              <>
                Next: Choose Delivery Option
                <i className="ri-arrow-right-line ml-2"></i>
              </>
            )}
          </Button>
        </div>

      </Grid>
    </Grid>
  );
};

export default StepCart;
