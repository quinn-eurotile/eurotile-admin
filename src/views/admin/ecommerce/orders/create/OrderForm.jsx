"use client"

import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton
} from '@mui/material';

import { formatCurrency } from '@/utils/format';

const OrderForm = ({ onSubmit }) => {
    // const [formData, setFormData] = useState({
    //     customer: null,
    //     shippingAddress: null,
    //     items: [],
    //     paymentMethod: 'cod',
    //     notes: '',
    //     status: 'pending'
    // });

    // const [selectedProduct, setSelectedProduct] = useState(null);
    // const [quantity, setQuantity] = useState(1);
    // const [errors, setErrors] = useState({});

    // const { data: customers, isLoading: loadingCustomers } = useGetCustomers();
    // const { data: products, isLoading: loadingProducts } = useGetProducts();

    // const handleCustomerChange = (event, newValue) => {
    //     setFormData(prev => ({
    //         ...prev,
    //         customer: newValue,
    //         shippingAddress: null
    //     }));
    // };

    // const handleAddressChange = (event, newValue) => {
    //     setFormData(prev => ({
    //         ...prev,
    //         shippingAddress: newValue
    //     }));
    // };

    // const handleAddItem = () => {
    //     if (!selectedProduct || quantity < 1) return;

    //     const newItem = {
    //         product: selectedProduct,
    //         quantity: quantity,
    //         price: selectedProduct.price,
    //         total: selectedProduct.price * quantity
    //     };

    //     setFormData(prev => ({
    //         ...prev,
    //         items: [...prev.items, newItem]
    //     }));

    //     setSelectedProduct(null);
    //     setQuantity(1);
    // };

    // const handleRemoveItem = (index) => {
    //     setFormData(prev => ({
    //         ...prev,
    //         items: prev.items.filter((_, i) => i !== index)
    //     }));
    // };

    // const calculateTotal = () => {
    //     return formData.items.reduce((sum, item) => sum + item.total, 0);
    // };

    // const validateForm = () => {
    //     const newErrors = {};
    //     if (!formData.customer) newErrors.customer = 'Customer is required';
    //     if (!formData.shippingAddress) newErrors.shippingAddress = 'Shipping address is required';
    //     if (formData.items.length === 0) newErrors.items = 'At least one item is required';

    //     setErrors(newErrors);
    //     return Object.keys(newErrors).length === 0;
    // };

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     if (validateForm()) {
    //         onSubmit(formData);
    //     }
    // };

  return (
      <>
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
                {/* Customer Selection */}
                <Grid item xs={12} md={6}>
                    <Autocomplete
                        options={customers || []}
                        getOptionLabel={(option) => option.name}
                        value={formData.customer}
                        onChange={handleCustomerChange}
                        loading={loadingCustomers}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Customer"
                                error={!!errors.customer}
                                helperText={errors.customer}
                                required
                            />
                        )}
                    />
                </Grid>

                {/* Shipping Address Selection */}
                <Grid item xs={12} md={6}>
                    <Autocomplete
                        options={formData.customer?.addresses || []}
                        getOptionLabel={(option) => option.address}
                        value={formData.shippingAddress}
                        onChange={handleAddressChange}
                        disabled={!formData.customer}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Shipping Address"
                                error={!!errors.shippingAddress}
                                helperText={errors.shippingAddress}
                                required
                            />
                        )}
                    />
                </Grid>

                {/* Product Selection */}
                <Grid item xs={12}>
                    <Grid container spacing={2} alignItems="flex-end">
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={products || []}
                                getOptionLabel={(option) => `${option.name} (${formatCurrency(option.price)})`}
                                value={selectedProduct}
                                onChange={(e, newValue) => setSelectedProduct(newValue)}
                                loading={loadingProducts}
                                renderInput={(params) => (
                                    <TextField {...params} label="Select Product" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                                InputProps={{ inputProps: { min: 1 } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleAddItem}
                                disabled={!selectedProduct}
                            >
                                Add Item
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Order Items Table */}
                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                    <TableCell align="right">Quantity</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formData.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.product.name}</TableCell>
                                        <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                                        <TableCell align="right">{item.quantity}</TableCell>
                                        <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleRemoveItem(index)} color="error">
                                                <i className="ri-delete-bin-line" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={3} align="right">
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Total:
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" colSpan={2}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {formatCurrency(calculateTotal())}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {errors.items && (
                        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                            {errors.items}
                        </Typography>
                    )}
                </Grid>

                {/* Payment Method */}
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Payment Method</InputLabel>
                        <Select
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                            label="Payment Method"
                        >
                            <MenuItem value="cod">Cash on Delivery</MenuItem>
                            <MenuItem value="bank">Bank Transfer</MenuItem>
                            <MenuItem value="card">Credit Card</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Notes */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Order Notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button type="button" variant="outlined" color="secondary">
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                            Create Order
                        </Button>
                    </Box>
                </Grid>
            </Grid>
      </Box>
    </>
    );
};

export default OrderForm;
