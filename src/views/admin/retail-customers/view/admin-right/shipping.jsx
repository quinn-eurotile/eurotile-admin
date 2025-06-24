'use client'
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, TextField, Button, Typography, Divider, IconButton } from '@mui/material';
import { toast } from 'react-toastify';
import { getAllShippingOptions, updateShippingOption } from '@/app/server/actions';
import { useDispatch } from 'react-redux';
import { callCommonAction } from '@/redux-store/slices/common';
import Grid from '@mui/material/Grid2';
// import DeleteIcon from '@mui/icons-material/Delete';

const ShippingOptionsAdmin = () => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    // Fetch all shipping options
    const fetchOptions = async () => {
        try {
            dispatch(callCommonAction({ loading: true }));
            const response = await getAllShippingOptions();
            //console.log(response?.data, 'responseresponse')
            dispatch(callCommonAction({ loading: false }));
            if (response.statusCode === 200) {
                setOptions(response?.data || []);
            }
        } catch (error) {
            dispatch(callCommonAction({ loading: false }));
            toast.error('Failed to get shipping options. Please try again.');
        }
    };

    useEffect(() => { fetchOptions(); }, []);

    // Handle update for a single option
    const handleUpdate = async (id, data) => {
        try {
            dispatch(callCommonAction({ loading: true }));
            const response = await updateShippingOption(id, data);
            dispatch(callCommonAction({ loading: false }));
            if (response.success) {
                toast.success('Shipping option updated successfully');
                fetchOptions();
            }
        } catch (error) {
            dispatch(callCommonAction({ loading: false }));
            toast.error('Failed to update shipping option. Please try again.');
        }

    };


    //console.log(options, 'optionsoptions')
    return (
        <Card>
            <CardHeader title="Shipping Options" action={
                <Button variant="contained" disabled={loading}>Add Shipping Option</Button>
            } />
            <CardContent>
                {options.map((option, index) => (
                    <form key={option._id} onSubmit={e => {
                        e.preventDefault();
                        const form = e.target;
                        handleUpdate(option._id, {
                            name: form?.name?.value,
                            cost: Number(form?.cost?.value),
                            minDays: Number(form?.minDays?.value),
                            maxDays: Number(form?.maxDays?.value),
                            description: form?.description?.value,
                            isActive: true
                        });
                    }}>
                        <Grid container spacing={2} alignItems="center" className='mt-4'>
                            <Grid size={{ xs: 12 }} className='mb-2'>
                                <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>{option.name}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField name="cost" label="Cost (£/sq.m)" type="number" defaultValue={option.cost} fullWidth required />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField name="minDays" label="Min Days" type="number" defaultValue={option.minDays} fullWidth required />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField name="maxDays" label="Max Days" type="number" defaultValue={option.maxDays} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField name="description" label="Description" defaultValue={option.description} fullWidth multiline minRows={2} />
                            </Grid>
                            <Grid size={{ xs: 12 }} className='flex justify-end'>
                                <Button type="submit" variant="contained" disabled={loading}>Save</Button>
                            </Grid>
                        </Grid>
                        {index !== options.length - 1 && <Divider sx={{ my: 6 }} />}
                    </form>
                ))}
            </CardContent>
        </Card>
    );
};

export default ShippingOptionsAdmin;