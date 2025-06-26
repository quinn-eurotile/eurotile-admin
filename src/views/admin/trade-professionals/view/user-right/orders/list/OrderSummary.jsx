
//MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import CustomAvatar from '@core/components/mui/Avatar';
import { useEffect } from 'react';



const OrderSummary = ({ statusSummary }) => {
    // Define label metadata
    const statusArray = [
        {
            key: 'new',
            title: 'New',
            color: 'primary',
            icon: 'ri-star-line'
        },
        {
            key: 'pending',
            title: 'Pending',
            color: 'warning',
            icon: 'ri-time-line'
        },
        {
            key: 'processing',
            title: 'Process',
            color: 'info',
            icon: 'ri-settings-3-line'
        },
        // {
        //   key: 'shipped',
        //   title: 'Shipped',
        //   color: 'primary',
        //   icon: 'ri-truck-line'
        // },
        {
            key: 'delivered',
            title: 'Delivered',
            color: 'success',
            icon: 'ri-check-double-line'
        },
        {
            key: 'cancelled',
            title: 'Cancelled',
            color: 'error',
            icon: 'ri-close-circle-line'
        }
    ];

    const formattedStatusArray = statusArray?.map(item => ({
        stats: `${(statusSummary?.[item.key] ?? 0)}`,
        title: item.title,
        color: item.color,
        icon: item.icon
    }));

    // Merge status count into metadata

    return (
        <Card className='bs-full'>
            <CardHeader
                title='Order Summary'
            //action={<OptionMenu iconClassName='text-textPrimary' options={[]} />}
            />
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {formattedStatusArray?.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <CustomAvatar variant="rounded" color={item.color} className="shadow-xs">
                                <i className={item.icon}></i>
                            </CustomAvatar>
                            <div>
                                <Typography className="leading-4">{item.title}</Typography>
                                <Typography variant="h5">{item.stats}</Typography>
                            </div>
                        </div>
                    ))}
                </div>

            </CardContent>
        </Card>
    );
};

export default OrderSummary;
