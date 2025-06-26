"use client";

// React Imports
import { useState, useEffect, useContext } from "react";

// MUI Imports
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import { styled } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

// Third-party Imports
import classnames from "classnames";
import { toast } from "react-toastify";

// Component Imports
import CustomInputHorizontal from "@core/components/custom-inputs/Horizontal";
import CustomInputVertical from "@core/components/custom-inputs/Vertical";
import AddEditAddress from "@components/dialogs/add-edit-address";
import OpenDialogOnElementClick from "@components/dialogs/OpenDialogOnElementClick";

// Context Import
import { CheckoutContext } from "./CheckoutWizard";
import { addCart, deleteAddresses, getAddresses, getAllClients, getAllShippingOptions, removeCart, removeCartByUserId, sendPaymentLinkToClient } from "@/app/server/actions";
import { cartApi } from "@/services/cart";
import { tradeProfessionalsApi } from "@/services/trade-professionals";
import { FormControl } from "@mui/material";
import { getSession, useSession } from "next-auth/react";
import { addToCart } from "@/redux-store/slices/cart";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";

import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs';

// Styled Components
const HorizontalContent = styled(Typography, {
  name: "MuiCustomInputHorizontal",
  slot: "content",
})({});

const VerticalContent = styled(Typography, {
  name: "MuiCustomInputVertical",
  slot: "content",
})({
  textAlign: "center",
});

const StepAddress = ({ handleNext, cartItems }) => {
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
    // Declare cartItems from context or props
  } = useContext(CheckoutContext);

  // States
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [open, setOpen] = useState(false);
  const [addressData, setAddressData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);  // Add loading state
  //const [isClientOrder, setIsClientOrder] = useState(false)
  const [isClientOrder, setIsClientOrder] = useState(() => {
    const stored = sessionStorage.getItem('isClientOrder');
    return stored ? JSON.parse(stored) : false;
  });
  const [clients, setClients] = useState([]);
  //const [selectedClient, setSelectedClient] = useState(null)
  const [selectedClient, setSelectedClient] = useState(() => {
    const storedClient = sessionStorage.getItem('selectedClient');
    return storedClient ? JSON.parse(storedClient) : null;
  });
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [modifiedPrices, setModifiedPrices] = useState({});
  const [commissions, setCommissions] = useState({});
  const [clientLoading, setClientLoading] = useState(false);
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  // const router = useRouter();
  //// //console.log(isClientOrder, 'isClientOrder');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingData, setShippingData] = useState([]);

  // Delivery date picker state
  const [selectedDate, setSelectedDate] = useState(null);

  // Button props for add address
  const buttonProps = {
    variant: "outlined",
    children: "Add New Address",
    className: "self-start",
  };

  // const getShippingMethodName = async () => {
  //   const shippingOption = await getAllShippingOptions();
  //   setShippingData(shippingOption?.data);
  //   //console.log(shippingOption, 'shippingOption')
  //   return shippingOption;
  // };

  // useEffect(() => {
  //   getShippingMethodName();
  // }, []);


  // // Shipping options
  // const shippingOptions = [
  //   {
  //     value: "standard",
  //     title: "Standard Delivery",
  //     asset: "ri-user-3-line",
  //     content: (
  //       <>
  //         <Chip size="small" variant="tonal" label="Free" color="success" className="absolute inline-end-5" />
  //         <VerticalContent variant="body2" className="my-auto">
  //           Get your product in 1 Week.
  //         </VerticalContent>
  //       </>
  //     ),
  //   },
  //   {
  //     value: "express",
  //     title: "Express",
  //     asset: "ri-star-smile-line",
  //     content: (
  //       <>
  //         <Chip label="$10" variant="tonal" size="small" color="secondary" className="absolute inline-end-5" />
  //         <VerticalContent variant="body2" className="my-auto">
  //           Get your product in 3-4 days.
  //         </VerticalContent>
  //       </>
  //     ),
  //   },
  //   {
  //     value: "overnight",
  //     title: "Overnight",
  //     asset: "ri-vip-crown-line",
  //     content: (
  //       <>
  //         <Chip label="$15" variant="tonal" size="small" color="secondary" className="absolute inline-end-5" />
  //         <VerticalContent variant="body2" className="my-auto">
  //           Get your product in 1 day.
  //         </VerticalContent>
  //       </>
  //     ),
  //   },
  // ];

  const [shippingOptions, setShippingOptions] = useState([]);

  const getShippingMethodName = async () => {
    try {
      const response = await getAllShippingOptions();
      const shippingOptionList = response?.data || [];
      // Map API response to UI format
      const formattedOptions = shippingOptionList.map((item, index) => ({
        value: item._id,
        title: item.name,
        cost: item.cost,
        minDays: item.minDays,
        maxDays: item.maxDays,
        description: item.description,
        asset: getAssetIcon(index),
        content: (
          <>
            <Chip
              size="small"
              variant="tonal"
              label={item.cost === 0 ? "Free" : `£${item.cost}`}
              color={item.cost === 0 ? "success" : "secondary"}
              className="absolute inline-end-5"
            />
            <VerticalContent variant="body2" className="my-auto">
              {/* {`Get your product in ${item.minDays === item.maxDays ? `${item.minDays} day${item.minDays > 1 ? "s" : ""}` : `${item.minDays}-${item.maxDays} days`}.`} */}
              {item.description}
            </VerticalContent>
          </>
        ),
      }));
      setSelectedShipping(formattedOptions[0]?.value);

      setShippingOptions(formattedOptions);
      handleShippingChange(formattedOptions[0]?.value, formattedOptions);
    } catch (error) {
      console.error("Failed to load shipping methods:", error);
    }
  };

  // Example asset icon logic (optional customization)
  const getAssetIcon = (index) => {
    const icons = ["ri-user-3-line", "ri-star-smile-line", "ri-vip-crown-line"];
    return icons[index] || "ri-truck-line";
  };

  // Call this in useEffect
  useEffect(() => {
    getShippingMethodName();
  }, []);





  // Handle address selection
  const handleAddressChange = (value) => {
    setSelectedAddress(value);
    setStepValid(1, true);
  };

  // Handle shipping option change
  const handleShippingChange = async (selectedId, formattedOptions) => {
    console.log('shippingOptions', formattedOptions);
    setIsUpdating(true);
    try {
      // Find the selected shipping option by _id
      const selectedOption = formattedOptions.find(opt => opt.value === selectedId);
      const shippingCost = selectedOption ? selectedOption.cost : 0;
      // Calculate new total with shipping
      const subtotal = cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
      const totalShippingCost = cartItems?.reduce((sum, item) => sum + (item.quantity * shippingCost), 0) || 0;
      const total = subtotal + totalShippingCost + orderSummary?.vat;

      //console.log('shippingCost', shippingCost);
      // Update shipping method and costs in context
      setSelectedShipping(selectedId);
      setOrderSummary(prev => {
        const updatedSummary = {
          ...prev,
          shipping: totalShippingCost,
          shippingOption: selectedId,
          total: total,
          selectedOption: selectedOption
        };
        console.log('updatedSummary', updatedSummary);
        calculateOrderSummaryData(updatedSummary); // ✅ latest state
        return updatedSummary;
      });
      // Optionally update cart on backend here
    } catch (error) {
      console.error("Error updating shipping method:", error);
      toast.error('Failed to update shipping method');
      setSelectedShipping(prev => prev);
      setOrderSummary(prev => prev);
    } finally {
      setIsUpdating(false);
    }
  };

  // Edit address
  const handleEditAddress = (address) => {
    setAddressData(address); // set the address you want to edit
    setOpen(true); // open the dialog
  };
  // Delete address confirmation
  const confirmDeleteAddress = (addressId) => {
    setAddressToDelete(addressId);
    setDeleteConfirmOpen(true);
  };

  // Delete address
  const deleteAddress = async () => {
    if (!addressToDelete) return;

    setIsUpdating(true);
    try {
      const response = await deleteAddresses(addressToDelete);

      if (response.success) {
        // Update local state
        const updatedAddresses = addresses?.filter((addr) => addr._id !== addressToDelete);
        setAddresses(updatedAddresses);

        // If deleted address was selected, select another one if available
        if (selectedAddress === addressToDelete) {
          if (updatedAddresses.length > 0) {
            setSelectedAddress(updatedAddresses[0]._id);
            setStepValid(1, true);
          } else {
            setSelectedAddress(null);
            setStepValid(1, false);
          }
        }
      }
    } catch (error) {
      console.error("Error deleting address:", error);
    } finally {
      setIsUpdating(false);
      setDeleteConfirmOpen(false);
      setAddressToDelete(null);
    }
  };

  // Handle successful address add/edit
  const handleAddressSuccess = async (response) => {
    try {
      const addressesResponse = await getAddresses(user?._id);
      if (addressesResponse.success) {
        setAddresses(addressesResponse.data);

        if (!selectedAddress && addressesResponse.data.length > 0) {
          setSelectedAddress(addressesResponse.data[0]._id);
          setStepValid(1, true);
        }

        // Close dialog only if operation was successful
        handleClose();
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    setOpen(false);
    setAddressData(null);
  };

  // Dialog props for AddEditAddress
  const dialogProps = {
    onSuccess: handleAddressSuccess,
    data: addressData,
    isSubmitting,
    setIsSubmitting
  };

  useEffect(() => {
    if (selectedClient?.addressDetails) {
      const clientAddress = {
        id: selectedClient.addressDetails._id,
        type: selectedClient.addressDetails.type || "Client",
        name: selectedClient.addressDetails.name,
        street: selectedClient.addressDetails.addressLine1 || '',
        addressLine2: selectedClient.addressDetails.addressLine2 || '',
        city: selectedClient.addressDetails.city || '',
        state: selectedClient.addressDetails.state || '',
        zipCode: selectedClient.addressDetails.postalCode || '',
        country: selectedClient.addressDetails.country || '',
        phone: selectedClient.addressDetails.phone || '',
        isDefault: selectedClient.addressDetails.isDefault,
        label: selectedClient.addressDetails.label || '',
        tags: selectedClient.addressDetails.tags || []
      };

      // Update addresses state with client address
      setAddresses([clientAddress]);

      // Set this address as selected
      setSelectedAddress(clientAddress.id);
      setStepValid(1, true);
    }

    //setPriceDialogOpen(true)
  }, [selectedClient]);

  // Handle client selection
  const handleClientSelect = (event) => {
    const client = clients.find(c => c._id === event.target.value);
    setSelectedClient(client);
    sessionStorage.setItem('selectedClient', JSON.stringify(client));

    // Format and set client address if available
    if (client?.addressDetails) {
      const clientAddress = {
        id: client.addressDetails._id,
        type: client.addressDetails.type || "Client",
        name: client.addressDetails.name,
        street: client.addressDetails.addressLine1 || '',
        addressLine2: client.addressDetails.addressLine2 || '',
        city: client.addressDetails.city || '',
        state: client.addressDetails.state || '',
        zipCode: client.addressDetails.postalCode || '',
        country: client.addressDetails.country || '',
        phone: client.addressDetails.phone || '',
        isDefault: client.addressDetails.isDefault,
        label: client.addressDetails.label || '',
        tags: client.addressDetails.tags || []
      };

      // Update addresses state with client address
      setAddresses([clientAddress]);

      // Set this address as selected
      setSelectedAddress(clientAddress.id);
      setStepValid(1, true);
    } else {
      // If client has no address, reset addresses
      setAddresses([]);
      setSelectedAddress(null);
      setStepValid(1, false);
      toast.warning('Selected client has no address. Please add an address to continue.');
    }

    setPriceDialogOpen(true);
  };

  // Format addresses for custom input component
  const formattedAddresses = (isClientOrder ? addresses : addresses)?.map((address) => ({
    title: `${address.name} ${address.isDefault ? "(Default)" : ""} ${address.label ? `- ${address.label}` : ''}`,
    meta: (
      <div className="flex gap-2">
        <Chip
          size="small"
          variant="tonal"
          label={address.type}
          color={address.type === "Warehouse" ? "warning" : address.type === "Home" ? "primary" : "success"}
        />
        {address.tags?.map((tag, index) => (
          <Chip
            key={index}
            size="small"
            variant="tonal"
            label={tag}
            color="default"
          />
        ))}
      </div>
    ),
    value: address.id,
    isSelected: address.id === selectedAddress,
    content: (
      <HorizontalContent component="div" className="flex flex-col bs-full gap-3">
        <Typography variant="body2">
          {[
            address.street,
            address.addressLine2,
            address.city,
            address.state,
            address.zipCode,
            address.country
          ].filter(Boolean).join(', ')}.
          <br />
          {address.phone && `Mobile: ${address.phone}`}
          {address.type === "Warehouse" ? " (Warehouse Address)" : " Cash / Card on delivery available"}
        </Typography>
        <Divider />
        <div className="flex items-center gap-4 mbs-0.5">
          {!isClientOrder && (
            <>
              <Button
                onClick={() => handleEditAddress(address)}
                color="primary"
                size="small"
                variant="outlined"
              >
                Edit
              </Button>

              <Button
                onClick={() => confirmDeleteAddress(address.id)}
                color="primary"
                size="small"
                variant="outlined"
              >
                Remove
              </Button>

            </>
          )}
        </div>
      </HorizontalContent>
    ),
  })) ?? [];

  // Check if address is selected and update validation
  useEffect(() => {
    setStepValid(1, selectedAddress !== null);
  }, [selectedAddress, setStepValid]);

  // Fetch clients
  const fetchClients = async () => {
    setClientLoading(true);
    try {
      const response = await getAllClients();
      // // //console.log(response, 'response 55 getAllClients');

      if (response.success) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setClientLoading(false);
    }
  };

  // Handle client order toggle
  const handleClientOrderToggle = (event) => {
    const checked = event.target.checked;
    setIsClientOrder(checked);
    sessionStorage.setItem('isClientOrder', JSON.stringify(checked));
    if (checked) {
      fetchClients();
    } else {
      setSelectedClient(null);
      sessionStorage.removeItem('selectedClient');
    }
  };

  useEffect(() => {
    fetchClients();
  }, [isClientOrder]);

  // Handle price modification
  const handlePriceChange = (itemId, newPrice) => {
    setModifiedPrices(prev => ({
      ...prev,
      [itemId]: newPrice
    }));
  };

  // Handle commission change
  const handleCommissionChange = (itemId, newCommission) => {
    setCommissions(prev => ({
      ...prev,
      [itemId]: newCommission
    }));
  };

  // Validate price is within range
  const validatePrice = (item, price) => {
    const minPrice = item.variation?.regularPriceB2B || 0;
    const maxPrice = item.variation?.regularPriceB2C || 0;
    return price >= minPrice && price <= maxPrice;
  };

  // Handle price dialog save
  const handlePriceDialogSave = async () => {
    // Update cart items with modified prices and calculated commissions
    const updatedCartItems = cartItems.map(item => {
      const currentPrice = modifiedPrices[item._id] || item.price;
      const basePrice = item.variation?.regularPriceB2B || 0;
      const commission = Math.max(0, currentPrice - basePrice);

      return {
        ...item,
        productId: item?.product?.id,
        variationId: item?.variation?.id,
        price: currentPrice,
        commission: commission
      };
    });

    const response = await addCart({
      items: updatedCartItems,
      userId: session?.user?.id
    });

    dispatch(addToCart(response.data));
    toast.success('Products added to cart successfully');
    setPriceDialogOpen(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <CircularProgress />
      </div>
    );
  }
  const sentClientToPayment = async () => {
    console.log('sentClientToPayment orderSummary', orderSummary);
    setIsUpdating(true);
    try {
      // Generate a unique cart identifier
      const cartId = `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = orderSummary?.shipping || 0;
      const totalShippingCost = cartItems.reduce((sum, item) => sum + (shippingCost * item.quantity), 0);
      const shippingOption = orderSummary?.shippingOption || null;
      const total = subtotal + totalShippingCost + orderSummary?.vat;

      // Prepare data for payment link
      const paymentLinkData = {
        cartId,
        clientId: selectedClient._id,
        cartItems: cartItems.map(item => ({
          ...item,
          productId: item?.product?.id,
          variationId: item?.variation?.id,
          price: modifiedPrices[item._id] || item.price
        })),
        shippingAddress: selectedAddress,
        shippingMethod: selectedShipping,
        orderSummary: {
          subtotal,
          shipping: totalShippingCost,
          total,
          vat: orderSummary?.vat,
          shippingOption,
        },
        tradeProfessionalId: session?.user?.id
      };


      console.log('paymentLinkData', paymentLinkData);

      const response = await sendPaymentLinkToClient(paymentLinkData);

      if (response.success) {

        toast.success('Payment link sent to client successfully');
        await removeCartByUserId(user?._id);
        //console.log("response removeCartWholeremoveCartWhole:", response);
        // router.push('/en/products');
        // Clear the cart or handle post-success actions
      } else {
        toast.error(response.message || 'Failed to send payment link');
      }
    } catch (error) {
      console.error('Error sending payment link:', error);
      toast.error('Failed to send payment link. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // // //console.log(clients, 'kkkk');

  const calculateOrderSummaryData = (orderSummaryData) => {
    return (
      <div className="flex flex-col gap-4 rounded border p-4">
        <Typography variant="h6">Order Summary</Typography>
        <CardContent className="flex flex-col gap-4 p-0">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 justify-between flex-wrap">
              <Typography color="text.primary">Subtotal</Typography>
              <Typography>£{orderSummaryData?.subtotal?.toFixed(2) || "0.00"}</Typography>
            </div>
            <div className="flex justify-between flex-wrap">
              <Typography color="text.primary">Shipping</Typography>
              <div className="flex gap-2">
                {orderSummaryData?.shipping > 0 ? (
                  <Typography>£{orderSummaryData?.shipping?.toFixed(2)}</Typography>
                ) : (
                  <Chip size="small" variant="tonal" color="success" label="Free" />
                )}
              </div>
            </div>
            {orderSummary?.vat > 0 && (
              <div className="flex justify-between flex-wrap">
                <Typography color="text.primary">VAT ({orderSummary?.vatRate}%)</Typography>
                <Typography>£{orderSummary?.vat?.toFixed(2)}</Typography>
              </div>
            )}
          </div>
        </CardContent>
        <Divider />
        <CardContent className="flex items-center justify-between flex-wrap p-0">
          <Typography className="font-medium" color="text.primary">
            Total
          </Typography>
          <Typography className="font-medium" color="text.primary">
            £{orderSummary?.total?.toFixed(2) || "0.00"}
          </Typography>
        </CardContent>
      </div>
    )
  }

  const today = dayjs();
  const selectedShippingOption = shippingOptions.find(opt => opt.value === selectedShipping);
  const minDate = selectedShippingOption ? today.add(selectedShippingOption.minDays, 'day') : today;
  const maxDate = selectedShippingOption ? today.add(selectedShippingOption.maxDays, 'day') : today;

  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, lg: 8 }} className="flex flex-col gap-6">
          {/* Client Order Switch */}
          <div className="flex flex-col gap-4">
            <FormControlLabel
              control={
                <Switch
                  checked={isClientOrder}
                  onChange={handleClientOrderToggle}
                  color="primary"
                />
              }
              label="Place Orders on Behalf of Clients"
            />

            {/* Client Selection */}
            {isClientOrder && (
              <FormControl fullWidth>
                <Select
                  value={selectedClient?._id || ''}
                  onChange={handleClientSelect}
                  displayEmpty
                  disabled={clientLoading}
                >
                  <MenuItem value="" disabled>
                    {clientLoading ? 'Loading clients...' : 'Select a client'}
                  </MenuItem>
                  {clients.map((client) => (
                    <MenuItem key={client._id} value={client._id}>
                      {client.name} ({client.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <Typography color="text.primary" className="font-bold self-start">
              Select Your Delivery Address
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
            <Typography color="text.primary" className="font-bold self-start">
              Choose Your Delivery Option
            </Typography>
            <Grid container spacing={6} className="is-full">
              {shippingOptions.map((item, index) => {
                let asset;
                if (item.asset && typeof item.asset === "string") {
                  asset = <div className="w-full text-center"><i className={classnames(item.asset, "text-[28px]")} /></div>;
                }
                return (
                  <CustomInputVertical
                    className="flex-row flex-wrap"
                    type="radio"
                    key={item.value}
                    gridProps={{
                      size: {
                        sm: 4,
                        xs: 12,
                      },
                    }}
                    selected={selectedShipping}
                    name="shipping-option"
                    handleChange={() => handleShippingChange(item.value, shippingOptions)}
                    data={typeof item.asset === "string" ? { ...item, asset } : item}
                    disabled={isUpdating}
                  />
                );
              })}
            </Grid>
          </div>

          <div>
            <Typography mb={2}>Select Your Requested Delivery Date</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Delivery Date"
                value={selectedDate || null}
                onChange={date => setSelectedDate(date)}
                minDate={minDate}
                maxDate={maxDate}
                renderInput={params => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </div>


        </Grid>

        <Grid size={{ xs: 12, lg: 4 }} className="flex flex-col gap-4">
          {/* Order Summary Card */}
          {
            calculateOrderSummaryData(orderSummary)
          }

          <div className="flex justify-end">
            {isClientOrder ? (<Button
              className="max-sm:is-full lg:is-full"
              size="large"
              variant="contained"
              onClick={sentClientToPayment}
              disabled={!selectedAddress || isUpdating}
              sx={{
                backgroundColor: '#991b1b',
                '&:hover': {
                  backgroundColor: '#7f1d1d',
                },
              }}
            >
              {isUpdating ? <CircularProgress size={24} /> : "Send Payment to client"}
            </Button>)

              :
              (<Button
                className="max-sm:is-full lg:is-full"
                size="large"
                variant="contained"
                onClick={handleNext}
                disabled={!selectedAddress || isUpdating}
                sx={{
                  backgroundColor: '#991b1b',
                  '&:hover': {
                    backgroundColor: '#7f1d1d',
                  },
                }}
              >
                {isUpdating ? <CircularProgress size={24} /> : "Continue to Payment"}
              </Button>
              )

            }


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

      {/* Price Modification Dialog */}
      <Dialog
        open={priceDialogOpen}
        onClose={() => setPriceDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Modify Prices for Client Order</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            {cartItems?.map((item) => {
              const basePrice = item.variation?.regularPriceB2B || 0;
              const maxPrice = item.variation?.regularPriceB2C || 0;
              const currentPrice = modifiedPrices[item._id] || item.price;
              const commission = Math.max(0, currentPrice - basePrice);

              return (
                <div key={item._id} className="flex items-center gap-4 p-4 border rounded">
                  <img
                    width={60}
                    height={60}
                    src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${item?.product?.productFeaturedImage?.filePath}` || "/placeholder.svg"}
                    alt={item?.product?.name}
                    className="rounded"
                  />
                  <div className="flex-grow">
                    <Typography variant="subtitle1">{item?.product?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity} SQ.M
                    </Typography>
                    <div className="flex items-center gap-4 mt-2">
                      <TextField
                        label="Price per SQ.M"
                        type="number"
                        // value={currentPrice}
                        onChange={(e) => handlePriceChange(item._id, Number(e.target.value))}
                        error={!validatePrice(item, currentPrice)}
                        helperText={`Base price: £${basePrice} (Range: £${basePrice} - £${maxPrice})`}
                        size="small"
                      />
                      <div className="flex flex-col ml-4">
                        <Typography variant="body2" color="text.primary" className="font-medium">
                          Commission: £{commission.toFixed(2)} per SQ.M
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Base Price: £{basePrice.toFixed(2)} per SQ.M
                        </Typography>
                        <Typography variant="body2" color="text.primary" className="font-medium">
                          Total Price: £{currentPrice.toFixed(2)} per SQ.M
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePriceDialogSave} variant="contained" color="primary">
            Save Prices
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
};

export default StepAddress;
