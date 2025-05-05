// React Imports
import { useEffect, useState } from 'react';

// MUI Imports
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

// Third-party Imports
import { useForm, Controller } from 'react-hook-form';

// Services
import { categoryService } from '@/services/category';

const AddCategoryDrawer = ({ open, handleClose, editData }) => {
  const [parentOptions, setParentOptions] = useState([]);

  const {
    control,
    reset,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      parent: '',
      status: '1'
    }
  });

  // Populate form for editing
  useEffect(() => {
    if (editData) {
      setValue('id', editData.id || '');
      setValue('name', editData.name || '');
      setValue('parent', editData?.parent?.id || '');
      setValue('status', editData.status?.toString() || '1');
    }
  }, [editData, setValue]);

  // Load parent category options
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAll();
        if (res.statusCode === 200) {
          setParentOptions(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch parent categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (formValues) => {
    try {
      const response = editData
        ? await categoryService.update(editData.id, formValues)
        : await categoryService.create(formValues);
  
      const statusCode = response?.statusCode;
      const success = statusCode === 200 || statusCode === 201;
  
      if (success) {
        handleClose();
        reset();
      } else if (response?.data?.errors) {
        // Handle validation errors from API
        Object.entries(response.data.errors).forEach(([field, messages]) => {
          setError(field, { message: messages?.[0] || 'Invalid value' });
        });
      } else {
        // Handle other API errors
        setError('apiError', {
          message: response?.message || 'An unexpected error occurred.',
        });
      }
    } catch (err) {
      setError('apiError', {
        message: err?.message || 'An error occurred while saving the category.',
      });
    }
  };
  

  const handleDrawerClose = () => {
    handleClose();
    reset();
  };

  return (
    <Drawer
      open={open}
      anchor="right"
      variant="temporary"
      onClose={handleDrawerClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className="flex items-center justify-between p-5 pb-4">
        <Typography variant="h5">
          {editData ? 'Edit Category' : 'Add New Category'}
        </Typography>
        <IconButton size="small" onClick={handleDrawerClose}>
          <i className="ri-close-line text-2xl" />
        </IconButton>
      </div>
      <Divider />

      <div className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Name Field */}
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Category name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Category Name"
                placeholder="Enter category name"
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
            )}
          />

          {/* Parent Category Select */}
          <FormControl fullWidth error={Boolean(errors.parent)}>
            <InputLabel>Parent Category</InputLabel>
            <Controller
              name="parent"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Parent Category">
                  <MenuItem value="">None</MenuItem>
                  {parentOptions.map(option => (
                    <MenuItem key={option._id} value={option._id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.parent && <FormHelperText>{errors.parent.message}</FormHelperText>}
          </FormControl>

          {/* Status Select */}
          <FormControl fullWidth error={Boolean(errors.status)}>
            <InputLabel>Status</InputLabel>
            <Controller
              name="status"
              control={control}
              rules={{ required: 'Status is required' }}
              render={({ field }) => (
                <Select {...field} label="Status">
                  <MenuItem value="1">Active</MenuItem>
                  <MenuItem value="0">Inactive</MenuItem>
                </Select>
              )}
            />
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>

          {/* API Error */}
          {errors.apiError && (
            <Typography color="error" variant="body2">
              {errors.apiError.message}
            </Typography>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <Button variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outlined" color="error" type="button" onClick={handleDrawerClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddCategoryDrawer;
