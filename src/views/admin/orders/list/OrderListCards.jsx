'use client';

// MUI Imports
import Grid from '@mui/material/Grid2';

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle';

const OrderListCards = ({ data }) => {
    const cards = [
        {
            title: 'All Orders',
            stats: data?.totalDocs || '0',
            avatarIcon: 'ri-shopping-cart-line',
            avatarColor: 'info',
            trend: 'neutral',
            trendNumber: '100%'
        },
        {
            title: 'New Orders',
            stats: data?.statusSummary?.new || '0',
            avatarIcon: 'ri-file-list-3-line',
            avatarColor: 'primary',
            trend: data?.statusSummary?.new > 0 ? 'positive' : 'negative',
            trendNumber: `${((data?.statusSummary?.new || 0) / (data?.totalDocs || 1) * 100).toFixed(1)}%`
        },
        {
            title: 'Processing',
            stats: data?.statusSummary?.processing || '0',
            avatarIcon: 'ri-loader-4-line',
            avatarColor: 'warning',
            trend: data?.statusSummary?.processing > 0 ? 'positive' : 'negative',
            trendNumber: `${((data?.statusSummary?.processing || 0) / (data?.totalDocs || 1) * 100).toFixed(1)}%`
        },
        {
            title: 'Shipped',
            stats: data?.statusSummary?.shipped || '0',
            avatarIcon: 'ri-truck-line',
            avatarColor: 'success',
            trend: data?.statusSummary?.shipped > 0 ? 'positive' : 'negative',
            trendNumber: `${((data?.statusSummary?.shipped || 0) / (data?.totalDocs || 1) * 100).toFixed(1)}%`
        },
        {
            title: 'Delivered',
            stats: data?.statusSummary?.delivered || '0',
            avatarIcon: 'ri-checkbox-circle-line',
            avatarColor: 'success',
            trend: data?.statusSummary?.delivered > 0 ? 'positive' : 'negative',
            trendNumber: `${((data?.statusSummary?.delivered || 0) / (data?.totalDocs || 1) * 100).toFixed(1)}%`
        },
        {
            title: 'Cancelled',
            stats: data?.statusSummary?.cancelled || '0',
            avatarIcon: 'ri-close-circle-line',
            avatarColor: 'error',
            trend: data?.statusSummary?.cancelled > 0 ? 'negative' : 'positive',
            trendNumber: `${((data?.statusSummary?.cancelled || 0) / (data?.totalDocs || 1) * 100).toFixed(1)}%`
        }
    ];

    return (
        <Grid container spacing={6}>
            {cards.map((item, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                    <HorizontalWithSubtitle {...item} />
                </Grid>
            ))}
        </Grid>
    );
};

export default OrderListCards;
