'use client'

// React Imports
import React, { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

// React Hook Form Imports
import { useFormContext, Controller } from 'react-hook-form'

import {
  Autocomplete,
  Box,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Switch,
  Typography
} from '@mui/material'

// const SampleOrder = ({ rawProductData }) => {
//   // Access RHF context methods and form control
//   const { control, watch } = useFormContext();
//   const [vendorList, setVendorList] = useState([]);
//   const [categoryList, setCategoryList] = useState([]);
//   const [allowSample, setAllowSample] = useState(false);

//   useEffect(() => {
//     if (rawProductData?.suppliers && Array.isArray(rawProductData?.suppliers)) {
//       setVendorList(rawProductData?.suppliers);
//     }

//     if (rawProductData?.nestedCategories && Array.isArray(rawProductData.nestedCategories)) {
//       setCategoryList(rawProductData.nestedCategories);
//     }
//   }, [rawProductData]);

//   // console.log(watch('allowSample'), '...........');

//   return (
//     <Card>
//       <CardHeader title='Sample Order' />
//       <CardContent>

//         <Controller
//           name="allowSample"
//           control={control}
//           defaultValue={false}
//           render={({ field }) => (
//             <FormControlLabel
//               control={
//                 <Switch
//                   {...field}
//                   checked={field.value}
//                   onChange={(e) => field.onChange(e.target.checked)}
//                   color="primary"
//                 />
//               }
//               label="Allow Sample"
//               sx={{ mt: 4 }}
//             />
//           )}
//         />

//         {watch('allowSample') && (
//           <Box mt={2} display='flex' flexDirection='column' gap={2}>
//             <Controller
//               name='samples.small.price'
//               control={control}
//               defaultValue={0}
//               render={({ field }) => (
//                 <FormControl component="fieldset">
//                   <RadioGroup {...field}>
//                     <FormControlLabel value="free" control={<Radio />} label="15x15cm Sample (Free)" />
//                   </RadioGroup>
//                 </FormControl>
//               )}
//             />
//             <Controller
//               name='samples.large.price'
//               control={control}
//               defaultValue=''
//               render={({ field }) => (
//                 <TextField {...field} label='60x60cm Sample Price' fullWidth />
//               )}
//             />
//             <Controller
//               name='samples.full.price'
//               control={control}
//               defaultValue=''
//               render={({ field }) => (
//                 <TextField {...field} label='Full Size Sample Price' fullWidth />
//               )}
//             />
//           </Box>
//         )}

//       </CardContent>
//     </Card>
//   );
// };

const SampleOrder = ({ rawProductData }) => {
  const { control, watch } = useFormContext()
  const [vendorList, setVendorList] = useState([])
  const [categoryList, setCategoryList] = useState([])

  useEffect(() => {
    if (rawProductData?.suppliers && Array.isArray(rawProductData?.suppliers)) {
      setVendorList(rawProductData?.suppliers)
    }

    if (rawProductData?.nestedCategories && Array.isArray(rawProductData.nestedCategories)) {
      setCategoryList(rawProductData.nestedCategories)
    }
  }, [rawProductData])

  const allowSample = watch('allowSample')

  return (
    <Card>
      <CardContent>
        <div className='flex justify-between items-center'>
          <CardHeader className='px-0' title='Sample Order' />

          <Controller
            name='allowSample'
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    {...field}
                    checked={field.value}
                    onChange={e => field.onChange(e.target.checked)}
                    color='primary'
                  />
                }
                label='Allow Sample'
              />
            )}
          />
        </div>

        {allowSample && (
          <Box mt={2} display='flex' flexDirection='column' gap={3}>
            {/* Small Sample (Radio: Free or Not) */}
            <Box>
              <Typography fontWeight={600}>15x15cm Sample</Typography>
              <Controller
                name='samples.small.freePerMonth'
                control={control}
                defaultValue={true}
                render={({ field }) => (
                  <FormControl component='fieldset'>
                    <RadioGroup
                      row
                      {...field}
                      value={field.value ? 'free' : 'paid'}
                      onChange={e => field.onChange(e.target.value === 'free')}
                    >
                      <FormControlLabel value='free' control={<Radio />} label='Free' />
                      <FormControlLabel value='paid' control={<Radio />} label='Paid' />
                    </RadioGroup>
                  </FormControl>
                )}
              />

              <Controller
                name='samples.small.price'
                control={control}
                defaultValue={0}
                rules={{
                  validate: value => {
                    const isFree = watch('samples.small.freePerMonth')
                    if (!isFree && (!value || Number(value) <= 0)) {
                      return 'Enter a price for paid sample'
                    }
                    return true
                  }
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='Price (if Paid)'
                    type='number'
                    fullWidth
                    sx={{ mt: 1 }}
                    disabled={watch('samples.small.freePerMonth')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Box>

            {/* Large Sample */}
            <Box>
              <Typography fontWeight={600}>60x60cm Sample</Typography>
              <Controller
                name='samples.large.price'
                control={control}
                defaultValue=''
                rules={{
                  required: 'Price is required',
                  validate: value => Number(value) > 0 || 'Price must be greater than 0'
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='Price'
                    type='number'
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Box>

            {/* Full Size Sample */}
            <Box>
              <Typography fontWeight={600}>Full Size Sample</Typography>
              <Controller
                name='samples.full.price'
                control={control}
                defaultValue=''
                rules={{
                  required: 'Price is required',
                  validate: value => Number(value) > 0 || 'Price must be greater than 0'
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='Price'
                    type='number'
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default SampleOrder
