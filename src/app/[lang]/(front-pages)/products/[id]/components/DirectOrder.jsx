'use client'

import { useState } from 'react'
import { Card, Typography, TextField, Button, Box, Grid, Alert } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { createDirectOrder } from '@/services/product/orders'

const DirectOrder = ({ product }) => {
  const [orderSummary, setOrderSummary] = useState(null)
  
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      quantity: 1
    }
  })

  const quantity = watch('quantity')

  const { mutate: submitOrder, isLoading } = useMutation({
    mutationFn: createDirectOrder,
    onSuccess: (data) => {
      setOrderSummary(data)
    }
  })

  const onSubmit = (data) => {
    submitOrder({
      productId: product.id,
      quantity: data.quantity
    })
  }

  return (
    <Card sx={{ p: 4 }}>
      <Typography variant='h6' sx={{ mb: 4 }}>
        Direct Order
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Controller
              name='quantity'
              control={control}
              rules={{ required: true, min: 1 }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label='Quantity'
                  type='number'
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          
          {orderSummary && (
            <Grid item xs={12}>
              <Box sx={{ mb: 4 }}>
                <Typography variant='subtitle1' sx={{ mb: 2 }}>Order Summary</Typography>
                <Typography>Total Price (ex. VAT): £{orderSummary.totalPrice}</Typography>
                <Typography>Number of Boxes: {orderSummary.boxCount}</Typography>
                <Typography>Weight (KG): {orderSummary.weight}</Typography>
                <Typography>Pallets: {orderSummary.palletCount}</Typography>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button 
              variant='contained' 
              type='submit'
              disabled={isLoading}
            >
              Calculate & Buy Now
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

export default DirectOrder 