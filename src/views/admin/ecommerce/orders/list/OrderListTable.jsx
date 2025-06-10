'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'

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
import TableFilters from './TableFilters'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'
import { format } from 'date-fns'
import { useDispatch } from 'react-redux'
import { callCommonAction } from '@/redux-store/slices/common'
import { orderServices } from '@/services/order'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { getOrderList } from '@/app/server/actions'

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, onChange, debounce])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const statusObj = {
  3: { label: 'New', color: 'primary' },
  5: { label: 'Pending', color: 'warning' },
  2: { label: 'Processing', color: 'info' },
  4: { label: 'Shipped', color: 'secondary' },
  1: { label: 'Delivered', color: 'success' },
  0: { label: 'Cancelled', color: 'error' }
}

const columnHelper = createColumnHelper()

const OrderListTable = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { lang: locale } = useParams()

  // States
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)
  const [search, setSearch] = useState('')

  const fetchOrders = async (currentPage = 1, searchTerm = '') => {
    try {
      dispatch(callCommonAction({ loading: true }))
      console.log(filteredData, 'filteredData')

      const response = await getOrderList(currentPage, rowsPerPage, searchTerm, filteredData)
      console.log(response, 'response')
      if (response?.statusCode === 200 && response.data) {
        const formatted = response.data.docs.map(order => ({
          id: order._id,
          orderId: order.orderId,
          customerName: order.customerDetails?.name || order?.createdByDetails?.name,
          customerEmail: order.customerDetails?.email || order?.createdByDetails?.email ,
          orderStatus: order.orderStatus,
          total: order.total,
          createdAt: order.createdAt,
          items: order.orderDetails?.length || 0
        }))

        setData(formatted)
        setTotalRecords(response.data.totalDocs || 0)
      }

      dispatch(callCommonAction({ loading: false }))
    } catch (error) {
      dispatch(callCommonAction({ loading: false }))
      console.error('Failed to fetch orders', error)
    }
  }

  useEffect(() => {
    if (!filteredData || filteredData.length === 0) return
    fetchOrders(page + 1, search, filteredData)
  }, [page, rowsPerPage, search, filteredData])

  useEffect(() => {
    fetchOrders()
  }, [])

  const columns = useMemo(
    () => [
      columnHelper.accessor('orderId', {
        header: 'Order',
        cell: ({ row }) => (
          <Typography
            component='a'
            href={getLocalizedUrl(`/admin/ecommerce/orders/${row.original.id}`, locale)}
            color='primary.main'
            className='cursor-pointer'
          >
            #{row.original.orderId}
          </Typography>
        )
      }),
      columnHelper.accessor('customerName', {
        header: 'Customer',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography color='text.primary'>{row.original.customerName}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {row.original.customerEmail}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('items', {
        header: 'Items',
        cell: ({ row }) => <Typography>{row.original.items}</Typography>
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: ({ row }) => <Typography>${row.original.total.toFixed(2)}</Typography>
      }),
      columnHelper.accessor('orderStatus', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={statusObj[row.original.orderStatus]?.label}
            color={statusObj[row.original.orderStatus]?.color}
            variant='tonal'
            size='small'
          />
        )
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: ({ row }) => (
          <Typography>{format(new Date(row.original.createdAt), 'MMM dd, yyyy HH:mm')}</Typography>
        )
      })
    ],
    [locale]
  )
  console.log(data, 'data')

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter
    },
    filterFns: {
      fuzzy: fuzzyFilter
    },
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const handleChangePage = (event, newPage) => setPage(newPage)
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

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
      <CardHeader title='Filters' className='pbe-4' />
      <TableFilters setData={setFilteredData} />
      <Divider />
      <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Orders'
          className='max-sm:is-full'
        />
        <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
          <Button
            color='secondary'
            variant='outlined'
            className='max-sm:is-full is-auto'
            startIcon={<i className='ri-upload-2-line' />}
          >
            Export
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
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component='div'
        className='border-bs'
        count={totalRecords}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Card>
  )
}

export default OrderListTable
