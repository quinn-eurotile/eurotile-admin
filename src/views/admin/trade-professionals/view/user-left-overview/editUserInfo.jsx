'use client'

import { useEffect } from 'react'
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
import { update } from '@/app/[lang]/(dashboard)/(private)/admin/trade-professionals/view/[id]/page';
import { toast } from 'react-toastify';

const statusOptions = [
  { label: 'Active', value: 1 },
  { label: 'Inactive', value: 0 },
  { label: 'Suspended', value: 2 }
]

const EditUserInfo = ({ open, setOpen, data }) => {
  const formatInitialData = data => ({
    fullName: data?.name || '',
    email: data?.email || '',
    phone: data?.phone || '',
    role: data?.roles?.[0]?.name || '',
    status: data?.status ?? '',
    businessId: data?.business?._id || '',
    businessName: data?.business?.name || '',
    businessEmail: data?.business?.email || '',
    businessPhone: data?.business?.phone || '',
    businessStatus: data?.business?.status ?? '',
    businessCreatedAt: data?.business?.createdAt || '',
    businessUpdatedAt: data?.business?.updatedAt || ''
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch
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
    reset(formatInitialData(data))
  }


const onSubmit = async (formValues) => {
  try {
    const requestData = {
      name: formValues.fullName,
      email: formValues.email,
      phone: formValues.phone,
      business_name: formValues.businessName,
      business_email: formValues.businessEmail,
      business_phone: formValues.businessPhone,
      status: formValues.status,
      business_status: formValues.businessStatus,
      password: formValues.password || '123456789', // fallback if not shown in form
      accept_term: 1,
    }

    const response = await update(data._id, requestData)

    const isSuccess = response?.statusCode === 200 || response?.statusCode === 201

    if (isSuccess) {
      toast.success(response?.message || 'Operation successful')
      handleClose()
      reset()
      return
    }

    const fieldErrors = response?.data?.errors
    if (fieldErrors) {
      Object.entries(fieldErrors).forEach(([fieldName, messages]) => {
        setError(fieldName, { message: messages?.[0] || 'Invalid value' })
      })
    } else {
      toast.error(response?.message || 'Something went wrong.')
    }

  } catch (error) {
    console.error('User update failed:', error)
    toast.error('Unexpected error occurred. Please try again.')
  }
}




  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='md' scroll='body'>
      <DialogTitle variant='h4' className='flex gap-0 flex-col items-center sm:pbs-16 sm:pbe-6 sm:pli-16 mb-3'>
        <div className='max-sm:is-[80%] max-sm:text-center'>Edit Trade Professional</div>
        <Typography component='span' className='flex flex-col text-center'>
          Updating this user will trigger a privacy audit.
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>

          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Full Name' {...register('fullName')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Email' type='email' {...register('email')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Phone' {...register('phone')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Role' disabled {...register('role')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label='Status'
                  {...register('status')}
                  value={watch('status')}
                  onChange={e => setValue('status', e.target.value)}
                >
                  {statusOptions.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Business Info Fields */}
            <Grid size={{ xs: 12 }}>
              <Typography variant='h5' className='mb-2' sx={{ borderBottom: '1px solid #ebebeb', paddingBottom: '8px' }}>
                Business Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Business Name' {...register('businessName')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Business Email' {...register('businessEmail')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Business Phone' {...register('businessPhone')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Business Status</InputLabel>
                <Select
                  label='Business Status'
                  {...register('businessStatus')}
                  value={watch('businessStatus')}
                  onChange={e => setValue('businessStatus', e.target.value)}
                >
                  {statusOptions.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Read-only business metadata */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label='Business Created At'
                value={new Date(watch('businessCreatedAt')).toLocaleString()}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label='Business Updated At'
                value={new Date(watch('businessUpdatedAt')).toLocaleString()}
                disabled
              />
            </Grid>
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

export default EditUserInfo
