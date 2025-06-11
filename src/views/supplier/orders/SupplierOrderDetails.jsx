import React, { useState, useEffect } from 'react';
import {
    Card,
    Grid,
    Typography,
    Box,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
    Divider,
    Paper
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { RemixIcon } from '@/components/icon/RemixIcon';
import { formatDate, formatCurrency } from '@/utils/format';
import { useSupplierOrderDetails } from '@/hooks/useSupplierOrderDetails';
import { orderStatusColors, orderStatusLabels, orderStatusOptions } from '@/configs/constant';
import { toast } from 'react-toastify';

const SupplierOrderDetails = () => {
    const { orderId } = useParams();
    const { orderDetails, loading, updateStatus, refreshDetails } = useSupplierOrderDetails(orderId);
    const [statusDialog, setStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [notes, setNotes] = useState('');

    const handleStatusUpdate = async () => {
        try {
            await updateStatus(newStatus, notes);
            toast.success('Order status updated successfully');
            setStatusDialog(false);
            refreshDetails();
        } catch (error) {
            toast.error('Failed to update order status');
            console.error('Error updating status:', error);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Card>
                <Box p={3}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h5">
                                    Order #{orderDetails?.orderId}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<RemixIcon icon="ri-edit-line" />}
                                    onClick={() => setStatusDialog(true)}
                                >
                                    Update Status
                                </Button>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} variant="outlined">
                                <Box p={2}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Order Information
                                    </Typography>
                                    <Box mt={2}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Order Date
                                                </Typography>
                                                <Typography variant="body1">
                                                    {formatDate(orderDetails?.orderDate)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Status
                                                </Typography>
                                                <Chip
                                                    label={orderStatusLabels[orderDetails?.status]}
                                                    color={orderStatusColors[orderDetails?.status]}
                                                    size="small"
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} variant="outlined">
                                <Box p={2}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Shipping Information
                                    </Typography>
                                    <Box mt={2}>
                                        <Typography variant="body1">
                                            {orderDetails?.shippingAddress?.name}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {orderDetails?.shippingAddress?.street}
                                            <br />
                                            {orderDetails?.shippingAddress?.city}, {orderDetails?.shippingAddress?.state}
                                            <br />
                                            {orderDetails?.shippingAddress?.country}, {orderDetails?.shippingAddress?.zipCode}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper elevation={0} variant="outlined">
                                <Box p={2}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Order Items
                                    </Typography>
                                    <Box mt={2}>
                                        {orderDetails?.items.map((item, index) => (
                                            <Box key={index} mb={2}>
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item xs={2} sm={1}>
                                                        <img
                                                            src={item.productDetail.images[0]}
                                                            alt={item.productDetail.name}
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6} sm={7}>
                                                        <Typography variant="body1">
                                                            {item.productDetail.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            Quantity: {item.quantity}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <Typography variant="body1" align="right">
                                                            {formatCurrency(item.price * item.quantity)}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                                {index < orderDetails.items.length - 1 && <Divider sx={{ my: 2 }} />}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper elevation={0} variant="outlined">
                                <Box p={2}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Order Summary
                                    </Typography>
                                    <Box mt={2}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={12}>
                                                <Box display="flex" justifyContent="space-between">
                                                    <Typography>Subtotal</Typography>
                                                    <Typography>{formatCurrency(orderDetails?.subtotal)}</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box display="flex" justifyContent="space-between">
                                                    <Typography>Shipping</Typography>
                                                    <Typography>{formatCurrency(orderDetails?.shipping)}</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Divider sx={{ my: 1 }} />
                                                <Box display="flex" justifyContent="space-between">
                                                    <Typography variant="h6">Total</Typography>
                                                    <Typography variant="h6">
                                                        {formatCurrency(orderDetails?.total)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Card>

            <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Update Order Status</DialogTitle>
                <DialogContent>
                    <Box mt={2}>
                        <TextField
                            select
                            fullWidth
                            label="New Status"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            margin="normal"
                        >
                            {orderStatusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            label="Notes"
                            multiline
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            margin="normal"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleStatusUpdate}
                        variant="contained"
                        color="primary"
                        disabled={!newStatus}
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SupplierOrderDetails;
