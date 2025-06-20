'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

// Third Party Imports
import { format } from 'date-fns'
import { toast } from 'react-toastify'

// Redux
import { useDispatch } from 'react-redux'
import { callCommonAction } from '@/redux-store/slices/common'

// Services
import { updateOrderStatus } from '@/app/server/actions'
import OrderHistory from './OrderHistory'

// Constants
import {
    orderStatus,
    orderStatusObj,
    customerTypes,
    customerTypeObj
} from '@/configs/constant'

// Helper function to safely format dates
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch (error) {
        console.error('Invalid date:', dateString)
        return 'Invalid date'
    }
}

const OrderDetails = ({ orderData: initialOrderData }) => {
    const [order, setOrder] = useState(initialOrderData)
    const [trackingId, setTrackingId] = useState(initialOrderData?.trackingId || '')
    const [status, setStatus] = useState(initialOrderData?.orderStatus)
    const dispatch = useDispatch()

    const handleUpdateStatus = async () => {
        try {
            dispatch(callCommonAction({ loading: true }))

            const response = await updateOrderStatus(order._id, {
                status: Number(status),
                trackingId: trackingId || null,
                orderId: order._id,
                userId: order.updatedBy?._id || order.createdBy?._id
            })

            if (response?.statusCode === 200) {
                toast.success('Order updated successfully')
                setOrder(response.data)
            } else {
                toast.error(response?.message || 'Failed to update order')
            }

            dispatch(callCommonAction({ loading: false }))
        } catch (error) {
            dispatch(callCommonAction({ loading: false }))
            console.error('Failed to update order', error)
            toast.error(error?.message || 'Failed to update order')
        }
    }

    if (!order) return null

    //console.log(initialOrderData,'orderorderorder');

    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12, lg: 8 }}>
                <Card>
                    <CardHeader
                        title={`Order ${order.orderId}`}
                        action={
                            <div>
                                <Chip
                                    label={orderStatusObj[order.orderStatus]?.label}
                                    color={orderStatusObj[order.orderStatus]?.color}
                                />
                            </div>
                        }
                    />
                    <CardContent>
                        <Grid container spacing={6}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant='h6' className='mb-4'>Customer Information</Typography>
                                <div className='space-y-2'>
                                    <Typography>
                                        <span className='font-medium'>Name:</span> {order.createdBy?.name}
                                    </Typography>
                                    <Typography>
                                        <span className='font-medium'>Email:</span> {order.createdBy?.email}
                                    </Typography>
                                    <Typography>
                                        <span className='font-medium'>Phone:</span> {order.createdBy?.phone}
                                    </Typography>
                                    <div className='flex items-center'>
                                        <Typography component="span" className='font-medium mr-2'>
                                            Customer Type:
                                        </Typography>
                                        <Chip
                                            size='small'
                                            label={customerTypeObj[order.customerType]?.label}
                                            color={customerTypeObj[order.customerType]?.color}
                                        />
                                    </div>
                                </div>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant='h6' className='mb-4'>Shipping Information</Typography>
                                <div className='space-y-2'>
                                    <Typography>
                                        <span className='font-medium'>Address:</span><br />
                                        {order.shippingAddress?.street}<br />
                                        {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
                                        {order.shippingAddress?.country}
                                    </Typography>
                                    <Typography>
                                        <span className='font-medium'>Shipping Method:</span> {order.shippingMethod}
                                    </Typography>
                                    {order.trackingId && (
                                        <Typography>
                                            <span className='font-medium'>Tracking ID:</span> {order.trackingId}
                                        </Typography>
                                    )}
                                </div>
                            </Grid>
                        </Grid>

                        <Divider className='my-6' />

                        <Typography variant='h6' className='mb-4'>Order Items</Typography>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left'>
                                <thead>
                                    <tr>
                                        <th className='p-2'>Product</th>
                                        <th className='p-2'>Supplier</th>
                                        <th className='p-2'>Quantity</th>
                                        <th className='p-2'>Price</th>
                                        <th className='p-2'>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order?.orderDetails?.map((item) => {
                                        let productDetail;
                                        try {
                                            productDetail = typeof item.productDetail === 'string'
                                                ? JSON.parse(item.productDetail)
                                                : item.productDetail;
                                        } catch (error) {
                                            console.error('Error parsing product detail:', error);
                                            productDetail = {
                                                product: { name: 'Error loading product', sku: 'N/A' },
                                                supplierName: 'N/A'
                                            };
                                        }

                                        return (
                                            <tr key={item._id} className='border-t'>
                                                <td className='p-2'>
                                                    <div className='flex flex-col'>
                                                        <span>{productDetail?.product?.name || 'Unknown Product'}</span>
                                                        <span className='text-sm text-gray-500'>SKU: {productDetail?.product?.sku || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className='p-2'>{productDetail?.supplierName || 'N/A'}</td>
                                                <td className='p-2'>{item.quantity}</td>
                                                <td className='p-2'>${item.price?.toFixed(2) || '0.00'}</td>
                                                <td className='p-2'>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className='border-t'>
                                        <td colSpan={4} className='p-2 text-right font-medium'>Subtotal:</td>
                                        <td className='p-2'>${order?.subtotal?.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4} className='p-2 text-right font-medium'>Shipping:</td>
                                        <td className='p-2'>${order?.shipping?.toFixed(2)}</td>
                                    </tr>
                                    {order.discount > 0 && (
                                        <tr>
                                            <td colSpan={4} className='p-2 text-right font-medium'>Discount:</td>
                                            <td className='p-2'>-${order?.discount?.toFixed(2)}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td colSpan={4} className='p-2 text-right font-medium'>Tax:</td>
                                        <td className='p-2'>${order?.tax?.toFixed(2)}</td>
                                    </tr>
                                    <tr className='border-t'>
                                        <td colSpan={4} className='p-2 text-right font-medium'>Total:</td>
                                        <td className='p-2 font-medium'>${order?.total?.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
                <Card className="mb-6">
                    <CardHeader title='Order Management' />
                    <CardContent>
                        <div className='space-y-4'>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={status}
                                    label='Status'
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    {Object.entries(orderStatusObj).map(([value, { label }]) => (
                                        <MenuItem key={value} value={Number(value)}>{label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label='Tracking ID'
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                            />

                            <Button
                                fullWidth
                                variant='contained'
                                onClick={handleUpdateStatus}
                            >
                                Update Order
                            </Button>
                        </div>

                        <Divider className='my-6' />

                        <div className='space-y-4'>
                            <Typography variant='h6'>Order Timeline</Typography>
                            <div className='space-y-4'>
                                <div className='flex justify-between'>
                                    <Typography variant='body2'>Order Created</Typography>
                                    <Typography variant='body2' color='textSecondary'>
                                        {formatDate(order?.createdAt)}
                                    </Typography>
                                </div>
                                {order?.updatedAt && order?.updatedAt !== order?.createdAt && (
                                    <div className='flex justify-between'>
                                        <Typography variant='body2'>Last Updated</Typography>
                                        <Typography variant='body2' color='textSecondary'>
                                            {formatDate(order?.updatedAt)}
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <OrderHistory orderId={order._id} />
            </Grid>
        </Grid>
    )
}

export default OrderDetails
