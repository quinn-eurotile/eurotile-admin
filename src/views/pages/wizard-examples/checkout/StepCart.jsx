"use client"

// React Imports
import { useState, useEffect, useContext } from "react"

// Next Imports
import Link from "next/link"

// MUI Imports
import Grid from "@mui/material/Grid2"
import Typography from "@mui/material/Typography"
import Alert from "@mui/material/Alert"
import AlertTitle from "@mui/material/AlertTitle"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton"
import Rating from "@mui/material/Rating"
import CardContent from "@mui/material/CardContent"
import Collapse from "@mui/material/Collapse"
import Fade from "@mui/material/Fade"
import CircularProgress from "@mui/material/CircularProgress"

// Component Imports
import DirectionalIcon from "@components/DirectionalIcon"

// Context Import
import { CheckoutContext } from "./CheckoutWizard"

const StepCart = ({ handleNext }) => {
  // States
  const [openCollapse, setOpenCollapse] = useState(true)
  const [openFade, setOpenFade] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [promoCode, setPromoCode] = useState("")

  // Context
  const { cartItems, setCartItems, orderSummary, setOrderSummary, setStepValid, loading } = useContext(CheckoutContext)


  useEffect(() => {
    if (!openFade) {
      setTimeout(() => {
        setOpenCollapse(false)
      }, 300)
    }
  }, [openFade])

  // Update cart item quantity
  const updateItemQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    setIsUpdating(true)
    try {
      const response = await fetch("/api/cart/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      })

      if (response.ok) {
        // Update local state
        const updatedItems = cartItems.map((item) => (item._id === itemId ? { ...item, count: newQuantity } : item))
        setCartItems(updatedItems)

        // Recalculate order summary
        const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.count, 0)
        setOrderSummary((prev) => ({
          ...prev,
          subtotal,
          total: subtotal + prev.shipping,
        }))
      }
    } catch (error) {
      console.error("Error updating cart:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Remove item from cart
  const removeItem = async (itemId) => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      })

      if (response.ok) {
        // Update local state
        const updatedItems = cartItems.filter((item) => item._id !== itemId)
        setCartItems(updatedItems)

        // Recalculate order summary
        const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.count, 0)
        setOrderSummary((prev) => ({
          ...prev,
          subtotal,
          total: subtotal + prev.shipping,
        }))

        // Update step validation
        setStepValid(0, updatedItems.length > 0)
      }
    } catch (error) {
      console.error("Error removing item from cart:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Move item to wishlist
  const moveToWishlist = async (itemId) => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/wishlist/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      })

      if (response.ok) {
        // Remove from cart after adding to wishlist
        await removeItem(itemId)
      }
    } catch (error) {
      console.error("Error moving item to wishlist:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Apply promo code
  const applyPromoCode = async () => {
    if (!promoCode.trim()) return

    setIsUpdating(true)
    try {
      const response = await fetch("/api/promo/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: promoCode,
          cartTotal: orderSummary.subtotal,
        }),
      })

      if (response.ok) {
        const { discount, newTotal } = await response.json()
        setOrderSummary((prev) => ({
          ...prev,
          discount,
          total: newTotal,
        }))
        setPromoCode("")
      }
    } catch (error) {
      console.error("Error applying promo code:", error)
    } finally {
      setIsUpdating(false)
    }
  }


  // Check if cart is empty and update validation
  useEffect(() => {
    setStepValid(0, cartItems.length > 0)
  }, [cartItems, setStepValid])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <CircularProgress />
      </div>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 8 }} className="flex flex-col gap-4">
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

        <Typography className="rounded" variant="h5">
          My Shopping Bag ({cartItems.length} {cartItems.length === 1 ? "Item" : "Items"})
        </Typography>

        {cartItems.length === 0 ? (
          <Alert severity="info">Your cart is empty. Please add items to your cart to continue shopping.</Alert>
        ) : (
          <div className="border rounded">
            {cartItems.map((product, index) => (
              <div
                key={product._id || index}
                className="flex flex-col sm:flex-row items-center relative p-5 gap-4 [&:not(:last-child)]:border-be"
              >
                <img
                  height={140}
                  width={140}
                  src={product.imgSrc || "/placeholder.svg?height=140&width=140"}
                  alt={product.imgAlt || product.productName}
                />
                <IconButton
                  size="small"
                  className="absolute block-start-2 inline-end-2"
                  onClick={() => removeItem(product._id)}
                  disabled={isUpdating}
                >
                  <i className="ri-close-line text-lg" />
                </IconButton>
                <div className="flex flex-col sm:flex-row items-center sm:justify-between is-full">
                  <div className="flex flex-col gap-2 items-center sm:items-start">
                    <Typography className="font-medium" color="text.primary">
                      {product.productName}
                    </Typography>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Typography color="text.disabled">Sold By:</Typography>
                        <Typography href="/" component={Link} onClick={(e) => e.preventDefault()} color="primary.main">
                          {product.soldBy}
                        </Typography>
                      </div>
                      {product.inStock ? (
                        <Chip size="small" variant="tonal" color="success" label="In Stock" />
                      ) : (
                        <Chip size="small" variant="tonal" color="error" label="Out of Stock" />
                      )}
                    </div>
                    <Rating name={`product-rating-${product._id}`} value={product.rating || 0} readOnly />
                    {/* <TextField
                      size="small"
                      type="number"
                      value={product?.count}
                      onChange={(e) => updateItemQuantity(product._id, Number.parseInt(e.target.value), 10)}
                      className="block max-is-[100px]"
                      disabled={isUpdating}
                      inputProps={{ min: 1, step: 1 }}

                    /> */}
                  </div>
                  <div className="flex flex-col justify-between items-center mt-4 gap-1 sm:items-end">
                    <div className="flex">
                      <Typography color="primary.main">{`$${product.price}`}</Typography>
                      {product.originalPrice && (
                        <>
                          <span className="text-textSecondary">/</span>
                          <Typography className="line-through">{`$${product.originalPrice}`}</Typography>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => moveToWishlist(product._id)}
                      disabled={isUpdating}
                    >
                      Move to wishlist
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Typography
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
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }} className="flex flex-col gap-2">
        <div className="border rounded">
          <CardContent className="flex flex-col gap-4">
            <Typography className="font-medium" color="text.primary">
              Offer
            </Typography>
            {/* <div className="flex gap-4">
              <TextField
                fullWidth
                size="small"
                placeholder="Enter Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button
                variant="outlined"
                className="normal-case"
                onClick={applyPromoCode}
                disabled={isUpdating || !promoCode.trim()}
              >
                Apply
              </Button>
            </div> */}
            <div className="flex flex-col gap-2 p-5 rounded bg-actionHover">
              <Typography className="font-medium" color="text.primary">
                Buying gift for a loved one?
              </Typography>
              <Typography>Gift wrap and personalized message on card, Only for $2.</Typography>
              <Typography
                href="/"
                component={Link}
                onClick={(e) => e.preventDefault()}
                color="primary.main"
                className="font-medium"
              >
                Add a gift wrap
              </Typography>
            </div>
          </CardContent>
          <Divider />
          <CardContent className="flex gap-4 flex-col">
            <Typography className="font-medium" color="text.primary">
              Price Details
            </Typography>
            <div className="flex flex-col gap-2">
              <div className="flex items-center flex-wrap justify-between">
                <Typography color="text.primary">Bag Total</Typography>
                <Typography>${orderSummary.subtotal?.toFixed(2) || "0.00"}</Typography>
              </div>
              <div className="flex items-center flex-wrap justify-between">
                <Typography color="text.primary">Coup Discount</Typography>
                <Typography href="/" component={Link} onClick={(e) => e.preventDefault()} color="primary.main">
                  Apply Coupon
                </Typography>
              </div>
              <div className="flex items-center flex-wrap justify-between">
                <Typography color="text.primary">Order Total</Typography>
                <Typography>${orderSummary.subtotal?.toFixed(2) || "0.00"}</Typography>
              </div>
              <div className="flex items-center flex-wrap justify-between">
                <Typography color="text.primary">Delivery Charges</Typography>
                <div className="flex items-center gap-2">
                  <Typography color="text.disabled" className="line-through">
                    $5.00
                  </Typography>
                  <Chip variant="tonal" size="small" color="success" label="Free" />
                </div>
              </div>
            </div>
          </CardContent>
          <Divider />
          <CardContent>
            <div className="flex items-center flex-wrap justify-between">
              <Typography className="font-medium" color="text.primary">
                Total
              </Typography>
              <Typography className="font-medium" color="text.primary">
                ${orderSummary.total?.toFixed(2) || "0.00"}
              </Typography>
            </div>
          </CardContent>
        </div>
        <div className="flex justify-normal sm:justify-end xl:justify-normal">
          <Button fullWidth variant="contained" onClick={handleNext} disabled={cartItems.length === 0 || isUpdating}>
            {isUpdating ? <CircularProgress size={24} /> : "Place Order"}
          </Button>
        </div>
      </Grid>
    </Grid>
  )
}

export default StepCart
