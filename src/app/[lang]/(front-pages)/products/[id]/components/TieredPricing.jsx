'use client'

import { Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { fetchTieredPricing } from '@/services/product/pricing'

const TieredPricing = ({ productId }) => {
  const { data: tieredPricing } = useQuery({
    queryKey: ['tiered-pricing', productId],
    queryFn: () => fetchTieredPricing(productId)
  })

  return (
    <Card sx={{ p: 4, mb: 4 }}>
      <Typography variant='h6' sx={{ mb: 4 }}>
        Tiered Pricing
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Quantity Range</TableCell>
              <TableCell>Price per Unit (ex. VAT)</TableCell>
              <TableCell>Discount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tieredPricing?.map((tier, index) => (
              <TableRow key={index}>
                <TableCell>{`${tier.minQuantity} - ${tier.maxQuantity}`}</TableCell>
                <TableCell>£{tier.pricePerUnit}</TableCell>
                <TableCell>{tier.discount}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default TieredPricing 