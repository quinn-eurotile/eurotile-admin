import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    TablePagination
} from '@mui/material';
import { RemixIcon } from '@/components/icon/RemixIcon';
import { formatDate, formatCurrency } from '@/utils/format';
import { useNavigate } from 'react-router-dom';
import { useSupplierOrders } from '@/hooks/useSupplierOrders';
import { orderStatusColors, orderStatusLabels } from '@/configs/constant';

const SupplierOrders = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { orders, loading, total, fetchOrders } = useSupplierOrders();

    useEffect(() => {
        fetchOrders(page + 1, rowsPerPage);
    }, [page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewDetails = (orderId) => {
        navigate(`/supplier/orders/${orderId}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Card>
            <Box p={3}>
                <Typography variant="h5" gutterBottom>
                    My Orders
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order ID</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order._id}>
                                    <TableCell>{order.orderId}</TableCell>
                                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                                    <TableCell>
                                        {order.customer?.name || 'N/A'}
                                    </TableCell>
                                    <TableCell>{order.orderDetails.length}</TableCell>
                                    <TableCell>
                                        {formatCurrency(order.orderDetails.reduce((sum, item) =>
                                            sum + (item.price * item.quantity), 0)
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={orderStatusLabels[order.status]}
                                            color={orderStatusColors[order.status]}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                onClick={() => handleViewDetails(order._id)}
                                                size="small"
                                            >
                                                <RemixIcon icon="ri-eye-line" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>
        </Card>
    );
};

export default SupplierOrders;
