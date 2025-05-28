'use client'
// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
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
} from '@tanstack/react-table'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { useDispatch } from 'react-redux'
import { callCommonAction } from '@/redux-store/slices/common'
import { getOrderList } from '@/app/server/order'
import moment from 'moment'

export const paymentStatus = {
  // 1 = 'pending', 2 = 'paid', 3 = 'failed', 4 = 'refunded'
  2: { text: 'Paid', color: 'success', colorClassName: 'text-success' },
  1: { text: 'Pending', color: 'warning', colorClassName: 'text-warning' },
  4: { text: 'Refunded', color: 'secondary', colorClassName: 'text-secondary' },
  3: { text: 'Failed', color: 'error', colorClassName: 'text-error' }
}

export const statusChipColor = {
  // 1 = 'pending', 2 = 'processing', 3 = 'shipped', 4 = 'delivered', 5 = 'cancelled'
  2: { text: 'Paid', color: 'success', colorClassName: 'text-success' },
  1: { text: 'Pending', color: 'warning', colorClassName: 'text-warning' },
  4: { text: 'Refunded', color: 'secondary', colorClassName: 'text-secondary' },
  3: { text: 'Failed', color: 'error', colorClassName: 'text-error' }
}

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// Column Definitions
const columnHelper = createColumnHelper()

const OrderListTable = ({ orderData }) => {
  const dispatch = useDispatch()
  const [addSupportTicketOpen, setAddSupportTicketOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState({ status: '' })
  const [globalFilter, setGlobalFilter] = useState('')
  const NEXT_PUBLIC_BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_DOMAIN

  // Hooks
  const { lang: locale } = useParams()

  useEffect(() => {
    fetchOrderList()
  }, [])

  // Fetch support tickets from the server
  useEffect(() => {
    fetchOrderList(page)
  }, [page, rowsPerPage, search, filter])

  const fetchOrderList = async (currentPage = 1, pageSize = rowsPerPage) => {
    try {
      dispatch(callCommonAction({ loading: true }))
      const response = await getOrderList(currentPage, pageSize, search, filter)
      dispatch(callCommonAction({ loading: false }))

      if (response.statusCode === 200 && response.data) {
        const formatted = response.data.docs.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          sender: order.sender,
          order: order.order,
          updatedAt: order.updatedAt,
          avatar: order.createdByDetails?.userImage,
          username: order.createdByDetails?.name,
          email: order.createdByDetails?.email,
          supportticketmsgs: order.supportticketmsgs
        }))
        setData(formatted)
        setPage(currentPage) // ✅ Correct page setting
        setTotalRecords(response.data.totalDocs || 0)
      }
    } catch (error) {
      dispatch(callCommonAction({ loading: false }))
      console.error('Failed to fetch order list', error)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage) // Material UI uses zero-based page index
    fetchOrderList(newPage, rowsPerPage)
  }

  const handleChangeRowsPerPage = event => {
    const newPageSize = parseInt(event.target.value, 10)
    table.setPageSize(parseInt(event.target.value))
    setRowsPerPage(newPageSize)
    setPage(1)
    fetchOrderList(1, newPageSize)
  }

  // Vars
  const paypal = '/images/apps/ecommerce/paypal.png'
  const mastercard = '/images/apps/ecommerce/mastercard.png'

  const columns = useMemo(
    () => [
      // {
      //   id: 'select',
      //   header: ({ table }) => (
      //     <Checkbox
      //       {...{
      //         checked: table.getIsAllRowsSelected(),
      //         indeterminate: table.getIsSomeRowsSelected(),
      //         onChange: table.getToggleAllRowsSelectedHandler()
      //       }}
      //     />
      //   ),
      //   cell: ({ row }) => (
      //     <Checkbox
      //       {...{
      //         checked: row.getIsSelected(),
      //         disabled: !row.getCanSelect(),
      //         indeterminate: row.getIsSomeSelected(),
      //         onChange: row.getToggleSelectedHandler()
      //       }}
      //     />
      //   )
      // },
      columnHelper.accessor('orderNumber', {
        header: 'Order',
        cell: ({ row }) => (
          <Typography
            component={Link}
            href={getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original.id}`, locale)}
            color='primary.main'
          >{`#${row.original.orderNumber}`}</Typography>
        )
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: ({ row }) => <Typography>{moment(row.original?.updatedAt).format('MMMM Do YYYY, h:mm:ss a')}</Typography>
      }),
      columnHelper.accessor('createdBy', {
        header: 'Customers',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar({ avatar: row.original.avatar, customer: row.original?.username })}
            <div className='flex flex-col'>
              <Typography
                component={Link}
                href={getLocalizedUrl('/apps/ecommerce/customers/details/879861', locale)}
                color='text.primary'
                className='font-medium hover:text-primary'
              >
                {row.original.username}
              </Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('paymentStatus', {
        header: 'Payment',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <i
              className={classnames(
                'ri-circle-fill bs-2.5 is-2.5',
                paymentStatus[row.original?.paymentStatus]?.colorClassName
              )}
            />
            <Typography color={`${paymentStatus[row.original?.paymentStatus]?.color}.main`} className='font-medium'>
              {paymentStatus[row.original?.paymentStatus]?.text}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('orderStatus', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={statusChipColor[row.original.orderStatus]?.text}
            color={statusChipColor[row.original.orderStatus]?.color}
            variant='tonal'
            size='small'
          />
        )
      }),
      columnHelper.accessor('method', {
        header: 'Method',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <div className='flex justify-center items-center bg-[#F6F8FA] rounded-sm is-[29px] bs-[18px]'>
              <img
                src={row.original.method === 'mastercard' ? mastercard : paypal}
                height={row.original.method === 'mastercard' ? 11 : 14}
              />
            </div>
            <Typography>
              {`...${row.original.method === 'mastercard' ? row.original.methodNumber : '@gmail.com'}`}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-[22px]'
              options={[
                {
                  text: 'View',
                  icon: 'ri-eye-line',
                  href: getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original.order}`, locale),
                  linkProps: { className: 'flex items-center is-full gap-2 plb-2 pli-4' }
                },
                {
                  text: 'Delete',
                  icon: 'ri-delete-bin-7-line text-[22px]',
                  menuItemProps: {
                    onClick: () => setData(data?.filter(order => order.id !== row.original.id)),
                    className: 'flex items-center gap-2'
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  const table = useReactTable({
    data: data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const getAvatar = params => {
    const { avatar, customer } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(customer)}
        </CustomAvatar>
      )
    }
  }

  return (
    <Card>
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInput
  placeholder='Search orders...'
  value={search}
  onChange={value => {
    setSearch(value)
    setPage(1)
    fetchOrderList(1, rowsPerPage)
  }}
  fullWidth
/>
      </CardContent>
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
                  )
                })}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        component='div'
        count={5}
        page={1}
        onPageChange={handleChangePage}
        rowsPerPage={10}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[1, 10, 20, 50]}
      />
    </Card>
  )
}

export default OrderListTable
