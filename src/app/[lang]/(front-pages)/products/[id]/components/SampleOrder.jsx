'use client'

import { useState } from 'react'
import { Card, Typography, RadioGroup, FormControlLabel, Radio, Button, Box, Alert } from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createSampleOrder, getFreeOrdersCount } from '@/services/product/samples'

const SAMPLE_TYPES = {
  SMALL: {
    size: '15x15cm',
    label: 'Small Sample (15x15cm)',
    description: '1 Free Sample per Month'
  },
  LARGE: {
    size: '60x60cm',
    label: 'Large Sample (60x60cm)',
    description: 'Chargeable'
  },
  FULL: {
    size: 'full',
    label: 'Full-Size Sample',
    description: 'Chargeable'
  }
}

const SampleOrder = ({ product }) => {
  const [selectedType, setSelectedType] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)

  const { data: freeOrdersCount } = useQuery({
    queryKey: ['free-samples-count'],
    queryFn: getFreeOrdersCount
  })

  const { mutate: submitOrder, isLoading } = useMutation({
    mutationFn: createSampleOrder,
    onSuccess: () => {
      setOrderPlaced(true)
    }
  })

  const handleSubmit = () => {
    submitOrder({
      productId: product.id,
      sampleType: selectedType
    })
  }

  const canOrderFree = freeOrdersCount?.remaining > 0

  return (
    <Card sx={{ p: 4 }}>
      <Typography variant='h6' sx={{ mb: 4 }}>
        Order Samples
      </Typography>

      {canOrderFree && (
        <Alert severity='info' sx={{ mb: 4 }}>
          You have {freeOrdersCount?.remaining} free sample(s) remaining this month
        </Alert>
      )}

      <RadioGroup
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        sx={{ mb: 4 }}
      >
        {Object.entries(SAMPLE_TYPES).map(([key, { label, description }]) => (
          <FormControlLabel
            key={key}
            value={key}
            control={<Radio />}
            label={
              <Box>
                <Typography>{label}</Typography>
                <Typography variant='caption' color='text.secondary'>
                  {description}
                </Typography>
              </Box>
            }
          />
        ))}
      </RadioGroup>

      {orderPlaced ? (
        <Alert severity='success'>
          Sample order placed successfully! Track your order in the samples tracking page.
        </Alert>
      ) : (
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={!selectedType || isLoading}
        >
          Order Sample
        </Button>
      )}
    </Card>
  )
}

export default SampleOrder 