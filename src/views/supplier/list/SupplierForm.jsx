'use client'
import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  MenuItem
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'
import { supplierService } from '@/services/supplier.service';
import { useRouter,useParams  } from 'next/navigation'
import { locationService } from '@/services/location.service';
import Select from 'react-select'

const AddSupplierForm = () => {

  const params = useParams()
  const supplierId = params?.id || null
  const locale = params?.lang || null


  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch ,
    formState: { errors }
  } = useForm({
    defaultValues: {
      companyName: '',
      companyEmail: '',
      companyPhone: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      lat: '',
      long: '',
      status: '1'
    }
  })

  const [discounts, setDiscounts] = useState([{ minimumAreaSqFt: '', discountPercentage: '' }])
  const [countryList, setCountryList] = useState([])
  const [stateList, setStateList] = useState([])
  const [cityList, setCityList] = useState([])

  const selectedCountryId = watch('country')
  const selectedStateId = watch('state')

    // Fetch country list once
    useEffect(() => {
      const fetchCountries = async () => {
        try {
          const response = await locationService.getCountries()
          setCountryList(response?.data || [])
        } catch {
          toast.error('Failed to load countries')
        }
      }
      fetchCountries()
    }, [])

  useEffect(() => {
    const fetchSupplierDetails = async () => {
      if (!supplierId ||  supplierId =='new' ) return

      try {
        const response = await supplierService.getById(supplierId)
        const supplier = response?.data

        reset({
          companyName: supplier.companyName,
          companyEmail: supplier.companyEmail,
          companyPhone: supplier.companyPhone,
          contactName: supplier.contactInfo?.[0]?.name || '',
          contactEmail: supplier.contactInfo?.[0]?.email || '',
          contactPhone: supplier.contactInfo?.[0]?.phone || '',
          addressLine1: supplier.addresses?.addressLine1 || '',
          addressLine2: supplier.addresses?.addressLine2 || '',
          city: supplier.addresses?.city || '',
          state: supplier.addresses?.state || '',
          postalCode: supplier.addresses?.postalCode || '',
          country: supplier.addresses?.country || '',
          lat: supplier.addresses?.lat?.toString() || '',
          long: supplier.addresses?.long?.toString() || '',
          status: supplier.status,

        })
       // Fetch dependent states and cities for mapped values
        if (supplier.addresses?.country) {
          const states = await locationService.getStatesByCountry(supplier.addresses.country)
          setStateList(states?.data || [])

          if (supplier.addresses?.state) {
            const cities = await locationService.getCitiesByState(supplier.addresses.state)
            setCityList(cities?.data || [])
          }
        }
        if (supplier.discounts?.length > 0) {
          setDiscounts(
            supplier.discounts.map(d => ({
              minimumAreaSqFt: d.minimumAreaSqFt.toString(),
              discountPercentage: d.discountPercentage.toString()
            }))
          )
        }
      } catch (error) {
        toast.error('Failed to load supplier details')
      }
    }

    fetchSupplierDetails()
  }, [supplierId, reset])

    // Watch for changes in country and state and fetch data accordingly
    useEffect(() => {
      if (selectedCountryId) {
        locationService.getStatesByCountry(selectedCountryId).then(states => setStateList(states?.data || []))
      } else {
        setStateList([])
      }
    }, [selectedCountryId])

    useEffect(() => {
      if (selectedStateId) {
        locationService.getCitiesByState(selectedStateId).then(cities => setCityList(cities?.data || []))
      } else {
        setCityList([])
      }
    }, [selectedStateId])


  const handleDiscountChange = (index, field, value) => {
    const updatedDiscounts = [...discounts]
    updatedDiscounts[index][field] = value
    setDiscounts(updatedDiscounts)
  }

  const handleAddDiscount = () => {
    setDiscounts([...discounts, { minimumAreaSqFt: '', discountPercentage: '' }])
  }

  const handleRemoveDiscount = index => {
    const updatedDiscounts = discounts.filter((_, i) => i !== index)
    setDiscounts(updatedDiscounts)
  }
  const onSubmit = async (data) => {


    const formattedDiscounts = discounts.map(discount => ({
      minimumAreaSqFt: Number(discount.minimumAreaSqFt),
      discountPercentage: Number(discount.discountPercentage)
    }))

    const finalPayload = {
      companyName: data.companyName,
      companyEmail: data.companyEmail,
      companyPhone: data.companyPhone,
      contactInfo: [
        {
          name: data.contactName,
          email: data.contactEmail,
          phone: data.contactPhone
        }
      ],
      addresses: {
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: String(data.city),
        state: String(data.state),
        postalCode: data.postalCode,
        country: String(data.country),
        lat: parseFloat(data.lat),
        long: parseFloat(data.long)
      },
      discounts: formattedDiscounts,
      status:data.status
    }

    try {
    let response;

      if(supplierId &&  supplierId !='new'){
           response =  await supplierService.update(supplierId , finalPayload);

        }else{
          response =  await supplierService.create(finalPayload)
        }
        if (response?.statusCode === 201 ||response?.statusCode === 200) {
             router.push(`/${locale}/supplier/list`);
        } else {
          // Map backend field-level validation errors (422)
          if (response?.data?.errors) {
            const backendErrors = response.data.errors;
            Object.entries(backendErrors).forEach(([fieldName, messages]) => {
              if (Array.isArray(messages)) {
                setError(fieldName, { message: messages[0] });
              }
            });
          } else {
            const errorMessage = response?.message || 'Something went wrong. Please try again.';
            setError('apiError', { message: errorMessage });
          }
        }

        // router.push(`/${locale}/supplier/list`);
      } catch (error) {
        const backendErrors = error?.response?.data?.errors;
        if (backendErrors) {
          Object.entries(backendErrors).forEach(([fieldName, messages]) => {
            if (Array.isArray(messages)) {
              setError(fieldName, { message: messages[0] });
            }
          });
        } else {
          const errorMessage = error?.message || 'Something went wrong. Please try again.';
          setError('apiError', { message: errorMessage });
        }
      }
    }


    const handleCountryChange = async selectedOption => {

        console.log(selectedOption,'selectedOption');

        const countryId = selectedOption?.value || ''

        setCityList([])
        setValue('country', countryId)
        setValue('state', '')
        setValue('city', '')

        try {
          const states = await locationService.getStatesByCountry(countryId)
          setStateList(states?.data || [])
        } catch {
          toast.error('Failed to load states')
        }
      }

      const handleStateChange = async selectedOption => {
        const stateId = selectedOption?.value || ''
        setValue('state', stateId)
        setValue('city', '')

        try {
          const cities = await locationService.getCitiesByState(stateId)
          setCityList(cities?.data || [])
        } catch {
          toast.error('Failed to load cities')
        }
      }
    const toReactSelectOptions = (list) =>
      list.map(item => ({ label: item.name, value: item._id }))

  return (
    <Card>
      <CardHeader title="Add Supplier"/>
    <CardContent>
      <form onSubmit={handleSubmit(onSubmit)}>
      <Box mb={5} sx={{background: '#f7f7f7a6',borderRadius: '10px',border: '1px solid #ededed',p: 5}}>
        <Typography variant='h5' mb={2}>
          Company Information
        </Typography>

        <Grid container spacing={2}>
        <Grid item  size={{ xs: 12, sm: 4 }}>
            <Controller
              name='companyName'
              control={control}
              rules={{ required: 'Company name is required' }}
              render={({ field }) => (
                <TextField
                sx={{background: '#fff'}}
                  {...field}
                  fullWidth
                  label='Company Name'
                  error={!!errors.companyName}
                  helperText={errors.companyName?.message}
                />
              )}
            />
          </Grid>
          <Grid item  size={{ xs: 12, sm: 4 }}>
            <Controller
              name='companyEmail'
              control={control}
              rules={{
                required: 'Company email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              }}
              render={({ field }) => (
                <TextField
                sx={{background: '#fff'}}
                  {...field}
                  fullWidth
                  label='Company Email'
                  error={!!errors.companyEmail}
                  helperText={errors.companyEmail?.message}
                />
              )}
            />
          </Grid>
          <Grid item  size={{ xs: 12, sm: 4 }}>
            <Controller
              name='companyPhone'
              control={control}
              rules={{ required: 'Company phone is required' }}
              render={({ field }) => (
                <TextField
                sx={{background: '#fff'}}
                  {...field}
                  fullWidth
                  label='Company Phone'
                  error={!!errors.companyPhone}
                  helperText={errors.companyPhone?.message}
                />
              )}
            />
          </Grid>
        </Grid>
        </Box>



        <Box mb={5} sx={{background: '#f7f7f7a6',borderRadius: '10px',border: '1px solid #ededed',p: 5}}>
          <Typography variant='h5' mb={2}>
            Contact Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item  size={{ xs: 12, sm: 4 }}>
              <Controller
                name='contactName'
                control={control}
                rules={{ required: 'Contact name is required' }}
                render={({ field }) => (
                  <TextField
                  sx={{background: '#fff'}}
                    {...field}
                    fullWidth
                    label='Contact Name'
                    error={!!errors.contactName}
                    helperText={errors.contactName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item  size={{ xs: 12, sm: 4 }}>
              <Controller
                name='contactEmail'
                control={control}
                rules={{
                  required: 'Contact email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                }}
                render={({ field }) => (
                  <TextField
                  sx={{background: '#fff'}}
                    {...field}
                    fullWidth
                    label='Contact Email'
                    error={!!errors.contactEmail}
                    helperText={errors.contactEmail?.message}
                  />
                )}
              />
            </Grid>
            <Grid item  size={{ xs: 12, sm: 4 }}>
              <Controller
                name='contactPhone'
                control={control}
                rules={{ required: 'Contact phone is required' }}
                render={({ field }) => (
                  <TextField
                  sx={{background: '#fff'}}
                    {...field}
                    fullWidth
                    label='Contact Phone'
                    error={!!errors.contactPhone}
                    helperText={errors.contactPhone?.message}
                  />
                )}
              />

            </Grid>
          </Grid>
        </Box>

        <Box mb={5} sx={{background: '#f7f7f7a6',borderRadius: '10px',border: '1px solid #ededed',p: 5}}>
          <Typography variant='h5' mb={2}>
            Address
          </Typography>
          <Grid container spacing={2}>
          <Grid item  size={{ xs: 12, sm: 4 }}>
              <Controller
                name='addressLine1'
                control={control}
                rules={{ required: 'Address line 1 is required' }}
                render={({ field }) => (
                  <TextField
                  sx={{background: '#fff'}}
                    {...field}
                    fullWidth
                    label='Address Line 1'
                    error={!!errors.addressLine1}
                    helperText={errors.addressLine1?.message}
                  />
                )}
              />
            </Grid>
            <Grid item  size={{ xs: 12, sm: 4 }}>
              <Controller
                name='addressLine2'
                control={control}
                render={({ field }) => (
                  <TextField
                  sx={{background: '#fff'}}
                    {...field}
                    fullWidth
                    label='Address Line 2'
                  />
                )}
              />
            </Grid>

              {/* Country Select */}
              <Grid item xs={12} sm={4}>
                <Controller
                  name="country"
                  control={control}
                  rules={{ required: 'Country is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={toReactSelectOptions(countryList)}
                      onChange={handleCountryChange}
                      value={
                        toReactSelectOptions(countryList).find(
                          option => option.value === field.value
                        ) || null
                      }
                      placeholder="Select Country"
                    />
                  )}
                />
                {errors.country && (
                  <Typography color="error" variant="caption">
                    {errors.country.message}
                  </Typography>
                )}
              </Grid>

              {/* State Select */}
              <Grid item xs={12} sm={4}>
                <Controller
                  name="state"
                  control={control}
                  rules={{ required: 'State is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={toReactSelectOptions(stateList)}
                      onChange={handleStateChange}
                      value={
                        toReactSelectOptions(stateList).find(
                          option => option.value === field.value
                        ) || null
                      }
                      placeholder="Select State"
                    />
                  )}
                />
                {errors.state && (
                  <Typography color="error" variant="caption">
                    {errors.state.message}
                  </Typography>
                )}
              </Grid>

              {/* City Select */}
              <Grid item xs={12} sm={4}>
                <Controller
                  name="city"
                  control={control}
                  rules={{ required: 'City is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={toReactSelectOptions(cityList)}
                      onChange={(selectedOption) => field.onChange(selectedOption?.value || '')}
                      value={
                        toReactSelectOptions(cityList).find(
                          option => option.value === field.value
                        ) || null
                      }
                      placeholder="Select City"
                    />
                  )}
                />
                {errors.city && (
                  <Typography color="error" variant="caption">
                    {errors.city.message}
                  </Typography>
                )}
              </Grid>
            <Grid item  size={{ xs: 12, sm: 4 }}>
              <Controller
                name='postalCode'
                control={control}
                rules={{ required: 'Postal code is required' }}
                render={({ field }) => (
                  <TextField
                  sx={{background: '#fff'}}
                    {...field}
                    fullWidth
                    label='Postal Code'
                    error={!!errors.postalCode}
                    helperText={errors.postalCode?.message}
                  />
                )}
              />
            </Grid>



            {/* <Grid item xs={12} sm={3}>
              <Controller
                name='lat'
                control={control}
                rules={{ required: 'Latitude is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Latitude'
                    error={!!errors.lat}
                    helperText={errors.lat?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='long'
                control={control}
                rules={{ required: 'Longitude is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Longitude'
                    error={!!errors.long}
                    helperText={errors.long?.message}
                  />
                )}
              />
            </Grid> */}
            <Grid item  size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: 'Status is required' }}
                  render={({ field }) => (
                    <TextField
                    sx={{background: '#fff'}}
                      {...field}
                      select
                      fullWidth
                      label="Status"
                      error={!!errors.status}
                      helperText={errors.status?.message}
                    >
                      <MenuItem value="2">Pending</MenuItem>
                      <MenuItem value="1">Active</MenuItem>
                      <MenuItem value="0">Inactive</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>


          </Grid>
        </Box>

        <Box mb={5} sx={{background: '#f7f7f7a6',borderRadius: '10px',border: '1px solid #ededed',p: 5}}>
          <Typography variant='h5' mb={2}>
            Discounts
          </Typography>
          {discounts.map((discount, index) => (
            <Grid container spacing={2} key={index} mb={2} alignItems='center'>
              <Grid item  size={{ xs: 12, sm: 4 }}>
                <TextField
                 sx={{background: '#fff'}}
                  fullWidth
                  label='Minimum Area (sqft)'
                  type='number'
                  value={discount.minimumAreaSqFt}
                  onChange={e =>
                    handleDiscountChange(index, 'minimumAreaSqFt', e.target.value)
                  }
                />
              </Grid>
              <Grid item  size={{ xs: 12, sm: 4 }}>
                <TextField
                sx={{background: '#fff'}}
                  fullWidth
                  label='Discount (%)'
                  type='number'
                  value={discount.discountPercentage}
                  onChange={e =>
                    handleDiscountChange(index, 'discountPercentage', e.target.value)
                  }
                />
              </Grid>
              <Grid item  size={{ xs: 12, sm: 4 }}>
                <IconButton onClick={() => handleRemoveDiscount(index)}>
                  <i className='ri-delete-bin-7-line text-textSecondary' />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button
            startIcon={<i className='ri-add-line' />}
            onClick={handleAddDiscount}
            variant='outlined'
            sx={{ mt: 2 }}
          >
            Add Discount
          </Button>
        </Box>

        <Box mt={4}>
          <Button type='submit' variant='contained'>
            Submit
          </Button>
        </Box>
      </form>
     </CardContent>
     </Card>

  )
}

export default AddSupplierForm
