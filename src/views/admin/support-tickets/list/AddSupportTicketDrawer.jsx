import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// React Hook Form
import { useForm } from 'react-hook-form'
import TicketFile from './TicketFile';
import { createSupportTicket } from '@/app/server/support-ticket';

const AddSupportTicketDrawer = ({ open, handleClose, refreshList }) => {
  const [parentOptions, setParentOptions] = useState([])
  const [featuredImageFile, setFeaturedImageFile] = useState(null)

  const {
    control,
    register,
    reset,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      subject: '',
      message: '',
      status: '1'
    }
  })

  useEffect(() => {
    register('status', { required: 'Status is required' })
  }, [register])


  const onSubmit = async formValues => {
    try {
      const formData = {
        ...formValues,
        productFeaturedImage: featuredImageFile
      }

      const response = await createSupportTicket(formData)
      console.log(response,'here is the response')

      const statusCode = response?.statusCode
      if (statusCode === 200 || statusCode === 201) {
        refreshList();
        handleClose()
        reset()
        return
      }

      const apiErrors = response?.data?.errors || response?.data || {}
      for (const [field, messages] of Object.entries(apiErrors)) {
        setError(field, {
          message: messages?.[0] || 'Invalid input'
        })
      }
    } catch (error) {
      console.error('Submission failed:', error)
    }
  }

  return (
    <Drawer
      open={open}
      anchor="right"
      variant="temporary"
      onClose={() => {
        handleClose()
        reset()
      }}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className="flex items-center justify-between p-5 pb-4">
        <Typography variant="h5">Add Ticket</Typography>
        <IconButton size="small" onClick={handleClose}>
          <i className="ri-close-line text-2xl" />
        </IconButton>
      </div>
      <Divider />
      <div className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <TextField
            fullWidth
            label="Subject"
            placeholder="Enter Subject"
            {...register('subject', { required: 'Subject is required' })}
            error={Boolean(errors.subject)}
            helperText={errors.subject?.message}
          />

          <TextField
            fullWidth
            label="Message"
            multiline
            rows={5}
            placeholder="Enter message"
            {...register('message', { required: 'Message is required' })}
            error={Boolean(errors.message)}
            helperText={errors.message?.message}
          />

          <TicketFile onChangeImage={setFeaturedImageFile} />

          <div className="flex items-center gap-4">
            <Button variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outlined" color="error" type="button" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddSupportTicketDrawer;
