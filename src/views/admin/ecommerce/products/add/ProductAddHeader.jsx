'use client'

// MUI Imports
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useFormContext } from 'react-hook-form';

const ProductAddHeader = () => {
  const { getValues } = useFormContext();
  const formValues = getValues();
  const isEditMode = !!formValues?._id || !!formValues?.title
  return (
    <div className='flex flex-wrap sm:items-center justify-between max-sm:flex-col gap-6'>
      <div>
        <Typography variant='h4' className='mbe-1'>
           {isEditMode ? 'Edit product' : 'Add a new product'}
        </Typography>
        <Typography>Orders placed across your store</Typography>
      </div>
      <div className='flex flex-wrap max-sm:flex-col gap-4'>
        {/* <Button variant='outlined' color='secondary'>
          Discard
        </Button> */}
        {/* <Button variant='outlined'>Save Draft</Button> */}
        <Button variant='contained' type='submit'>
           {isEditMode ? 'Update Product' : 'Publish Product'}
        </Button>
      </div>
    </div>
  )
}

export default ProductAddHeader
