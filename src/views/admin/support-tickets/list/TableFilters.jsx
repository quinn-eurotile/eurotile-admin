// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { Controller, useForm } from 'react-hook-form'
import { Autocomplete, TextField } from '@mui/material'

// Vars
const productStockObj = {
  'In Stock': true,
  'Out of Stock': false
}

const TableFilters = ({ setFilters, rawProductData }) => {
  const [stock, setStock] = useState('')
  const [status, setStatus] = useState('')
  const [categories, setCategories] = useState([])
  const [categoryList, setCategoryList] = useState([])

  useEffect(() => {
    setFilters({
      status: status,
      categories: categories,
      stockStatus: stock
    })
  }, [categories, stock, status, setFilters])

  useEffect(() => {
    if (rawProductData?.nestedCategories && Array.isArray(rawProductData.nestedCategories)) {
      setCategoryList(rawProductData.nestedCategories)
    }
  }, [rawProductData])

  console.log(categoryList, 'categoryListcategoryList')

  function flattenCategories(categories, parent = '', level = 0) {
    return categories.flatMap(cat => {
      const current = {
        id: cat._id,
        title: cat.name,
        fullPath: parent ? `${parent} > ${cat.name}` : cat.name,
        level
      }
      const children = cat.children ? flattenCategories(cat.children, current.fullPath, level + 1) : []
      return [current, ...children]
    })
  }

  const flatOptions = flattenCategories(categoryList)
  const selectedOptions = flatOptions.filter(opt => categories.includes(opt.id))

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='status-select'>Status</InputLabel>
            <Select
              fullWidth
              id='select-status'
              label='Status'
              value={status}
              onChange={e => setStatus(e.target.value)}
              labelId='status-select'
            >
              <MenuItem value=''>Select Status</MenuItem>
              <MenuItem value={0}>Open</MenuItem>
              <MenuItem value={1}>Awaiting</MenuItem>
              <MenuItem value={2}>Response</MenuItem>
              <MenuItem value={3}>Resolved</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
