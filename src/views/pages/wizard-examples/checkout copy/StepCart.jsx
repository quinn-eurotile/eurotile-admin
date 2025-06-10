// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import Fade from '@mui/material/Fade'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'

// Redux Imports
import { useSelector, useDispatch } from 'react-redux'
import { updateQuantity, removeFromCart } from '@/redux-store/slices/cart'

const StepCart = ({ handleNext }) => {
  // States
  const [openCollapse, setOpenCollapse] = useState(true)
  const [openFade, setOpenFade] = useState(true)
  const dispatch = useDispatch()
  const cart = useSelector(state => state.cartReducer)

  useEffect(() => {
    if (!openFade) {
      setTimeout(() => {
        setOpenCollapse(false)
      }, 300)
    }
  }, [openFade])

  const handleQuantityChange = (itemId, newQuantity) => {
    const quantity = parseInt(newQuantity)
    if (quantity > 0) {
      dispatch(updateQuantity({ productId: itemId, quantity }))
    }
  }

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart({ productId: itemId }))
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 8 }} className='flex flex-col gap-4'>
        <Collapse in={openCollapse}>
          <Fade in={openFade} timeout={{ exit: 300 }}>
            <Alert
              icon={<i className='ri-percent-line' />}
              action={
                <IconButton
                  aria-label='close'
                  color='inherit'
                  size='small'
                  onClick={() => {
                    setOpenFade(false)
                  }}
                >
                  <i className='ri-close-line' />
                </IconButton>
              }
            >
              <AlertTitle>Available Offers</AlertTitle>
              <Typography color='success.main'>
                - 10% Instant Discount on Bank of America Corp Bank Debit and Credit cards
              </Typography>
              <Typography color='success.main'>
                - 25% Cashback Voucher of up to $60 on first ever PayPal transaction. TCA
              </Typography>
            </Alert>
          </Fade>
        </Collapse>
        <Typography className='rounded' variant='h5'>
          My Shopping Bag ({cart.totalItems} Items)
        </Typography>
        <div className='border rounded'>
          {cart.items && cart.items.length > 0 ? (
            cart.items.map((item) => (
              <div
                key={item.id}
                className='flex flex-col sm:flex-row items-center relative p-5 gap-4 [&:not(:last-child)]:border-be'
              >
                <img 
                  height={140} 
                  width={140} 
                  src={item.image || '/placeholder.svg'} 
                  alt={item.name || 'Product'} 
                />
                <IconButton 
                  size='small' 
                  className='absolute block-start-2 inline-end-2'
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <i className='ri-close-line text-lg' />
                </IconButton>
                <div className='flex flex-col sm:flex-row items-center sm:justify-between is-full'>
                  <div className='flex flex-col gap-2 items-center sm:items-start'>
                    <Typography className='font-medium' color='text.primary'>
                      {item.name}
                    </Typography>
                    <div className='flex items-center gap-4'>
                      <div className='flex items-center gap-1'>
                        <Typography color='text.disabled'>Sold By:</Typography>
                        <Typography href='/' component={Link} onClick={e => e.preventDefault()} color='primary.main'>
                          {item.supplier || 'Supplier'}
                        </Typography>
                      </div>
                      <Chip 
                        size='small' 
                        variant='tonal' 
                        color={item.inStock ? 'success' : 'error'} 
                        label={item.inStock ? 'In Stock' : 'Out of Stock'} 
                      />
                    </div>
                    <TextField 
                      size='small' 
                      type='number' 
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className='block max-is-[100px]' 
                      inputProps={{ min: 1 }}
                    />
                  </div>
                  <div className='flex flex-col justify-between items-center mt-4 gap-1 sm:items-end'>
                    <div className='flex'>
                      <Typography color='primary.main'>{`£${item.price.toFixed(2)}`}</Typography>
                      {item.originalPrice && (
                        <>
                          <span className='text-textSecondary'>/</span>
                          <Typography className='line-through'>{`£${item.originalPrice.toFixed(2)}`}</Typography>
                        </>
                      )}
                    </div>
                    <Typography color='text.primary'>
                      Total: £{(item.price * item.quantity).toFixed(2)}
                    </Typography>
                    <Button variant='outlined' size='small'>
                      Move to wishlist
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='p-5 text-center'>
              <Typography>Your cart is empty</Typography>
            </div>
          )}
        </div>
        <Typography
          href='/'
          component={Link}
          onClick={e => e.preventDefault()}
          className='flex items-center font-medium justify-between gap-4 plb-2 pli-5 border rounded'
          color='primary.main'
        >
          Add more products from wishlist
          <DirectionalIcon
            ltrIconClass='ri-arrow-right-s-line'
            rtlIconClass='ri-arrow-left-s-line'
            className='text-base'
          />
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }} className='flex flex-col gap-2'>
        <div className='border rounded'>
          <CardContent className='flex flex-col gap-4'>
            <Typography className='font-medium' color='text.primary'>
              Offer
            </Typography>
            <div className='flex gap-4'>
              <TextField fullWidth size='small' placeholder='Enter Promo Code' />
              <Button variant='outlined' className='normal-case'>
                Apply
              </Button>
            </div>
            <div className='flex flex-col gap-2 p-5 rounded bg-actionHover'>
              <Typography className='font-medium' color='text.primary'>
                Buying gift for a loved one?
              </Typography>
              <Typography>Gift wrap and personalized message on card, Only for $2.</Typography>
              <Typography
                href='/'
                component={Link}
                onClick={e => e.preventDefault()}
                color='primary.main'
                className='font-medium'
              >
                Add a gift wrap
              </Typography>
            </div>
          </CardContent>
          <Divider />
          <CardContent className='flex gap-4 flex-col'>
            <Typography className='font-medium' color='text.primary'>
              Price Details
            </Typography>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center flex-wrap justify-between'>
                <Typography color='text.primary'>Bag Total</Typography>
                <Typography>£{cart.totalAmount.toFixed(2)}</Typography>
              </div>
              <div className='flex items-center flex-wrap justify-between'>
                <Typography color='text.primary'>Coup Discount</Typography>
                <Typography href='/' component={Link} onClick={e => e.preventDefault()} color='primary.main'>
                  Apply Coupon
                </Typography>
              </div>
              <div className='flex items-center flex-wrap justify-between'>
                <Typography color='text.primary'>Order Total</Typography>
                <Typography>£{cart.totalAmount.toFixed(2)}</Typography>
              </div>
              <div className='flex items-center flex-wrap justify-between'>
                <Typography color='text.primary'>Delivery Charges</Typography>
                <div className='flex items-center gap-2'>
                  <Typography color='text.disabled' className='line-through'>
                    £5.00
                  </Typography>
                  <Chip variant='tonal' size='small' color='success' label='Free' />
                </div>
              </div>
            </div>
          </CardContent>
          <Divider />
          <CardContent>
            <div className='flex items-center flex-wrap justify-between'>
              <Typography className='font-medium' color='text.primary'>
                Total
              </Typography>
              <Typography className='font-medium' color='text.primary'>
                £{cart.totalAmount.toFixed(2)}
              </Typography>
            </div>
          </CardContent>
        </div>
        <div className='flex justify-normal sm:justify-end xl:justify-normal'>
          <Button 
            fullWidth 
            variant='contained' 
            onClick={handleNext}
            disabled={!cart.items || cart.items.length === 0}
          >
            Place Order
          </Button>
        </div>
      </Grid>
    </Grid>
  )
}

export default StepCart
