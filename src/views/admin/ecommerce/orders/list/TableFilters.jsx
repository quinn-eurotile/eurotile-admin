'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

const statusOptions = [
  { value: 3, label: 'New' },
  { value: 5, label: 'Pending' },
  { value: 2, label: 'Processing' },
  { value: 4, label: 'Shipped' },
  { value: 1, label: 'Delivered' },
  { value: 0, label: 'Cancelled' }
]

const customerTypeOptions = [
  { value: 'retail', label: 'Retail' },
  { value: 'trade', label: 'Trade Professional' }
]

const TableFilters = ({ setData }) => {
  const [filters, setFilters] = useState({
    status: '',
    customerType: '',
    startDate: null,
    endDate: null
  })

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleApplyFilters = () => {
    const activeFilters = {}

    if (filters.status !== '') {
      activeFilters.status = filters.status
    }

    if (filters.customerType !== '') {
      activeFilters.customerType = filters.customerType
    }

    if (filters.startDate) {
      activeFilters.startDate = filters.startDate.toISOString()
    }

    if (filters.endDate) {
      activeFilters.endDate = filters.endDate.toISOString()
    }

    setData(activeFilters)
  }

  const handleResetFilters = () => {
    setFilters({
      status: '',
      customerType: '',
      startDate: null,
      endDate: null
    })
    setData({})
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card className='p-4'>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <TextField
              select
              fullWidth
              label='Status'
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value=''>All</MenuItem>
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <TextField
              select
              fullWidth
              label='Customer Type'
              value={filters.customerType}
              onChange={e => handleFilterChange('customerType', e.target.value)}
            >
              <MenuItem value=''>All</MenuItem>
              {customerTypeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <DatePicker
              label='Start Date'
              value={filters.startDate}
              onChange={date => handleFilterChange('startDate', date)}
              renderInput={params => <TextField {...params} fullWidth />}
              maxDate={filters.endDate || undefined}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <DatePicker
              label='End Date'
              value={filters.endDate}
              onChange={date => handleFilterChange('endDate', date)}
              renderInput={params => <TextField {...params} fullWidth />}
              minDate={filters.startDate || undefined}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} className='flex justify-end gap-4'>
            <Button variant='outlined' color='secondary' onClick={handleResetFilters}>
              Reset
            </Button>
            <Button variant='contained' onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Card>
    </LocalizationProvider>
  )
}

export default TableFilters
