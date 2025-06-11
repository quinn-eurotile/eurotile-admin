// React Imports
import { useState, useEffect } from 'react';

// MUI Imports
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const TableFilters = ({ setFilter, filter }) => {

  const statusOptions = [
    { value: '', label: 'Select Status' },
    { value: '0', label: 'Cancelled' },
    { value: '1', label: 'Delivered' },
    { value: '2', label: 'Processing' },
    { value: '3', label: 'New' },
    { value: '4', label: 'Shipped' },
    // { value: '5', label: 'Completed' },
    // { value: '6', label: 'Refunded' },
    // { value: '7', label: 'Returned' },
    // { value: '8', label: 'Partially Refunded' },
    // { value: '9', label: 'Partially Returned' },
    // { value: '10', label: 'Partially Delivered' },
    // { value: '11', label: 'Partially Shipped' },
    // { value: '12', label: 'Partially Completed' },
  ];
  return (

          <FormControl fullWidth>
            <InputLabel id='status-select'>Select Status</InputLabel>
            <Select
              fullWidth
              id='select-status'
              label='Select Status'
              value={filter?.status ?? ''}
              onChange={e => setFilter({ ...filter, status: e.target.value })}
              labelId='status-select'
              inputProps={{ placeholder: 'Select Status' }}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}

            </Select>
          </FormControl>
  );
};

export default TableFilters;
