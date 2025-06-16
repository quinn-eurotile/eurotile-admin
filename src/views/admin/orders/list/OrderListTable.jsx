'use client';

// React Imports
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TablePagination from '@mui/material/TablePagination';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Third Party Imports
import { format } from 'date-fns';
import { toast } from 'react-toastify';

// Component Imports
import OrderListCards from './OrderListCards';
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';

// Hooks
import usePermission from '@/hooks/usePermission';

// Redux
import { useDispatch } from 'react-redux';
import { callCommonAction } from '@/redux-store/slices/common';

// Utils
import { getLocalizedUrl } from '@/utils/i18n';

// Services
import { orderServices } from '@/services/order';

const statusObj = {
    3: { label: 'New', color: 'primary' },
    5: { label: 'Pending', color: 'warning' },
    2: { label: 'Processing', color: 'info' },
    4: { label: 'Shipped', color: 'secondary' },
    1: { label: 'Delivered', color: 'success' },
    0: { label: 'Cancelled', color: 'error' }
};

const customerTypeObj = {
    retail: { label: 'Retail', color: 'primary' },
    trade: { label: 'Trade', color: 'secondary' }
};

const OrderListTable = () => {
    // Hooks
    const router = useRouter();
    const dispatch = useDispatch();
    const canViewOrder = usePermission('view-order');
    const canUpdateOrder = usePermission('update-order');

    // States
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState({
        status: '',
        customerType: '',
        startDate: null,
        endDate: null
    });
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [page, rowsPerPage, search, filter]);

    const fetchOrders = async () => {
        try {
            dispatch(callCommonAction({ loading: true }));

            const queryFilter = {
                ...filter,
                startDate: filter.startDate ? format(filter.startDate, 'yyyy-MM-dd') : undefined,
                endDate: filter.endDate ? format(filter.endDate, 'yyyy-MM-dd') : undefined
            };

            const response = await orderServices.get(page + 1, rowsPerPage, search, queryFilter);

            if (response?.statusCode === 200 && response.data) {
                setData(response.data.docs);
                setTotalRecords(response.data.totalDocs);
            }

            dispatch(callCommonAction({ loading: false }));
        } catch (error) {
            dispatch(callCommonAction({ loading: false }));
            console.error('Failed to fetch orders', error);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = event => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setSelectedOrder(orderId);
        setSelectedStatus(newStatus);
        setOpenConfirmation(true);
    };

    const handleStatusConfirm = async (confirmed) => {
        if (confirmed && selectedOrder && selectedStatus !== null) {
            try {
                dispatch(callCommonAction({ loading: true }));

                const response = await orderServices.updateOrderStatus(selectedOrder, {
                    status: selectedStatus
                });

                if (response?.statusCode === 200) {
                    toast.success('Order status updated successfully');
                    fetchOrders();
                }
            } catch (error) {
                console.error('Failed to update order status', error);
                toast.error('Failed to update order status');
            } finally {
                dispatch(callCommonAction({ loading: false }));
                setOpenConfirmation(false);
                setSelectedOrder(null);
                setSelectedStatus(null);
            }
        } else {
            setOpenConfirmation(false);
            setSelectedOrder(null);
            setSelectedStatus(null);
        }
    };

    return (
        <Card>
            <CardHeader title='Orders' />
            <div className='flex flex-wrap gap-4 p-5'>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <div className='flex flex-wrap gap-4'>
                            <FormControl size='small' style={{ minWidth: 200 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filter.status}
                                    label='Status'
                                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                >
                                    <MenuItem value=''>All</MenuItem>
                                    {Object.entries(statusObj).map(([value, { label }]) => (
                                        <MenuItem key={value} value={value}>{label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size='small' style={{ minWidth: 200 }}>
                                <InputLabel>Customer Type</InputLabel>
                                <Select
                                    value={filter.customerType}
                                    label='Customer Type'
                                    onChange={(e) => setFilter({ ...filter, customerType: e.target.value })}
                                >
                                    <MenuItem value=''>All</MenuItem>
                                    {Object.entries(customerTypeObj).map(([value, { label }]) => (
                                        <MenuItem key={value} value={value}>{label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label='Start Date'
                                    value={filter.startDate}
                                    onChange={(date) => setFilter({ ...filter, startDate: date })}
                                    renderInput={(params) => <TextField size='small' {...params} />}
                                />
                                <DatePicker
                                    label='End Date'
                                    value={filter.endDate}
                                    onChange={(date) => setFilter({ ...filter, endDate: date })}
                                    renderInput={(params) => <TextField size='small' {...params} />}
                                />
                            </LocalizationProvider>
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <div className='flex justify-end'>
                            <TextField
                                size='small'
                                placeholder='Search Order'
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </Grid>
                </Grid>
            </div>

            <div className='overflow-x-auto'>
                <table className='w-full text-left'>
                    <thead>
                        <tr>
                            <th className='p-4'>Order ID</th>
                            <th className='p-4'>Customer</th>
                            <th className='p-4'>Type</th>
                            <th className='p-4'>Date</th>
                            <th className='p-4'>Status</th>
                            <th className='p-4'>Total</th>
                            <th className='p-4'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((order) => (
                            <tr key={order.id} className='border-t hover:bg-gray-50'>
                                <td className='p-4'>{order.orderId}</td>
                                <td className='p-4'>
                                    <div className='flex flex-col'>
                                        <span>{order.customerDetails?.name}</span>
                                        <span className='text-sm text-gray-500'>{order.customerDetails?.email}</span>
                                    </div>
                                </td>
                                <td className='p-4'>
                                    <Chip
                                        label={customerTypeObj[order.customerType]?.label}
                                        color={customerTypeObj[order.customerType]?.color}
                                        size='small'
                                    />
                                </td>
                                <td className='p-4'>
                                    {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                </td>
                                <td className='p-4'>
                                    {canUpdateOrder ? (
                                        <Select
                                            size='small'
                                            value={order.orderStatus}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        >
                                            {Object.entries(statusObj).map(([value, { label }]) => (
                                                <MenuItem key={value} value={Number(value)}>{label}</MenuItem>
                                            ))}
                                        </Select>
                                    ) : (
                                        <Chip
                                            label={statusObj[order.orderStatus]?.label}
                                            color={statusObj[order.orderStatus]?.color}
                                            size='small'
                                        />
                                    )}
                                </td>
                                <td className='p-4'>${order.total.toFixed(2)}</td>
                                <td className='p-4'>
                                    {canViewOrder && (
                                        <IconButton
                                            onClick={() => router.push(getLocalizedUrl(`/admin/orders/${order.id}`))}
                                        >
                                            <i className='ri-eye-line' />
                                        </IconButton>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={7} className='p-4 text-center'>
                                    No orders found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <TablePagination
                component='div'
                count={totalRecords}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <ConfirmationDialog
                open={openConfirmation}
                setOpen={setOpenConfirmation}
                title='Update Order Status'
                message='Are you sure you want to update the order status?'
                onConfirm={handleStatusConfirm}
            />
        </Card>
    );
};

export default OrderListTable;
