import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    Grid,
    Button,
    CircularProgress
} from '@mui/material';
import OrderForm from './OrderForm';

const OrderCreation = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreateOrder = async (orderData) => {
        try {
            setLoading(true);

            // Group items by supplier
            const supplierGroups = {};
            for (const item of orderData.items) {
                const supplierId = item.product.supplier;
                if (!supplierGroups[supplierId]) {
                    supplierGroups[supplierId] = [];
                }
                supplierGroups[supplierId].push(item);
            }

            // Create supplier status entries
            const supplierStatuses = Object.keys(supplierGroups).map(supplierId => ({
                supplier: supplierId,
                status: 'pending'
            }));

            // Prepare order details with supplier information
            const orderDetails = orderData.items.map(item => ({
                ...item,
                supplier: item.product.supplier,
                productDetail: JSON.stringify({
                    ...item.product,
                    variationImages: item.product.images,
                    supplier: item.product.supplier
                })
            }));

            const response = await axios.post('/api/orders', {
                ...orderData,
                orderDetails,
                supplierStatuses,
                customer: orderData.customer._id,
                shippingAddress: orderData.shippingAddress._id
            });

            if (response.data.success) {
                toast.success('Order created successfully');
                navigate('/admin/orders');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <Box p={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                                <CircularProgress />
                            </Box>
                        ) : (
                            <OrderForm onSubmit={handleCreateOrder} />
                        )}
                    </Grid>
                </Grid>
            </Box>
        </Card>
    );
};

export default OrderCreation;
