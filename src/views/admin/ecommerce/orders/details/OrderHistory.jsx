import { useState, useEffect } from 'react'
import { format } from 'date-fns'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'

// Constants
import { orderHistoryActions, orderHistoryActionObj } from '@/configs/constant'
import { getOrderHistory } from '@/app/server/actions'

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch (error) {
        return 'Invalid date'
    }
}

const OrderHistory = ({ orderId }) => {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
              const response = await getOrderHistory(orderId)
                if (response.statusCode === 200) {
                    setHistory(response.data)
                }
            } catch (error) {
                console.error('Failed to fetch order history:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchHistory()
    }, [orderId])

    if (loading) {
        return <div>Loading history...</div>
    }

    return (
        <Card>
            <CardHeader title="Order History" />
            <CardContent>
                <Timeline>
                    {history.map((event, index) => (
                        <TimelineItem key={event._id}>
                            <TimelineOppositeContent color="text.secondary">
                                {formatDate(event.createdAt)}
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineDot color={orderHistoryActionObj[event.action]?.color || 'default'}>
                                    <i className={orderHistoryActionObj[event.action]?.icon || 'ri-question-line'} />
                                </TimelineDot>
                                {index < history.length - 1 && <TimelineConnector />}
                            </TimelineSeparator>
                            <TimelineContent>
                                <Typography variant="body1">
                                    {event.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    by {event.performedBy?.name || 'System'}
                                </Typography>
                                {event.metadata && (
                                    <Typography variant="body2" className="mt-1">
                                        {event.action === orderHistoryActions.STATUS_CHANGED && event.metadata.trackingId && (
                                            <>Tracking ID: {event.metadata.trackingId}</>
                                        )}
                                        {event.action === orderHistoryActions.EMAIL_SENT && event.metadata.supplierName && (
                                            <>Supplier: {event.metadata.supplierName}</>
                                        )}
                                    </Typography>
                                )}
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </Timeline>
            </CardContent>
        </Card>
    )
}

export default OrderHistory
