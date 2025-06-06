'use client';

// React Imports
import React, { useEffect, useState } from 'react';

// MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

// React Hook Form Imports
import { useFormContext, Controller } from 'react-hook-form';

import { Autocomplete, Box, FormControlLabel, FormHelperText, Radio, RadioGroup, Switch } from '@mui/material';

const SampleOrder = ({ rawProductData }) => {
  // Access RHF context methods and form control
  const { control, watch } = useFormContext();
  const [vendorList, setVendorList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [allowSample, setAllowSample] = useState(false);

  useEffect(() => {
    if (rawProductData?.suppliers && Array.isArray(rawProductData?.suppliers)) {
      setVendorList(rawProductData?.suppliers);
    }

    if (rawProductData?.nestedCategories && Array.isArray(rawProductData.nestedCategories)) {
      setCategoryList(rawProductData.nestedCategories);
    }
  }, [rawProductData]);

  console.log(watch('allowSample'), '...........');


  return (
    <Card>
      <CardHeader title='Sample Order' />
      <CardContent>

        <Controller
          name="allowSample"
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  {...field}
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  color="primary"
                />
              }
              label="Allow Sample"
              sx={{ mt: 4 }}
            />
          )}
        />

        {watch('allowSample') && (
          <Box mt={2} display='flex' flexDirection='column' gap={2}>
            <Controller
              name='samples.small.price'
              control={control}
              defaultValue='free'
              render={({ field }) => (
                <FormControl component="fieldset">
                  <RadioGroup {...field}>
                    <FormControlLabel value="free" control={<Radio />} label="15x15cm Sample (Free)" />
                  </RadioGroup>
                </FormControl>
              )}
            />
            <Controller
              name='samples.large.price'
              control={control}
              defaultValue=''
              render={({ field }) => (
                <TextField {...field} label='60x60cm Sample Price' fullWidth />
              )}
            />
            <Controller
              name='samples.full.price'
              control={control}
              defaultValue=''
              render={({ field }) => (
                <TextField {...field} label='Full Size Sample Price' fullWidth />
              )}
            />
          </Box>
        )}

      </CardContent>
    </Card>
  );
};

export default SampleOrder;
