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
import IconButton from '@mui/material/IconButton';
import TablePagination from '@mui/material/TablePagination';

// Third-party Imports
import classnames from 'classnames';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';

// Component Imports
import TableFilters from './TableFilters';
import AddPromotionDrawer from './AddPromotionDrawer';
import CustomAvatar from '@core/components/mui/Avatar';

// Util Imports
import { getInitials } from '@/utils/getInitials';

// Style Imports
import tableStyles from '@core/styles/table.module.css';

import { deletePromotion, getPromotionList } from '@/app/server/promotion';
import { callCommonAction } from '@/redux-store/slices/common';
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Box, Tooltip } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { description } from 'valibot';



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


// Column Definitions
const columnHelper = createColumnHelper();

const PromotionListTable = () => {
  // Hooks
  const router = useRouter();
  const dispatch = useDispatch();
  const [addPromotionOpen, setAddPromotionOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: '' });
  const [openConfirmation, setOpenConfirmation] = useState(false); // State for dialog
  const [selectedId, setSelectedId] = useState(null);
  const [editData, setEditData] = useState(null);
  const { data: session } = useSession();

  const discountTypeOptions = {
    'fixed': { label: 'Fixed', color: 'info' },
    'percentage': { label: 'Percentage', color: 'info' },
  }
  //'active', 'scheduled', 'expired'
  const statusOptions = {
    'active': { label: 'Active', color: 'success' },
    'scheduled': { label: 'Scheduled', color: 'success' },
    'expired': { label: 'expired', color: 'error' },
  }

  // Hooks
  const { lang: locale } = useParams();

  useEffect(() => {
    console.log(page, 'page', rowsPerPage, 'rowsPerPage')
    fetchPromotion(page + 1, rowsPerPage);
  }, [page, rowsPerPage, search, filter]);

  const fetchPromotion = async (currentPage = 1, pageSize = rowsPerPage) => {
    try {
      dispatch(callCommonAction({ loading: true }));
      const response = await getPromotionList(currentPage, pageSize, search, filter);
      console.log('response', response)
      dispatch(callCommonAction({ loading: false }));
      if (response.statusCode === 200 && response.data) {

        const formatted = response?.data?.docs?.map(promotion => ({
          id: promotion?._id,
          name: promotion?.name,
          description: promotion?.description,
          discountType: promotion?.discountType,
          discountValue: promotion?.discountValue,
          code: promotion?.code,
          status: promotion?.status,
          minOrderValue: promotion?.minOrderValue,
          selectedCategories: promotion?.applicableCategories?.map((el) => el?.id).join(', ') || [],
          catgories: promotion?.applicableCategories?.map((el) => el?.name).join(', ') || 'Unknown',
          products: promotion?.applicableProducts?.map((el) => el?.name).join(', ') || 'Unknown',
          startDate: promotion?.startDate,
          endDate: promotion?.endDate,
        }));
        setPage(page);
        setData(formatted);
        setTotalRecords(response.data.totalDocs || 0);
      }
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
      console.error('Failed to fetch team members', error);
    }
  };

  const refreshList = async () => {
    await fetchPromotion();
  };

  const deleteMethod = async valueInBoolean => {
    if (valueInBoolean) {
      try {
        const response = await deletePromotion(selectedId);
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
    table.setPageSize(newSize)
    setPage(0);
  };

  const handleDeleteConfirmation = id => {
    setSelectedId(id);
    setOpenConfirmation(true);
  };

  // Handle Edit (open AddUserDrawer with current data)
  const handleEdit = id => {
    const selectedData = data.find(result => result.id === id);
    setEditData(selectedData);
    setAddPromotionOpen(true);
  };


  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
          <div className='flex cursor-pointer items-center'>
            <div className='flex flex-col'>
              <Typography variant='body2' className='capitalize'>{row?.original?.name}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('catgories', {
        header: 'Categories',
        cell: ({ row }) => (
          <div className='flex cursor-pointer items-center'>
            <div className='flex flex-col'>
              <Typography variant='body2' className='capitalize'>{row?.original?.catgories}</Typography>
            </div>
          </div>
        )
      }),

      columnHelper.accessor('discountType', {
        header: 'Discount Type',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>

            <Chip
              variant='tonal'
              label={discountTypeOptions[row.original?.discountType]?.label || ''}
              size='small'
              color={discountTypeOptions[row.original?.discountType]?.color || ''}
              className='capitalize'
            />
          </div>
        )
      }),
      columnHelper.accessor('discountValue', {
        header: 'Discount Value',
        cell: ({ row }) => {
          const value = row?.original?.discountValue;
          const type = row?.original?.discountType;

          const formattedValue = type === 'fixed'
            ? `£${value}`
            : type === 'percentage'
              ? `${value}%`
              : value;

          return (
            <div className='flex cursor-pointer items-center'>
              <Typography variant='body2'>{formattedValue}</Typography>
            </div>
          );
        }
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>

            <Chip
              variant='tonal'
              label={statusOptions[row.original?.status]?.label || ''}
              size='small'
              color={statusOptions[row.original?.status]?.color || ''}
              className='capitalize'
            />
          </div>
        )
      }),

      columnHelper.accessor('startDate', {
        header: 'Start / End Date',
        cell: ({ row }) => {
          const start = moment(row.original?.startDate).format('MMMM Do YYYY');
          const end = moment(row.original?.endDate).format('MMMM Do YYYY');
          return (
            <Typography>
              <strong>Start:</strong> {start}<br />
              <strong>End:</strong> {end}
            </Typography>
          );
        }
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => (
          <Tooltip title={row.original?.description}>
            <Typography
              variant='body2'
              color='text.primary'
              sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {row.original?.description}
            </Typography>
          </Tooltip>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleEdit(row.original.id)}>
              <i className='ri-edit-line text-textSecondary' />
            </IconButton>

            <IconButton onClick={() => handleDeleteConfirmation(row.original.id)}>
              <i className='ri-delete-bin-7-line text-textSecondary' />
            </IconButton>

          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, session, locale]
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



  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Filters' />
          <TableFilters setFilter={setFilter} filter={filter} />
          <Divider />
          <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
            <div></div>
            <div className='flex items-center gap-x-4 gap-4 flex-col max-sm:is-full sm:flex-row'>
              <DebouncedInput
                value={search ?? ''}
                onChange={value => setSearch(String(value))}
                placeholder='Search by name, description, price'
                className='max-sm:is-full'
              />

              <Button
                variant='contained'
                onClick={() => setAddPromotionOpen(!addPromotionOpen)}
                className='max-sm:is-full'
              >
                Add Promotion
              </Button>

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
              {table.getFilteredRowModel().rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      No data available
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {table
                    .getRowModel()
                    .rows.slice(0, table.getState().pagination.pageSize)
                    .map(row => {
                      return (
                        <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                          ))}
                        </tr>
                      );
                    })}
                </tbody>
              )}
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
        <AddPromotionDrawer
          open={addPromotionOpen}
          handleClose={() => {
            setAddPromotionOpen(!addPromotionOpen);
            setEditData(null);
          }}
          userData={data}
          setData={setData}
          refreshList={refreshList}
          editData={editData}
          setEditData={setEditData}
        />
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

export default PromotionListTable;
