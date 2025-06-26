import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Autocomplete from '@mui/material/Autocomplete'
// React Hook Form
import { useForm, Controller } from 'react-hook-form'
import { updatePromotion, createPromotion } from '@/app/server/promotion';
import { FormControl, InputLabel, MenuItem, Select, FormHelperText } from '@mui/material'
import { callCommonAction } from '@/redux-store/slices/common'
import { useDispatch } from 'react-redux'
import { getAllCategory } from '@/app/[lang]/(dashboard)/(private)/admin/ecommerce/products/category/list/page';
import { toast } from 'react-toastify'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

const AddPromotionDrawer = ({ open, handleClose, refreshList, editData, setEditData }) => {
  const [featuredImageFile, setFeaturedImageFile] = useState(null)
  const [categories, setCategories] = useState([])
  const dispatch = useDispatch()
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'expired', label: 'Expired' },
  ]

  const discountTypeOptions = [
    { value: 'fixed', label: 'Fixed' },
    { value: 'percentage', label: 'Percentage' }
  ]

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
      name: '',
      discountType: '',
      discountValue: '',
      startDate: '',
      endDate: '',
      selectedCategories: [],
      description: '',
      status: '',
    }
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      dispatch(callCommonAction({ loading: true }));
      const response = await getAllCategory();
      dispatch(callCommonAction({ loading: false }));
      if (response.statusCode === 200 && response.data) {
        setCategories(response?.data);
      }
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
      console.error('Failed to fetch catgories list', error);
    }
  };

  // console.log('editData', editData)

  useEffect(() => {
    if (editData) {
      reset({
        name: editData?.name || '',
        description: editData?.description || '',
        status: editData?.status || 'active',
        discountType: editData?.discountType || 'fixed',
        discountValue: editData?.discountValue || 0,
        startDate: editData?.startDate ? dayjs(editData.startDate).format('MM-DD-YYYY') : '',
        endDate: editData?.endDate ? dayjs(editData.endDate).format('MM-DD-YYYY') : '',
        selectedCategories: editData?.selectedCategories || []
      });
    } else {
      reset({
        name: '',
        description: '',
        status: 'active',
        discountType: 'fixed',
        discountValue: 0,
        code: 'TEST_CODE',
        startDate: '',
        endDate: '',
        selectedCategories: []
      });
    }
  }, [editData, reset])

  useEffect(() => {
    register('selectedCategories', {
      validate: value =>
        value && value.length > 0 ? true : 'At least one category must be selected',
    });
  }, [register]);

  const onSubmit = async (formValues) => {
    try {

      // console.log('formValues', formValues)
      const payload = {
        ...formValues,
        startDate: dayjs(formValues?.startDate, 'MM-DD-YYYY').toDate(),
        endDate: dayjs(formValues?.endDate, 'MM-DD-YYYY').toDate(),
        applicableCategories: formValues?.selectedCategories?.length ? formValues.selectedCategories : [],
      };

      const response = editData
        ? await updatePromotion(editData.id, payload)
        : await createPromotion(payload);

      const { statusCode, data } = response || {};
      const isSuccess = statusCode === 200 || statusCode === 201;

      if (isSuccess) {
        handleClose();
        reset();
        refreshList();
        return;
      } else {
        toast.error('Something went wrong')
      }

    } catch (error) {
      console.error('Submission failed:', error);
    }
  };


  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={() => {
        setEditData(null)
        handleClose()
        reset()
      }}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between p-5 pb-4'>
        <Typography variant='h5'>{editData ? 'Update Promotion' : 'Add Promotion'}</Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {/* Name */}
          <TextField
            fullWidth
            label="Name"
            InputLabelProps={editData ? { shrink: true } : {}}
            placeholder="Enter name"
            {...register('name', { required: 'Name is required' })}
            error={Boolean(errors?.name)}
            helperText={errors?.name?.message}
          />

          {/* Discount Type */}
          <FormControl fullWidth error={Boolean(errors.discountType)}>
            <InputLabel id="discount-type-label">Discount Type</InputLabel>
            <Select
              labelId="discount-type-label"
              label="Discount Type"
              value={watch('discountType') ?? ''}
              {...register('discountType', { required: 'Discount type is required' })}
            >
              {discountTypeOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {errors.discountType && <FormHelperText>{errors.discountType.message}</FormHelperText>}
          </FormControl>

          {/* Discount Value */}
          <TextField
            fullWidth
            label="Discount Value"
            type="number"
            inputProps={{ step: "any" }}
            InputLabelProps={editData ? { shrink: true } : {}}
            placeholder="Enter discount value"
            {...register('discountValue', {
              required: 'Discount value is required',
              valueAsNumber: true,
              min: {
                value: 0,
                message: 'Discount must be a positive number',
              },
            })}
            error={Boolean(errors?.discountValue)}
            helperText={errors?.discountValue?.message}
          />
          {/* {console.log('errors', errors)} */}

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* Start Date */}
            <Controller
              name="startDate"
              control={control}
              rules={{ required: 'Start date is required' }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  label="Start Date"
                  inputFormat="MM-DD-YYYY"
                  value={field.value ? dayjs(field.value, 'MM-DD-YYYY') : null}
                  onChange={(date) =>
                    field.onChange(date ? dayjs(date).format('MM-DD-YYYY') : '')
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.startDate}
                      helperText={errors.startDate?.message}
                    />
                  )}
                />
              )}
            />
            {errors.startDate && <FormHelperText>{errors.startDate.message}</FormHelperText>}

            {/* End Date */}
            <Controller
              name="endDate"
              control={control}
              rules={{
                required: 'End date is required',
                validate: (value) => {
                  const start = dayjs(watch('startDate'), 'MM-DD-YYYY')
                  const end = dayjs(value, 'MM-DD-YYYY')
                  if (!value) return 'End date is required'
                  if (!start.isValid()) return 'Start date is invalid'
                  return end.isAfter(start) || 'End date must be after start date'
                },
              }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  label="End Date"
                  inputFormat="MM-DD-YYYY"
                  value={field.value ? dayjs(field.value, 'MM-DD-YYYY') : null}
                  minDate={
                    watch('startDate')
                      ? dayjs(watch('startDate'), 'MM-DD-YYYY').add(1, 'day')
                      : undefined
                  }
                  onChange={(date) =>
                    field.onChange(date ? dayjs(date).format('MM-DD-YYYY') : '')
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.endDate}
                      helperText={errors.endDate?.message}
                    />
                  )}
                />
              )}
            />
            {errors.endDate && <FormHelperText>{errors.endDate.message}</FormHelperText>}
          </LocalizationProvider>



          {/* Categories Multi-select */}
          <FormControl fullWidth error={Boolean(errors.selectedCategories)}>
            <Autocomplete
              multiple
              disablePortal
              options={categories}
              getOptionLabel={(option) => option?.name || ''}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              value={categories.filter(category =>
                watch('selectedCategories')?.includes(category._id)
              )}
              onChange={(e, newValue) => {
                const selectedIds = newValue.map(item => item._id);
                setValue('selectedCategories', selectedIds, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Category"
                  error={Boolean(errors.selectedCategories)}
                  helperText={errors.selectedCategories?.message}
                />
              )}
            />
          </FormControl>


          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={5}
            InputLabelProps={{ shrink: true }}
            placeholder="Enter description"
            {...register('description', { required: 'Description is required' })}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
          />

          {/* Status */}
          <FormControl fullWidth error={Boolean(errors.status)}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              className="capitalize"
              value={watch('status') ?? ''}
              {...register('status', { required: 'Status is required' })}
            >
              {statusOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>

          {/* Submit Buttons */}
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

export default AddPromotionDrawer
