'use client';

// React Imports
import { useEffect, useState, useMemo } from 'react';
import Grid from '@mui/material/Grid2';
// Next Imports
import Link from 'next/link';

// MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import TablePagination from '@mui/material/TablePagination';

// Third-party Imports
import classnames from 'classnames';
import { rankItem } from '@tanstack/match-sorter-utils';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';

import OptionMenu from '@core/components/option-menu';
import CustomAvatar from '@core/components/mui/Avatar';

// Util Imports
import { getInitials } from '@/utils/getInitials';
import { getLocalizedUrl } from '@/utils/i18n';

// Style Imports
import tableStyles from '@core/styles/table.module.css';

import { deleteSupportTicket, createSupportTicket, getSupportTicketList } from '@/app/server/support-ticket';
import { callCommonAction } from '@/redux-store/slices/common';
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { Box, Tooltip } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import moment from 'moment';
import CommissionCard from './CommissionCard';
import { getTradeProfessionalCommissionList } from '@/app/server/trade-professional';

// Styled Components
const Icon = styled('i')({});

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  // States
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />;
};

const ticketStatusLabel = {
  1: 'Open',
  2: 'Closed',
  3: 'Pending',
  4: 'In Progress',
  5: 'Resolved',
  6: 'Rejected',
  7: 'Cancelled'
};

const ticketStatusObj = {
  1: 'secondary',
  2: 'default',
  3: 'info',
  4: 'primary',
  5: 'success',
  6: 'warning',
  7: 'error'
};

// Column Definitions
const columnHelper = createColumnHelper();

const CommissionListTable = ({userId}) => {
  // Hooks
  const router = useRouter();
  const dispatch = useDispatch();
  const [addSupportTicketOpen, setAddSupportTicketOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [openConfirmation, setOpenConfirmation] = useState(false); // State for dialog
  const [selectedId, setSelectedId] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [editData, setEditData] = useState(null);
  const NEXT_PUBLIC_BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;


  const issueTypeOptions = {
    1: { label: 'Order Issue', color: 'info' },
    2: { label: 'Payment Issue', color: 'default' },
    3: { label: 'Invoice Issue', color: 'warning' },
    4: { label: 'Product Issue', color: 'primary' },
    5: { label: 'General Issue', color: 'error' }
  }


  // Hooks
  const { lang: locale } = useParams();

  useEffect(() => {
    setFilter({ userId: userId });
  }, [userId]);

  useEffect(() => {
    if(userId && filter.userId === userId){
      fetchCommission(page + 1, rowsPerPage);
    }
  }, [page, rowsPerPage, search, filter]);

  const fetchCommission = async (currentPage = 1, pageSize = rowsPerPage) => {
    try {
      dispatch(callCommonAction({ loading: true }));
      const response = await getTradeProfessionalCommissionList(currentPage, pageSize, search, filter);
      //console.log('response', response);
      dispatch(callCommonAction({ loading: false }));
      if (response.statusCode === 200 && response.data) {
        // Define mappings
        const formatted = response?.data?.docs?.map(commission => ({
          id: commission?._id,
          transferId: commission?.transferId,
          amount: commission?.amount,
          status: commission?.status,
          createdAt: commission?.createdAt,
          sourceType: commission?.sourceType,
        }));

        setPage(page);
        setData(formatted);
        setStatsData(response?.data);
        setTotalRecords(response.data.totalDocs || 0);
      }
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
      console.error('Failed to fetch team members', error);
    }
  };

  const refreshList = async () => {
    await fetchCommission();
  };

  const deleteMethod = async valueInBoolean => {
    if (valueInBoolean) {
      try {
        const response = await deleteSupportTicket(selectedId);
        if (response?.statusCode === 200) {
          toast.success(response?.message);
          refreshList();
        }
      } catch (error) {
        setOpenConfirmation(false); // Close the dialog on error as well
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    setPage(0);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('transferId', {
        header: 'Transfer ID',
        cell: ({ row }) => (
          <Tooltip title={row.original?.transferId}>
            <Typography
              variant='body2'
              color='text.primary'
              sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {row.original?.transferId}
            </Typography>
          </Tooltip>
        )
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {row.original?.amount?.toLocaleString(undefined, { style: 'currency', currency: row.original?.currency || 'GBP' })}
          </Typography>
        )
      }),

      columnHelper.accessor('sourceType', {
        header: 'Source Type',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {row.original?.sourceType}
          </Typography>
        )
      }),

      columnHelper.accessor('createdAt', {
        header: 'Created Date',
        cell: ({ row }) => <Typography>{moment(row.original?.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</Typography>
      })
    ],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection
  });

  const getAvatar = params => {
    const { avatar, fullName } = params;

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />;
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(fullName)}
        </CustomAvatar>
      );
    }
  };


  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CommissionCard payoutData={statsData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <Divider />
          <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
            <div></div>
            <div className='flex items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
              <DebouncedInput
                value={search ?? ''}
                onChange={value => setSearch(String(value))}
                placeholder='Search Ticket'
                className='max-sm:is-full'
              />
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.isPlaceholder ? null : (
                          <>
                            <div
                              className={classnames({
                                'flex items-center': header.column.getIsSorted(),
                                'cursor-pointer select-none': header.column.getCanSort()
                              })}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: <i className='ri-arrow-up-s-line text-xl' />,
                                desc: <i className='ri-arrow-down-s-line text-xl' />
                              }[header.column.getIsSorted()] ?? null}
                            </div>
                          </>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getFilteredRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      No data available
                    </td>
                  </tr>
                ) : (
                  table
                    .getRowModel()
                    .rows.slice(0, table.getState().pagination.pageSize)
                    .map(row => (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    ))
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
            rowsPerPageOptions={[1, 10, 20, 50]}
          />
        </Card>
        <ConfirmationDialog
          open={openConfirmation}
          setOpen={setOpenConfirmation}
          type='delete-record'
          callbackMethod={deleteMethod}
        />
      </Grid>
    </Grid>
  );
};

export default CommissionListTable;
