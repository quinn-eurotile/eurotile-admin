import { useForm } from 'react-hook-form';
import { useEffect, useRef } from 'react';

// AddUserDrawer Component
const AddUserDrawer = (props) => {
  const { open, handleClose, editTeam } = props;

  // Form Hook
  const {
    register,
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
    mode: 'onSubmit',
    shouldFocusError: true,
  });

  // Fill the form when editing
  useEffect(() => {
    if (editTeam) {
      setValue('name', editTeam.name || '');
      setValue('email', editTeam.email || '');
      setValue('phone', editTeam.phone || '');
      setValue('status', editTeam.status?.toString() || '1');
    }
  }, [editTeam, setValue]);

  const onSubmit = async (formValues) => {
    try {
      let response;

      if (editTeam) {
        response = await teamMemberService.updateTeamMember(editTeam.id, formValues);
      } else {
        response = await teamMemberService.createTeamMember(formValues);
      }

      if (response?.statusCode === 200 || response?.statusCode === 201) {
        handleClose();
        reset();
      } else if (response?.data?.errors) {
        const fieldErrors = response.data.errors;
        Object.entries(fieldErrors).forEach(([fieldName, messages]) => {
          setError(fieldName, { message: messages[0] || 'Invalid value' });
        });
      } else {
        setError('apiError', { message: response?.message || 'Something went wrong.' });
      }
    } catch (error) {
      setError('apiError', { message: error?.message || 'Something went wrong.' });
    }
  };

  return (
    <Drawer
      open={open}
      anchor="right"
      onClose={() => {
        handleClose();
        reset();
      }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className="flex items-center justify-between p-5 pb-4">
        <Typography variant="h5">{editTeam ? 'Edit Team Member' : 'Add Team Member'}</Typography>
        <IconButton onClick={handleClose}>
          <i className="ri-close-line text-2xl" />
        </IconButton>
      </div>
      <Divider />

      <div className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {/* Name */}
          <FormControl fullWidth error={Boolean(errors.name)}>
            <TextField
              label="Full Name"
              placeholder="John Doe"
              {...register('name', { required: 'Full Name is required' })}
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />
          </FormControl>

          {/* Email */}
          <FormControl fullWidth error={Boolean(errors.email)}>
            <TextField
              label="Email"
              placeholder="johndoe@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Please enter a valid email address',
                },
              })}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
          </FormControl>

          {/* Phone */}
          <FormControl fullWidth error={Boolean(errors.phone)}>
            <TextField
              label="Phone Number"
              placeholder="(123) 456-7890"
              {...register('phone', { required: 'Phone number is required' })}
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message}
            />
          </FormControl>

          {/* Status */}
          <FormControl fullWidth error={Boolean(errors.status)}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              defaultValue=""
              {...register('status', { required: 'Status is required' })}
            >
              <MenuItem value="2">Pending</MenuItem>
              <MenuItem value="1">Active</MenuItem>
              <MenuItem value="0">Inactive</MenuItem>
            </Select>
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
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
            <Button variant="outlined" color="error" type="button" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddUserDrawer;
