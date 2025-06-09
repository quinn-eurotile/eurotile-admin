'use client';

// React Imports
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// MUI Imports
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

// Custom Imports
import { createDispute } from '@/app/server/actions';
import { FileUpload } from '@/components/FileUpload';

const CreateDisputeForm = ({ orders }) => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        order: '',
        issueType: '',
        description: '',
        attachments: []
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileUpload = (files) => {
        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await createDispute(formData);
            router.push('/trade-professional/disputes');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const issueTypes = [
        { value: 'ORDER_ISSUE', label: 'Order Issue' },
        { value: 'PAYMENT_ISSUE', label: 'Payment Issue' },
        { value: 'INVOICE_ISSUE', label: 'Invoice Issue' },
        { value: 'PRODUCT_ISSUE', label: 'Product Issue' }
    ];

    return (
        <Card>
            <Box sx={{ p: 5, pb: 3 }}>
                <Typography variant="h5">Create Dispute</Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ p: 5 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={4}>
                    <Grid xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Select Order"
                            name="order"
                            value={formData.order}
                            onChange={handleChange}
                            required
                        >
                            {orders?.map((order) => (
                                <MenuItem key={order._id} value={order._id}>
                                    {order.orderNumber}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Issue Type"
                            name="issueType"
                            value={formData.issueType}
                            onChange={handleChange}
                            required
                        >
                            {issueTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            helperText="Please provide a detailed description of the issue"
                        />
                    </Grid>

                    <Grid xs={12}>
                        <FileUpload
                            onUpload={handleFileUpload}
                            accept="image/*,.pdf"
                            multiple
                            label="Upload Supporting Documents"
                        />
                    </Grid>

                    <Grid xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating...' : 'Create Dispute'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Card>
    );
};

export default CreateDisputeForm; 
