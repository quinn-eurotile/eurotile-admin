'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import Grid from '@mui/material/Grid2'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { update } from '@/app/[lang]/(dashboard)/(private)/admin/trade-professionals/view/[id]/page'
import { toast } from 'react-toastify'
import { updateTradeProfessional } from '@/app/server/trade-professional'
import { CircularProgress, InputAdornment, List, ListItem, ListItemText, Paper } from '@mui/material'


const statusOptions = [
  { label: 'Active', value: 1 },
  { label: 'Inactive', value: 0 },
  { label: 'Pending', value: 2 }
]

const AddressSearch = ({ label = 'Search Address', placeholder = 'Enter your address...', setValue }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimeoutRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Debounced search function
  useEffect(() => {
    if (searchQuery.length > 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      searchTimeoutRef.current = setTimeout(() => {
        searchAddress(searchQuery)
      }, 500)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const searchAddress = async query => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`
      )
      const data = await response.json()
      setSuggestions(data)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error searching address:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = suggestion => {
    const address = suggestion.address || {}

    // Parse the display name to get address components
    const displayName = suggestion.display_name
    const addressParts = displayName.split(', ')

    // Extract address components from the suggestion
    const addressLine1 =
      [address.house_number, address.road || address.street].filter(Boolean).join(' ') || addressParts[0] || ''

    const addressLine2 = address.suburb || address.neighbourhood || ''

    const city = address.city || address.town || address.village || address.municipality || ''

    const state = address.state || address.province || address.region || ''

    const postalCode = address.postcode || ''

    const country = address.country || ''

    const lat = suggestion.lat || ''
    const long = suggestion.lon || ''

    // Set all address fields
    setValue('address.addressLine1', addressLine1)
    setValue('address.addressLine2', addressLine2)
    setValue('address.city', city)
    setValue('address.state', state)
    setValue('address.postalCode', postalCode)
    setValue('address.country', country)
    setValue('address.lat', lat)
    setValue('address.long', long)

    // Update search query with selected address
    setSearchQuery(displayName)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    // Clear all address fields
    setValue('address.addressLine1', '')
    setValue('address.addressLine2', '')
    setValue('address.city', '')
    setValue('address.state', '')
    setValue('address.postalCode', '')
    setValue('address.country', '')
    setValue('address.lat', '')
    setValue('address.long', '')
  }

  return (
    <div className='relative' ref={suggestionsRef}>
      <TextField
        fullWidth
        label={label}
        placeholder={placeholder}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              {loading && <CircularProgress size={20} />}
              {searchQuery && (
                <IconButton size='small' onClick={clearSearch} edge='end'>
                  <i className='ri-close-line' />
                </IconButton>
              )}
              <IconButton size='small' edge='end'>
                <i className='ri-map-pin-line' />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <Paper elevation={3} className='absolute top-full left-0 right-0 z-10 max-h-60 overflow-auto mt-1'>
          <List dense>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleSuggestionClick(suggestion)}
                className='hover:bg-gray-50 cursor-pointer'
              >
                <ListItemText
                  primary={suggestion.display_name}
                  secondary={`${suggestion.type} • ${suggestion.importance?.toFixed(2) || 'N/A'}`}
                  primaryTypographyProps={{
                    className: 'text-sm'
                  }}
                  secondaryTypographyProps={{
                    className: 'text-xs text-gray-500'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {showSuggestions && suggestions.length === 0 && !loading && searchQuery.length > 2 && (
        <Paper elevation={3} className='absolute top-full left-0 right-0 z-10 mt-1'>
          <List dense>
            <ListItem>
              <ListItemText
                primary='No addresses found'
                secondary='Try a different search term'
                primaryTypographyProps={{
                  className: 'text-sm text-gray-500'
                }}
                secondaryTypographyProps={{
                  className: 'text-xs text-gray-400'
                }}
              />
            </ListItem>
          </List>
        </Paper>
      )}
    </div>
  )
}

const EditClientInfo = ({ open, setOpen, data, setRefresh, isAdmin }) => {
const formatInitialData = data => ({
  name: data?.name || '',
  email: data?.email || '',
  phone: data?.phone || '',
  address: {
    name: data?.address?.name || '',
    phone: data?.address?.phone || '',
    addressLine1: data?.address?.addressLine1 || '',
    addressLine2: data?.address?.addressLine2 || '',
    street: data?.address?.street || '',
    city: data?.address?.city || '',
    state: data?.address?.state || '',
    postalCode: data?.address?.postalCode || '',
    country: data?.address?.country || '',
    type: data?.address?.type || '',
    isDefault: data?.address?.isDefault ?? true,
    label: data?.address?.label || '',
    lat: data?.address?.lat || '',
    long: data?.address?.long || '',
    location: {
      type: 'Point',
      coordinates: [
        data?.address?.lat || '',
        data?.address?.long || ''
      ]
    }
  }
})


  console.log('isAdminisAdminisAdminisAdmin', isAdmin);


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: formatInitialData(data)
  })

  useEffect(() => {
    if (data) {
      reset(formatInitialData(data))
    }
  }, [data, reset])

  const handleClose = () => {
    setOpen(false)
    // setRefresh(false);
    reset(formatInitialData(data))
  }

const onSubmit = async formValues => {

  const lat = formValues.address?.lat || ''
  const long = formValues.address?.long || ''

  const requestData = {
    name: formValues.name,
    email: formValues.email,
    phone: formValues.phone,
    address: {
      name: formValues.address?.name || '',
      phone: formValues.address?.phone || '',
      addressLine1: formValues.address?.addressLine1 || '',
      addressLine2: formValues.address?.addressLine2 || '',
      street: formValues.address?.street || '',
      city: formValues.address?.city || '',
      state: formValues.address?.state || '',
      postalCode: formValues.address?.postalCode || '',
      country: formValues.address?.country || '',
      type: formValues.address?.type || '',
      isDefault: formValues.address?.isDefault ?? true,
      label: formValues.address?.label || '',
      lat,
      long,
      location: {
        type: 'Point',
        coordinates: [lat, long]
      }
    }
  }
  console.log('requestData',requestData )

  try {
    const response = await updateTradeProfessional(data._id, requestData)

    if (response?.statusCode === 200 || response?.statusCode === 201) {
      toast.success(response?.message || 'Operation successful')
      setRefresh(true)
      handleClose()
      reset()
    } else {
      const fieldErrors = response?.data?.errors
      if (fieldErrors) {
        // handle errors
      }
    }
  } catch (error) {
    console.error('Update failed', error)
    toast.error('Something went wrong while updating')
  }
}


  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='md' scroll='body'>
      <DialogTitle variant='h4' className='flex gap-0 flex-col items-center sm:pbs-16 sm:pbe-6 sm:pli-16 mb-3'>
        <div className='max-sm:is-[80%] max-sm:text-center'>{data.length > 0 ? 'Edit Client' : 'Add Client'}</div>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>

          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Full Name' {...register('name')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Email' type='email' {...register('email')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Phone' {...register('phone')} />
            </Grid>

            {/* Address Search Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant='h6' className='mb-3'>
                Address Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <AddressSearch label='Search Address' placeholder='Start typing your address...' setValue={setValue} />
            </Grid>

            {/* Address Fields - Auto-filled by AddressSearch */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('address.addressLine1', { required: 'Address Line 1 is required' })}
                error={Boolean(errors?.address?.addressLine1)}
                helperText={errors?.address?.addressLine1?.message}
                fullWidth
                label='Address Line 1'
                placeholder='Street address'
                InputLabelProps={{
                  shrink: Boolean(watch('address.addressLine1')) // Float label only if there's a value
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('address.addressLine2')}
                error={Boolean(errors?.address?.addressLine2)}
                helperText={errors?.address?.addressLine2?.message}
                fullWidth
                label='Address Line 2'
                placeholder='Apartment, suite, etc. (optional)'
                InputLabelProps={{
                  shrink: Boolean(watch('address.addressLine2')) // Float label only if there's a value
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                {...register('address.city', { required: 'City is required' })}
                error={Boolean(errors?.address?.city)}
                helperText={errors?.address?.city?.message}
                fullWidth
                label='City'
                placeholder='City'
                InputLabelProps={{
                  shrink: Boolean(watch('address.city')) // Float label only if there's a value
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                {...register('address.state', { required: 'State is required' })}
                error={Boolean(errors?.address?.state)}
                helperText={errors?.address?.state?.message}
                fullWidth
                label='State/Province'
                placeholder='State or Province'
                InputLabelProps={{
                  shrink: Boolean(watch('address.state')) // Float label only if there's a value
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                {...register('address.postalCode', { required: 'Postal code is required' })}
                error={Boolean(errors?.address?.postalCode)}
                helperText={errors?.address?.postalCode?.message}
                fullWidth
                label='Postal Code'
                placeholder='Postal/ZIP code'
                InputLabelProps={{
                  shrink: Boolean(watch('address.postalCode')) // Float label only if there's a value
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('address.country', { required: 'Country is required' })}
                error={Boolean(errors?.address?.country)}
                helperText={errors?.address?.country?.message}
                fullWidth
                label='Country'
                placeholder='Country'
                InputLabelProps={{
                  shrink: Boolean(watch('address.country')) // Float label only if there's a value
                }}
              />
            </Grid>

            {/* Hidden fields for coordinates */}
            <input type='hidden' {...register('address.lat')} />
            <input type='hidden' {...register('address.long')} />
          </Grid>
        </DialogContent>

        <DialogActions className='flex justify-end items-center gap-4 sm:pli-16 sm:pbe-6'>
          <Button variant='outlined' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
          <Button type='submit' variant='contained'>
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditClientInfo
