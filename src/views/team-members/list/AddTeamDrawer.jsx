// React Imports
import { useEffect } from 'react';

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
import { teamMemberService } from '@/services/team-member';



const AddUserDrawer = (props) => {
  // Props
  const { open, handleClose, editTeam } = props;


  // Form Hook
  const {
    control,
    reset,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      status: '',
    },
  });
  // Fill the form when editing
  useEffect(() => {
    if (editTeam) {
      setValue('id', editTeam.id || '');
      setValue('name', editTeam.name || '');
      setValue('email', editTeam.email || '');
      setValue('phone', editTeam.phone || '');
      setValue('status', editTeam.status?.toString() || '1'); // 👈 Fix here

      console.log(editTeam.status?.toString(), 'editTeam.status?.toString() ');


    }
  }, [editTeam, setValue]);



  // Function to handle form submission
  const onSubmit = async (formValues) => {

    // Call appropriate API based on mode
    let response;
    try {
      // API call to create user
      if (editTeam) {
        response = await teamMemberService.updateTeamMember(editTeam.id, formValues);
      } else {
        response = await teamMemberService.createTeamMember(formValues);
      }

        // Check if API call succeeded with status 200
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        handleClose(); // Close drawer
        reset(); // Reset form
      } else {

        if (response?.data?.errors) {
          const fieldErrors = response.data.errors;
          Object.entries(fieldErrors).forEach(([fieldName, messages]) => {
            setError(fieldName, { message: messages[0] || 'Invalid value' });
          });
        } else {
          const errorMessage = response?.message || 'Something went wrong. Please try again.';
          setError('apiError', { message: errorMessage });
        }
      }


    } catch (error) {
      console.error('User creation failed:', error);

      const errorMessage = error?.message || 'Something went wrong. Please try again.';
      setError('apiError', { message: errorMessage });
    }
  };

  // Function to handle form reset and drawer close
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
      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-4">
        <Typography variant="h5"> { editTeam ? 'Edit Team Member' : ' Add Team Member'} </Typography>
        <IconButton size="small" onClick={handleDrawerClose}>
          <i className="ri-close-line text-2xl" />
        </IconButton>
      </div>
      <Divider />

      {/* Form Section */}
      <div className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {/* Full Name Field */}
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Full Name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Full Name"
                placeholder="John Doe"
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
            )}
          />

          {/* Email Field */}
          <Controller
            name="email"
            control={control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Please enter a valid email address',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email"
                placeholder="johndoe@example.com"
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
              />
            )}
          />

          {/* Phone Field */}
          <Controller
            name="phone"
            control={control}
            rules={{ required: 'Phone number is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Phone Number"
                placeholder="(123) 456-7890"
                error={Boolean(errors.phone)}
                helperText={errors.phone?.message}
              />
            )}
          />



          {/* Status Select */}
          <FormControl fullWidth error={Boolean(errors.status)}>
            <InputLabel>Select Status</InputLabel>
            <Controller
              name="status"
              control={control}
              rules={{ required: 'Status is required' }}
              render={({ field }) => (
                <Select {...field} label="Select Status">
                  <MenuItem value="2">Pending</MenuItem>
                  <MenuItem value="1">Active</MenuItem>
                  <MenuItem value="0">Inactive</MenuItem>
                </Select>
              )}
            />
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>

          {/* API Error Display */}
          {errors.apiError && (
            <Typography color="error" variant="body2">
              {errors.apiError.message}
            </Typography>
          )}

          {/* Form Buttons */}
          <div className="flex items-center gap-4">
            <Button variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
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

export default AddUserDrawer;
