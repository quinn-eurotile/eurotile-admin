'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

// Services
import { orderServices } from '@/services/order'

// Redux
import { useDispatch } from 'react-redux'
import { callCommonAction } from '@/redux-store/slices/common'
import { getOrderStats } from '@/app/server/actions'

const statusCards = [
  { status: 3, statusKey: 'new',   label: 'New Orders', color: 'primary.main', icon: 'ri-shopping-cart-line' },
  { status: 2, statusKey: 'processing', label: 'Processing', color: 'info.main', icon: 'ri-loader-4-line' },
  { status: 4, statusKey: 'shipped', label: 'Shipped', color: 'secondary.main', icon: 'ri-truck-line' },
  { status: 1, statusKey: 'delivered', label: 'Delivered', color: 'success.main', icon: 'ri-check-double-line' }
]


const OrderCard = () => {
  const dispatch = useDispatch()
  const [stats, setStats] = useState({})

  const fetchStats = async () => {
    try {
      dispatch(callCommonAction({ loading: true }))
      const response = await getOrderStats()
      console.log(response, 'response getOrderStatsgetOrderStats')
      if (response?.statusCode === 200 && response.data) {
        setStats(response.data)
      }

      dispatch(callCommonAction({ loading: false }))
    } catch (error) {
      dispatch(callCommonAction({ loading: false }))
      console.error('Failed to fetch order stats', error)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <Grid container spacing={6}>
      {statusCards.map(card => (
        <Grid key={card.statusKey} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card className='p-6'>
            <div className='flex items-center gap-4'>
              <div
                className='flex items-center justify-center rounded-full bs-14 is-14'
                style={{ backgroundColor: `${card.color}15` }}
              >
                <i className={`${card.icon} text-2xl`} style={{ color: card.color }} />
              </div>
              <div>
                <Typography variant='h4' className='font-medium'>
                  {stats?.statusSummary?.[card.statusKey] || 0}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {card.label}
                </Typography>
              </div>
            </div>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default OrderCard
