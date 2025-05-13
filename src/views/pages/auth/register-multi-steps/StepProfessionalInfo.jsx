'use client';
// MUI Imports
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon';

const StepProfessionalInfo = ({
  activeStep,
  handleNext,
  handlePrev,
  countryList,
  stateList,
  cityList,
  register,
  handleSubmit,
  errors,
}) => {
  return (
    <>
      <div className='mbe-5'>
        <Typography variant='h4'>Personal Information</Typography>
        <Typography>Enter Your Personal Information</Typography>
      </div>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('business.name', { required: 'Business name is required' })}
            error={Boolean(errors?.business?.name)}
            helperText={errors?.business?.name?.message}
            fullWidth
            label='Business Name'
            placeholder='John' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('business.email', { required: 'Email is required' })}
            error={Boolean(errors?.business?.email)}
            helperText={errors?.business?.email?.message}
            fullWidth
            type='email'
            label='Business Email'
            placeholder='johndoe@gmail.com'
          />
        </Grid>

        <Grid size={{ xs: 12 }} className='flex justify-between'>
          <Button
            disabled={activeStep === 0}
            variant='outlined'
            color='secondary'
            onClick={handlePrev}
            startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
          >
            Previous
          </Button>
          <Button
            variant='contained'
            color='success'
            type={`submit`}
            endIcon={<i className='ri-check-line' />}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default StepProfessionalInfo;
