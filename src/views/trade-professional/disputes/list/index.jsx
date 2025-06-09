'use client';

// React Imports
import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// MUI Imports
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';

// Third-party Imports
import { rankItem } from '@tanstack/match-sorter-utils';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel
} from '@tanstack/react-table';

// Custom Imports
import { useDispatch } from 'react-redux';
import { callCommonAction } from '@/redux-store/slices/common';
import { getDisputesList } from '@/app/server/dispute';
import { getLocalizedUrl } from '@/utils/i18n';
import moment from 'moment';
import { toast } from 'react-toastify';

// Style Imports
import tableStyles from '@core/styles/table.module.css';

const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({ itemRank });
    return itemRank.passed;
};

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => setValue(initialValue), [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => onChange(value), debounce);
        return () => clearTimeout(timeout);
    }, [value]);

    return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />;
};

const columnHelper = createColumnHelper();

const DisputeListTable = () => {
    const dispatch = useDispatch();
    const { lang: locale } = useParams();
    const router = useRouter();
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState({ status: '' });

    useEffect(() => {
        fetchDisputeList(page + 1, rowsPerPage);
    }, [page, rowsPerPage, search, filter]);

    const fetchDisputeList = async (currentPage = 1, pageSize = rowsPerPage) => {
        try {
            dispatch(callCommonAction({ loading: true }));
            const response = await getDisputesList(currentPage, pageSize, search, filter);
            dispatch(callCommonAction({ loading: false }));

            if (response.statusCode === 200 && response.data) {
                const formatted = response.data.docs.map(dispute => ({
                    id: dispute?._id,
                    orderId: dispute?.orderDetails?.orderNumber,
                    issueType: dispute?.issueType,
                    description: dispute?.description,
                    status: dispute?.status,
                    createdAt: dispute?.createdAt,
                    updatedAt: dispute?.updatedAt,
                    attachments: dispute?.attachments,
                    chatThread: dispute?.chatThread
                }));
                setData(formatted);
                setTotalRecords(response.data.totalDocs || 0);
            }
        } catch (error) {
            console.log(error, 'error');
            dispatch(callCommonAction({ loading: false }));
            toast.error('Failed to fetch dispute list');
        } finally {
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        fetchDisputeList(newPage, rowsPerPage);
    };

    const handleChangeRowsPerPage = event => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
        fetchDisputeList(0, newSize);
    };

    const getStatusColor = (status) => {
        const statusMap = {
            0: 'warning', // Pending
            1: 'info',    // In Progress
            2: 'success', // Resolved
            3: 'error'    // Closed
        };
        return statusMap[status] || 'default';
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            0: 'Pending',
            1: 'In Progress',
            2: 'Resolved',
            3: 'Closed'
        };
        return statusMap[status] || 'Unknown';
    };

    const getIssueTypeLabel = (type) => {
        const typeMap = {
            'ORDER_ISSUE': 'Order Issue',
            'PAYMENT_ISSUE': 'Payment Issue',
            'INVOICE_ISSUE': 'Invoice Issue',
            'PRODUCT_ISSUE': 'Product Issue'
        };
        return typeMap[type] || type;
    };

    const handleViewDispute = (disputeId) => {
        router.push(`/trade-professional/disputes/${disputeId}`);
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor('orderId', {
                header: 'Order',
                cell: ({ row }) => (
                    <Typography
                        component={Link}
                        href={getLocalizedUrl(`/trade-professional/orders/view/${row.original?.id}`, locale)}
                        color='primary.main'
                    >
                        {`#${row.original.orderId}`}
                    </Typography>
                )
            }),
            columnHelper.accessor('issueType', {
                header: 'Issue Type',
                cell: ({ row }) => <Typography>{getIssueTypeLabel(row.original.issueType)}</Typography>
            }),
            columnHelper.accessor('description', {
                header: 'Description',
                cell: ({ row }) => <Typography>{row.original.description}</Typography>
            }),
            columnHelper.accessor('status', {
                header: 'Status',
                cell: ({ row }) => (
                    <Chip
                        label={getStatusLabel(row.original.status)}
                        color={getStatusColor(row.original.status)}
                        size="small"
                    />
                )
            }),
            columnHelper.accessor('createdAt', {
                header: 'Created At',
                cell: ({ row }) => <Typography>{moment(row.original.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</Typography>
            }),
            columnHelper.accessor('actions', {
                header: 'Actions',
                cell: ({ row }) => (
                    <Tooltip title='View Dispute'>
                        <IconButton onClick={() => handleViewDispute(row.original.id)}>
                            <i class="ri-eye-line"></i>
                        </IconButton>
                    </Tooltip>
                )
            })
        ],
        [locale]
    );

    const table = useReactTable({
        data,
        columns,
        filterFns: {
            fuzzy: fuzzyFilter
        },
        state: {
            globalFilter: search
        },
        onGlobalFilterChange: setSearch,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel()
    });

    return (
        <Card>
            <Box sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5">Disputes</Typography>
                <Button
                    variant="contained"
                    component={Link}
                    href={getLocalizedUrl('/trade-professional/disputes/create', locale)}
                >
                    Create Dispute
                </Button>
            </Box>

            <Box sx={{ p: 5, pb: 3 }}>
                <DebouncedInput
                    value={search ?? ''}
                    onChange={value => setSearch(String(value))}
                    placeholder="Search disputes..."
                    sx={{ width: '300px' }}
                />
            </Box>

            <div className={tableStyles.tableContainer}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {table.getHeaderGroups().map(headerGroup => (
                                    headerGroup.headers.map(header => (
                                        <TableCell key={header.id}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableCell>
                                    ))
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            <TablePagination
                component="div"
                count={totalRecords}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Card>
    );
};

export default DisputeListTable; 
