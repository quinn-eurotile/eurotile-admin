'use client';
// React Imports

import { useState } from 'react';


// MUI Imports
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon';
import { Autocomplete } from '@mui/material';

const StepAccountDetails = ({
  activeStep,
  handleNext,
  handlePrev,
  countryList,
  stateList,
  cityList,
  register,
  control,
  handleSubmit,
  errors,
  selectedCountry
}) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);

  const handleClickShowPassword = () => {
    setIsPasswordShown(!isPasswordShown);
  };

  const handleClickShowConfirmPassword = () => {
    setIsConfirmPasswordShown(!isConfirmPasswordShown);
  };



  return (
    <>
      <div className='mbe-5'>
        <Typography variant='h4'>Account Information</Typography>
        <Typography>Enter Your Account Details</Typography>
      </div>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('name', { required: 'Name is required' })}
            error={Boolean(errors?.name)}
            helperText={errors.name?.message}
            fullWidth
            label='Name'
            placeholder='John Doe'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('email', { required: 'Email is required' })}
            error={Boolean(errors?.email)}
            helperText={errors.email?.message}
            fullWidth
            type='email'
            label='Email'
            placeholder='johndoe@gmail.com'
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('password', { required: 'Password is required' })}
            error={Boolean(errors?.password)}
            helperText={errors.password?.message}
            fullWidth
            label='Password'
            placeholder='············'
            id='outlined-adornment-password'
            type={isPasswordShown ? 'text' : 'password'}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      edge='end'
                      onClick={handleClickShowPassword}
                      onMouseDown={e => e.preventDefault()}
                      aria-label='toggle password visibility'
                    >
                      <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('confirmPassword', { required: 'Confirm Password is required' })}
            error={Boolean(errors?.confirmPassword)}
            helperText={errors.confirmPassword?.message}
            fullWidth
            label='Confirm Password'
            placeholder='············'
            id='outlined-confirm-password'
            type={isConfirmPasswordShown ? 'text' : 'password'}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      edge='end'
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={e => e.preventDefault()}
                      aria-label='toggle confirm password visibility'
                    >
                      <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
        </Grid>

        <Grid item size={{ xs: 12, sm: 4 }}>
          <Autocomplete
            {...register("country", { required: true })}
            fullWidth
            options={countryList}
            getOptionLabel={(option) => option.name}
            // value={selectedCountry}
            renderInput={(params) => <TextField {...params} label="Country" />}
          />
        </Grid>
        <Grid item size={{ xs: 12, sm: 4 }}>
          <Autocomplete
            {...register("state", { required: true })}
            fullWidth
            options={stateList}
            getOptionLabel={(option) => option.name}
            // value={selectedState}
            renderInput={(params) => <TextField {...params} label="State" />}
          />
        </Grid>
        <Grid item size={{ xs: 12, sm: 4 }}>
          <Autocomplete
            {...register("city", { required: true })}
            fullWidth
            options={cityList}
            getOptionLabel={(option) => option.name}
            // value={selectedCity}
            renderInput={(params) => <TextField {...params} label="City" />}
          />
        </Grid>
        <Grid size={{ xs: 12 }} className='flex justify-between'>
          <Button
            disabled={activeStep === 0}
            color='secondary'
            variant='outlined'
            startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
          >
            Previous
          </Button>
          <Button
            variant='contained'
            onClick={handleNext}
            endIcon={<DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />}
          >
            Next
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default StepAccountDetails;
