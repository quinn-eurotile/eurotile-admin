'use client'

// React Imports
import { useState, useMemo } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CustomAvatar from '@core/components/mui/Avatar'

// Table Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import FileTypeIcon from '@/components/common/fileTypeIcon'

// Document Status Label Mapping
const getStatusLabel = status => {
  switch (status) {
    case 1:
      return 'Verified'
    case 0:
      return 'Unverified'
    case 2:
    default:
      return 'Pending'
  }
}

// Column helper for typed columns
const columnHelper = createColumnHelper()

// Main Component
const ProjectListTable = ({ documentData }) => {
  // States
  const [data, setData] = useState(documentData?.documents ?? [])
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  const BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_DOMAIN || 'http://localhost:3001'

  // Columns definition
  const columns = useMemo(
    () => [
      columnHelper.accessor('fileName', {
        header: 'Document Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <FileTypeIcon type={row.original.fileType} />
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.fileName}
              </Typography>
              <Typography variant='body2'>{row.original.docTypeLabel}</Typography>
            </div>
          </div>
        )
      }),

      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: ({ row }) => {
          const createdAt = row.original.createdAt
          const formattedDate = new Date(createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })

          return <Typography>{formattedDate}</Typography>
        }
      }),

      columnHelper.accessor('filePath', {
        header: 'Action',
        cell: ({ row }) => {
          const filePath = row.original.filePath
          const downloadUrl = `${BACKEND_DOMAIN}/${filePath}`

          // Function to handle file download with target blank
          const handleDownload = () => {
            // Create a temporary anchor element
            const link = document.createElement('a')
            link.href = downloadUrl

            // Set the download attribute with the filename
            const fileName = filePath.split('/').pop()
            link.setAttribute('download', fileName) // Trigger download with file name

            // Open the link in a new tab (it will still download the file)
            link.setAttribute('target', '_blank')

            // Append the link to the body, trigger the click, then remove it
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }

          return (
            <Button size='small' variant='outlined' onClick={handleDownload}>
              View
            </Button>
          )
        }
      })
    ],
    []
  )

  // Table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 7
      }
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <Card>
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
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getAllLeafColumns().length} className='text-center'>
                  No data available
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
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
    </Card>
  )
}

export default ProjectListTable
