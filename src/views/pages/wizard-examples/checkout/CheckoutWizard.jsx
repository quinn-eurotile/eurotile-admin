'use client'

// React Imports
import { useState, useEffect, createContext, useCallback, useContext } from 'react'

// Next Auth Import
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MuiStepper from '@mui/material/Stepper'
import { styled } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import StepCart from './StepCart'
import StepAddress from './StepAddress'
import StepPayment from './StepPayment'
import StepConfirmation from './StepConfirmation'
import DirectionalIcon from '@components/DirectionalIcon'
import AddEditAddress from '@components/dialogs/add-edit-address'

// Styled Component Imports
import StepperWrapper from '@core/styles/stepper'
import { Tooltip } from '@mui/material'

// Context for sharing checkout data between steps
export const CheckoutContext = createContext({
  cartItems: [],
  addresses: [],
  selectedAddress: null,
  selectedShipping: 'standard',
  orderSummary: {},
  user: null,
  setCartItems: () => { },
  setAddresses: () => { },
  setSelectedAddress: () => { },
  setSelectedShipping: () => { },
  setOrderSummary: () => { },
  isStepValid: () => false,
  setStepValid: () => { },
  setStepValid: () => { },
  loading: false
})

// Steps configuration
const steps = [
  {
    title: 'Your Basket',
    image: '/images/pages/shopping-cart-icon.png',
    size: '50px',
    icon: (
      <i class="ri-shopping-cart-2-line text-6xl text-white"></i>
    )
  },
  {
    title: 'Address & Delivery',
    image: '/images/pages/transport.png',
    size: '70px',
    icon: (
      <i class="ri-truck-line text-6xl text-white"></i>
    )
  },
  {
    title: 'Payment',
    image: '/images/pages/payment-protection.png',
    size: '65px',
    icon: (
      <i class="ri-bank-card-line text-6xl text-white"></i>
    )
  },
  {
    title: 'Confirmation',
    image: '/images/pages/checkmark.png',
    size: '50px',
    icon: (

      <i class="ri-checkbox-circle-line text-6xl text-white"></i>
    )
  }
]

// Styled Components
const Stepper = styled(MuiStepper)(({ theme }) => ({
  justifyContent: "center",
  "& .MuiStep-root": {
    "& + svg": {
      display: "none",
      color: "var(--mui-palette-text-disabled)",
    },
    "& .MuiStepLabel-label": {
      display: "flex",
      cursor: "pointer",
      alignItems: "center",
      svg: {
        marginRight: theme.spacing(1.5),
        fill: "var(--mui-palette-text-primary)",
      },
      "&.Mui-active": {
        "& .MuiTypography-root": {
          color: "var(--mui-palette-primary-main)",
          fontWeight: 600,
        },
        "& svg": {
          fill: "var(--mui-palette-primary-main)",
        },
      },
      "&.Mui-completed": {
        "& .MuiTypography-root": {
          color: "var(--mui-palette-primary-main)",
        },
        "& svg": {
          fill: "var(--mui-palette-primary-main)",
        },
      },
      "&.Mui-disabled": {
        "& .MuiTypography-root": {
          color: "var(--mui-palette-text-disabled)",
        },
        "& svg": {
          fill: "var(--mui-palette-text-disabled)",
        },
      },
    },
    "&.Mui-completed + i": {
      color: "var(--mui-palette-primary-main) !important",
    },
    [theme.breakpoints.up("md")]: {
      paddingBottom: 0,
      "& + svg": {
        display: "block",
      },
      "& .MuiStepLabel-label": {
        display: "block",
      },
    },
  },
}));

const getStepContent = (step, handleNext, handleBack, checkoutData) => {
  switch (step) {
    case 0:
      return <StepCart handleNext={handleNext} {...checkoutData} />
    case 1:
      return <StepAddress handleNext={handleNext} {...checkoutData} />
    case 2:
      return (
        <StepPayment
          handleNext={handleNext}
          handleBack={handleBack}
          {...checkoutData}
        />
      )
    case 3:
      return <StepConfirmation {...checkoutData} />
    default:
      return null
  }
}

const CheckoutWizard = ({ initialData }) => {
  // Get user session
  const { data: session, status } = useSession()
  // //console.log(initialData, 'initialData 3142');
  // States
  const [activeStep, setActiveStep] = useState(0)
  const [cartItems, setCartItems] = useState(initialData?.cartItems || [])
  const [cartData, setCartData] = useState(initialData?.cartData || [])
  const [addresses, setAddresses] = useState(initialData?.addresses || [])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [user, setUser] = useState(session?.user)
  const [selectedShipping, setSelectedShipping] = useState('standard')
  const [orderSummary, setOrderSummary] = useState(
    initialData?.orderSummary || {
      subtotal: 0,
      shipping: 0,
      vat: 0,
      total: 0
    }
  )
  const [stepValidation, setStepValidation] = useState({
    0: cartItems.length > 0, // Cart step is valid if there are items
    1: false, // Address step requires selection
    2: true, // Payment step requires valid payment
    3: true // Confirmation step is always valid
  })
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [addressData, setAddressData] = useState(null)

  //console.log('stepValidation', stepValidation)
  // Check if step is valid
  const isStepValid = step => stepValidation[step]

  // Set step validation with side effects
  const setStepValid = useCallback((step, isValid) => {
    if (step < 0 || step > 3) {
      console.error('Invalid step number:', step)
      return
    }
    setStepValidation(prev => ({
      ...prev,
      [step]: isValid
    }))
  }, [])

  // Effect to validate steps when dependencies change
  useEffect(() => {
    // Validate cart step
    setStepValid(0, cartItems.length > 0)
  }, [cartItems, setStepValid])

  useEffect(() => {
    // Validate address step
    setStepValid(1, selectedAddress !== null)
  }, [selectedAddress, setStepValid])

  useEffect(() => {
    // Validate payment step (you can add more conditions)
    setStepValid(2, false) // Set this based on your payment validation logic
  }, [setStepValid])

  // Handle next step with validation
  const handleNext = async () => {
    if (activeStep === 2) {
      setActiveStep(3)
    } else {
      if (isStepValid(activeStep)) {
        // Perform any necessary actions before moving to next step

        switch (activeStep) {
          case 0: // Cart
            if (cartItems.length === 0) {
              return
            }
            break

          case 1: // Address
            if (!selectedAddress) {
              return
            }
            break

          case 2: // Payment
            // Add your payment validation logic here
            break

          default:
            break
        }

        setActiveStep(prev => {
          const nextStep = prev + 1
          return Math.min(nextStep, 3)
        })
      }
    }
  }

  // Handle back step
  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  // Handle address success
  const handleAddressSuccess = address => {
    setAddresses([...addresses, address])
    setSelectedAddress(address)
  }

  // Handle address close
  const handleClose = () => {
    setOpen(false)
  }

  // Calculate order summary with VAT
  const calculateOrderSummary = useCallback(() => {
    if (!cartItems || cartItems.length === 0) return {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      vat: 0,
      total: 0
    };

    // Calculate subtotal from cart items
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Get other values
    const discount = orderSummary?.discount || 0;
    const shipping = orderSummary?.shipping || 0;
    const shippingOption = orderSummary?.shippingOption || null;

    // Calculate VAT on subtotal minus discount
    const vatRate = initialData?.adminSettings?.vatOnOrder || 0;
    const vat = ((subtotal - discount) * vatRate) / 100;

    // Calculate final total
    const total = subtotal - discount + shipping + vat;

    return {
      subtotal,
      discount,
      shipping,
      vat,
      total,
      vatRate,
      shippingOption
    };
  }, [cartItems, orderSummary?.discount, selectedShipping, initialData?.adminSettings?.vatOnOrder]);

  // Update order summary when dependencies change
  useEffect(() => {
    const newSummary = calculateOrderSummary();
    setOrderSummary(newSummary);
  }, [calculateOrderSummary]);

  // Context value
  const contextValue = {
    cartItems,
    setCartItems,
    addresses,
    setAddresses,
    selectedAddress,
    setSelectedAddress,
    selectedShipping,
    setSelectedShipping,
    orderSummary,
    setOrderSummary,
    isStepValid,
    setStepValid,
    loading,
    user: session?.user,
    adminSettings: initialData?.adminSettings,
    calculateOrderSummary
  }

  if (status === 'loading') {
    return (
      <Card>
        <CardContent className='flex justify-center items-center py-10'>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }


  return (
    <CheckoutContext.Provider value={contextValue}>
      <Card>
        <CardContent>
          <StepperWrapper>
            <Stepper
              className="gap-10 md:gap-4 items-center"
              activeStep={activeStep}
              connector={
                <DirectionalIcon
                  ltrIconClass="ri-arrow-right-s-line"
                  rtlIconClass="ri-arrow-left-s-line"
                  className="mli-12 hidden md:block text-lg text-textDisabled"
                />
              }
            >
              {steps.map((step, index) => {
                // Only allow clicking on steps up to the current step, but not on the last step
                const isStepClickable = index <= activeStep && activeStep !== 3;
                return (
                  <Step
                    key={index}
                    onClick={() => {
                      if (isStepClickable) {
                        setActiveStep(index);
                        localStorage.setItem("checkoutStep", index.toString());
                      }
                    }}
                    sx={{
                      cursor: isStepClickable ? 'pointer' : 'not-allowed',
                      opacity: isStepClickable ? 1 : 0.5,
                    }}
                  >
                    <StepLabel
                      icon={<></>}
                      className={`text-center ${!isStepClickable ? 'Mui-disabled' : ''}`}
                    >
                      <div className='flex flex-col items-center justify-center gap-2'>
                        <div className="flex items-center justify-center bg-red-800 rounded-full" style={{ height: '100px', width: '100px' }}>
                          {/* {step.icon} */}
                          <img src={step.image} width={step.size} />
                        </div>
                        <Typography
                          className="step-title"
                          sx={{
                            color: index === activeStep
                              ? 'primary.main'
                              : index < activeStep
                                ? 'primary.main'
                                : 'text.disabled',
                            fontWeight: index === activeStep ? 600 : 400,
                          }}
                        >
                          {step.title} 
                        </Typography>
                      </div>

                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </StepperWrapper>
        </CardContent>

        <Divider />

        <CardContent>
          {getStepContent(activeStep, handleNext, handleBack, {
            cartItems,
            addresses,
            selectedAddress,
            selectedShipping,
            orderSummary,
            adminSettings: initialData?.adminSettings,
            user
          })}
        </CardContent>
      </Card>

      <AddEditAddress
        open={open}
        setOpen={setOpen}
        data={addressData}
        onClose={handleClose}
        onSuccess={handleAddressSuccess}
      />

      <div className="mt-12">
        <Tooltip
          title={
            "Tiles from the same supplier qualify for combined pricing tiers —\nbundle more to unlock bigger savings."
          }
          arrow
        >
          <h2 className="text-2xl font-medium text-red-800 mb-6 text-center">
            Add more from{" "}
            {/* <Link
              href={{
                pathname: `/${locale}/products`,
                query: { supplier: product?.supplier?._id },
              }}
              className="underline hover:text-primary cursor-pointer"
            >
              {product?.supplier?.companyName || ""}
            </Link>{" "} */}
            for better discounts
          </h2>
        </Tooltip>

        {/* <RelatedProductGrid products={product?.associatedProducts || []} /> */}
      </div>
    </CheckoutContext.Provider>
  )
}

export default CheckoutWizard
