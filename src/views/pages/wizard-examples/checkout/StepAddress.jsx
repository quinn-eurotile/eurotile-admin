"use client"

// React Imports
import { useState, useEffect, useContext } from "react"

// MUI Imports
import Grid from "@mui/material/Grid2"
import Typography from "@mui/material/Typography"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import Button from "@mui/material/Button"
import CardContent from "@mui/material/CardContent"
import { styled } from "@mui/material/styles"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"

// Third-party Imports
import classnames from "classnames"

// Component Imports
import CustomInputHorizontal from "@core/components/custom-inputs/Horizontal"
import CustomInputVertical from "@core/components/custom-inputs/Vertical"
import AddEditAddress from "@components/dialogs/add-edit-address"
import OpenDialogOnElementClick from "@components/dialogs/OpenDialogOnElementClick"

// Context Import
import { CheckoutContext } from "./CheckoutWizard"
import { deleteAddresses, getAddresses } from "@/app/server/actions"
import { cartApi } from "@/services/cart"

// Styled Components
const HorizontalContent = styled(Typography, {
  name: "MuiCustomInputHorizontal",
  slot: "content",
})({})

const VerticalContent = styled(Typography, {
  name: "MuiCustomInputVertical",
  slot: "content",
})({
  textAlign: "center",
})

const StepAddress = ({ handleNext }) => {
  // Context
  const {
    addresses,
    setAddresses,
    selectedAddress,
    setSelectedAddress,
    selectedShipping,
    setSelectedShipping,
    orderSummary,
    setOrderSummary,
    setStepValid,
    loading,
    user,
    cartItems, // Declare cartItems from context or props
  } = useContext(CheckoutContext)

  // States
  const [isUpdating, setIsUpdating] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState(null)
  const [open, setOpen] = useState(false);
  const [addressData, setAddressData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false)  // Add loading state

  // Button props for add address
  const buttonProps = {
    variant: "outlined",
    children: "Add New Address",
    className: "self-start",
  }


  // Shipping options
  const shippingOptions = [
    {
      value: "standard",
      title: "Standard",
      asset: "ri-user-3-line",
      content: (
        <>
          <Chip size="small" variant="tonal" label="Free" color="success" className="absolute inline-end-5" />
          <VerticalContent variant="body2" className="my-auto">
            Get your product in 1 Week.
          </VerticalContent>
        </>
      ),
    },
    {
      value: "express",
      title: "Express",
      asset: "ri-star-smile-line",
      content: (
        <>
          <Chip label="$10" variant="tonal" size="small" color="secondary" className="absolute inline-end-5" />
          <VerticalContent variant="body2" className="my-auto">
            Get your product in 3-4 days.
          </VerticalContent>
        </>
      ),
    },
    {
      value: "overnight",
      title: "Overnight",
      asset: "ri-vip-crown-line",
      content: (
        <>
          <Chip label="$15" variant="tonal" size="small" color="secondary" className="absolute inline-end-5" />
          <VerticalContent variant="body2" className="my-auto">
            Get your product in 1 day.
          </VerticalContent>
        </>
      ),
    },
  ]

  // Handle address selection
  const handleAddressChange = (value) => {
    setSelectedAddress(value)
    setStepValid(1, true)
  }

  // Handle shipping option change
  const handleShippingChange = async (value) => {
    setIsUpdating(true)
    try {
      const response = await cartApi.updateShippingMethod(user._id, value)
      
      if (response.success) {
        setSelectedShipping(value)
        setOrderSummary((prev) => ({
          ...prev,
          shipping: response.data.shipping,
          total: response.data.total
        }))
      }
    } catch (error) {
      console.error("Error updating shipping method:", error)
      // You might want to show an error message to the user
    } finally {
      setIsUpdating(false)
    }
  }

  // Edit address
  const handleEditAddress = (address) => {
    setAddressData(address); // set the address you want to edit
    setOpen(true); // open the dialog
  };
  // Delete address confirmation
  const confirmDeleteAddress = (addressId) => {
    setAddressToDelete(addressId)
    setDeleteConfirmOpen(true)
  }

  // Delete address
  const deleteAddress = async () => {
    if (!addressToDelete) return

    setIsUpdating(true)
    try {
      const response = await deleteAddresses(addressToDelete)
      
      if (response.success) {
        // Update local state
        const updatedAddresses = addresses?.filter((addr) => addr._id !== addressToDelete)
        setAddresses(updatedAddresses)

        // If deleted address was selected, select another one if available
        if (selectedAddress === addressToDelete) {
          if (updatedAddresses.length > 0) {
            setSelectedAddress(updatedAddresses[0]._id)
            setStepValid(1, true)
          } else {
            setSelectedAddress(null)
            setStepValid(1, false)
          }
        }
      }
    } catch (error) {
      console.error("Error deleting address:", error)
    } finally {
      setIsUpdating(false)
      setDeleteConfirmOpen(false)
      setAddressToDelete(null)
    }
  }

  // Handle successful address add/edit
  const handleAddressSuccess = async (response) => {
    try {
      const addressesResponse = await getAddresses(user?._id)
      if (addressesResponse.success) {
        setAddresses(addressesResponse.data)
        
        if (!selectedAddress && addressesResponse.data.length > 0) {
          setSelectedAddress(addressesResponse.data[0]._id)
          setStepValid(1, true)
        }

        // Close dialog only if operation was successful
        handleClose()
      }
    } catch (error) {
      console.error("Error fetching addresses:", error)
    }
  }

  // Handle dialog close
  const handleClose = () => {
    setOpen(false)
    setAddressData(null)
  }

  // Dialog props for AddEditAddress
  const dialogProps = {
    onClose: handleClose,
    onSuccess: handleAddressSuccess,
    data: addressData,
    setOpen: setOpen, // Pass setOpen to control dialog visibility
    isSubmitting,
    setIsSubmitting
  }

  // Format addresses for custom input component
  const formattedAddresses = addresses?.map((address) => ({
    title: `${address.name} ${address.isDefault ? "(Default)" : ""}`,
    meta: (
      <Chip size="small" variant="tonal" label={address.type} color={address.type === "Home" ? "primary" : "success"} />
    ),
    value: address.id,
    isSelected: address.id === selectedAddress,
    content: (
      <HorizontalContent component="div" className="flex flex-col bs-full gap-3">
        <Typography variant="body2">
          {address.street}, {address.city}, {address.state}, {address.zipCode}.
          <br />
          Mobile: {address.phone} Cash / Card on delivery available
        </Typography>
        <Divider />
        <div className="flex items-center gap-4 mbs-0.5">
          <Typography
            component="button"
            onClick={() => handleEditAddress(address)}
            color="primary.main"
            className="cursor-pointer"
          >
            Edit
          </Typography>
          <Typography
            component="button"
            onClick={() => confirmDeleteAddress(address.id)}
            color="primary.main"
            className="cursor-pointer"
          >
            Remove
          </Typography>
        </div>
      </HorizontalContent>
    ),
  })) ?? {};

  // Check if address is selected and update validation
  useEffect(() => {
    setStepValid(1, selectedAddress !== null)
  }, [selectedAddress, setStepValid])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <CircularProgress />
      </div>
    )
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, lg: 8 }} className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <Typography color="text.primary" className="font-medium self-start">
              Select your preferable address
            </Typography>

            {formattedAddresses.length === 0 ? (
              <Alert severity="info">You don't have any saved addresses. Please add a new address to continue.</Alert>
            ) : (
              <Grid container spacing={6} className="is-full">
                {formattedAddresses?.map((item, index) => (
                  <CustomInputHorizontal
                    key={index}
                    type='radio'
                    name='addressType'
                    selected={selectedAddress}
                    data={item}
                    handleChange={handleAddressChange}
                  />
                ))}
              </Grid>
            )}

            <OpenDialogOnElementClick 
              element={Button} 
              elementProps={buttonProps} 
              dialog={AddEditAddress}
              dialogProps={dialogProps}
            />
          </div>

          <div className="flex flex-col gap-4">
            <Typography color="text.primary" className="font-medium self-start">
              Choose Delivery Speed
            </Typography>
            <Grid container spacing={6} className="is-full">
              {shippingOptions.map((item, index) => {
                let asset

                if (item.asset && typeof item.asset === "string") {
                  asset = <i className={classnames(item.asset, "text-[28px]")} />
                }

                return (
                  <CustomInputVertical
                    type="radio"
                    key={index}
                    gridProps={{
                      size: {
                        sm: 4,
                        xs: 12,
                      },
                    }}
                    selected={selectedShipping}
                    name="shipping-option"
                    handleChange={handleShippingChange}
                    data={typeof item.asset === "string" ? { ...item, asset } : item}
                  />
                )
              })}
            </Grid>
          </div>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }} className="flex flex-col gap-4">
          <div className="border rounded">
            <CardContent className="flex flex-col gap-4">
              <Typography className="font-medium" color="text.primary">
                Estimated Delivery Date
              </Typography>
              {cartItems &&
                cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <img
                      width={60}
                      height={60}
                      src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${item.imgSrc}` || "/placeholder.svg?height=60&width=60"} 
                      alt={item.imgAlt || item.productName}
                    />
                    <div>
                      <Typography>{item.productName}</Typography>
                      <Typography className="font-medium">
                        {selectedShipping === "overnight"
                          ? "1 day delivery"
                          : selectedShipping === "express"
                            ? "3-4 days delivery"
                            : "1 week delivery"}
                      </Typography>
                    </div>
                  </div>
                ))}
            </CardContent>
            <Divider />
            <CardContent className="flex flex-col gap-4">
              <Typography className="font-medium" color="text.primary">
                Price Details
              </Typography>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 justify-between flex-wrap">
                  <Typography color="text.primary">Order Total</Typography>
                  <Typography>${orderSummary.subtotal?.toFixed(2) || "0.00"}</Typography>
                </div>
                <div className="flex justify-between flex-wrap">
                  <Typography color="text.primary">Delivery Charges</Typography>
                  <div className="flex gap-2">
                    {orderSummary.shipping === 0 ? (
                      <>
                        <Typography color="text.disabled" className="line-through">
                          $5.00
                        </Typography>
                        <Chip size="small" variant="tonal" color="success" label="Free" />
                      </>
                    ) : (
                      <Typography>${orderSummary.shipping?.toFixed(2) || "0.00"}</Typography>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <Divider />
            <CardContent className="flex items-center justify-between flex-wrap">
              <Typography className="font-medium" color="text.primary">
                Total
              </Typography>
              <Typography className="font-medium" color="text.primary">
                ${orderSummary.total?.toFixed(2) || "0.00"}
              </Typography>
            </CardContent>
          </div>
          <div className="flex justify-end">
            <Button
              className="max-sm:is-full lg:is-full"
              variant="contained"
              onClick={handleNext}
              disabled={!selectedAddress || isUpdating}
            >
              {isUpdating ? <CircularProgress size={24} /> : "Place Order"}
            </Button>
          </div>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this address?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={deleteAddress} color="error" disabled={isUpdating}>
            {isUpdating ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      {open &&
        <AddEditAddress
          open={open}
          setOpen={setOpen}
          data={addressData}
          onClose={handleClose}
          onSuccess={handleAddressSuccess}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      }

    </>
  )
}

export default StepAddress
