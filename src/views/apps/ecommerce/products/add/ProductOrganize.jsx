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

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'

const ProductOrganize = ({rawProductData}) => {
  console.log(rawProductData,'rawProductrawProduct')
  // Access RHF context methods and form control
  const { control } = useFormContext()
   const [vendorList, setVendorList] = useState([])

  useEffect(() => {
    if (rawProductData?.suppliers && Array.isArray(rawProductData?.suppliers)) {
      setVendorList(rawProductData?.suppliers)
    }
  }, [rawProductData])

  return (
    <Card>
      <CardHeader title="Organize" />
      <CardContent>
        {/* Vendor Select */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="vendor-label">Select Vendor</InputLabel>
          <Controller
            name="vendor"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select
                {...field}
                labelId="vendor-label"
                label="Select Vendor"
                fullWidth
              >
                <MenuItem value="Men's Clothing">Men&apos;s Clothing</MenuItem>
                <MenuItem value="Women's Clothing">Women&apos;s Clothing</MenuItem>
                <MenuItem value="Kid's Clothing">Kid&apos;s Clothing</MenuItem>
              </Select>
            )}
          />
        </FormControl>

        {/* Category Select with Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: 16, marginBottom: 16 }}>
          <FormControl fullWidth>
            <InputLabel id="category-label">Select Category</InputLabel>
            <Controller
              name="category"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="category-label"
                  label="Select Category"
                  fullWidth
                >
                  <MenuItem value="Household">Household</MenuItem>
                  <MenuItem value="Office">Office</MenuItem>
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Management">Management</MenuItem>
                  <MenuItem value="Automotive">Automotive</MenuItem>
                </Select>
              )}
            />
          </FormControl>

          <CustomIconButton size="large" variant="outlined" color="primary" className="min-is-fit">
            <i className="ri-add-line" />
          </CustomIconButton>
        </div>

        {/* Collection Select */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="collection-label">Select Collection</InputLabel>
          <Controller
            name="collection"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select
                {...field}
                labelId="collection-label"
                label="Select Collection"
                fullWidth
              >
                <MenuItem value="Men's Clothing">Men&apos;s Clothing</MenuItem>
                <MenuItem value="Women's Clothing">Women&apos;s Clothing</MenuItem>
                <MenuItem value="Kid's Clothing">Kid&apos;s Clothing</MenuItem>
              </Select>
            )}
          />
        </FormControl>

        {/* Status Select */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="status-label">Select Status</InputLabel>
          <Controller
            name="status"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select
                {...field}
                labelId="status-label"
                label="Select Status"
                fullWidth
              >
                <MenuItem value="Published">Published</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Scheduled">Scheduled</MenuItem>
              </Select>
            )}
          />
        </FormControl>

        {/* Tags TextField */}
        <Controller
          name="tags"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              margin="normal"
              label="Enter Tags"
              placeholder="Fashion, Trending, Summer"
              variant="outlined"
            />
          )}
        />
      </CardContent>
    </Card>
  )
}

export default ProductOrganize
