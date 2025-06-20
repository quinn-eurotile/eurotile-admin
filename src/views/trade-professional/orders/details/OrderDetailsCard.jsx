'use client';

// React Imports
import { useState, useMemo } from 'react';

// MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

// Third-party Imports
import classnames from 'classnames';
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

// Style Imports
import tableStyles from '@core/styles/table.module.css';
import { Avatar, Button, IconButton } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Preview from '../preview';
import html2pdf from 'html2pdf.js';


//   {
//     productName: 'OnePlus 7 Pro',
//     productImage: '/images/apps/ecommerce/product-21.png',
//     brand: 'OnePluse',
//     price: 799,
//     quantity: 1,
//     total: 799
//   },
//   {
//     productName: 'Magic Mouse',
//     productImage: '/images/apps/ecommerce/product-22.png',
//     brand: 'Google',
//     price: 89,
//     quantity: 1,
//     total: 89
//   },
//   {
//     productName: 'Wooden Chair',
//     productImage: '/images/apps/ecommerce/product-23.png',
//     brand: 'Insofar',
//     price: 289,
//     quantity: 2,
//     total: 578
//   },
//   {
//     productName: 'Air Jorden',
//     productImage: '/images/apps/ecommerce/product-24.png',
//     brand: 'Nike',
//     price: 299,
//     quantity: 2,
//     total: 598
//   }
// ]

// Column Definitions
const columnHelper = createColumnHelper();

const OrderTable = ({ orderedProduct }) => {
  //console.log(orderedProduct?.orderDetails, 'orderedProductorderedProduct');

  // States
  const [rowSelection, setRowSelection] = useState({});

  const [data, setData] = useState(orderedProduct?.orderDetails);
  const [globalFilter, setGlobalFilter] = useState('');

  const getAvatar = params => {
    const { avatar, customer } = params;

    if (avatar) {
      return <Avatar src={avatar} />;
    } else {
      return <Avatar>{getInitials(customer)}</Avatar>;
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      },

      columnHelper.accessor('productName', {
        header: 'Product',
        cell: ({ row }) => {
          let productDetail = {};

          try {
            productDetail =
              typeof row?.original?.productDetail === 'string'
                ? JSON.parse(row?.original?.productDetail)
                : row?.original?.productDetail;
          } catch (error) {
            console.error('Error parsing productDetail:', error);
          }

          return (
            <div className='flex items-center gap-3'>
              {getAvatar({
                avatar: `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${productDetail?.variationImages?.[0]?.filePath}`,
                customer: data?.createdBy?.name ?? ''
              })}
              <div className='flex flex-col items-start'>
                <Typography color='text.primary' className='font-medium'>
                  {productDetail?.product?.name || 'N/A'}
                </Typography>
                <Typography variant='body2'>{productDetail?.supplierName}</Typography>
              </div>
            </div>
          );
        }
      }),

      columnHelper.accessor('price', {
        header: 'Price',
        cell: ({ row }) => {
          const price = Number(row.original?.price) || 0;
          return <Typography>{`€${price.toFixed(2)}`}</Typography>;
        }
      }),

      columnHelper.accessor('quantity', {
        header: 'Qty',
        cell: ({ row }) => {
          const quantity = Number(row.original?.quantity) || 0;
          return <Typography>{quantity}</Typography>;
        }
      }),

      columnHelper.accessor('total', {
        header: 'Total',
        cell: ({ row }) => {
          // Safely parse quantity and price as numbers; default to 0 if invalid
          const quantity = Number(row.original?.quantity) || 0;
          const price = Number(row.original?.price) || 0;

          return <Typography>{(quantity * price).toFixed(2)}</Typography>;
        }
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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
        {table.getFilteredRowModel()?.rows?.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                No data available
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody className='border-be'>
            {table
              .getRowModel()
              .rows.slice(0, table.getState().pagination.pageSize)
              .map(row => {
                return (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className='first:is-14'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        )}
      </table>
    </div>
  );
};

const OrderDetailsCard = ({ data }) => {
  const router = useRouter();
  const { lang: locale } = useParams();
  const viewInvoice = () => {
    router.push(`/${locale}/trade-professional/orders/view/invoice/${data?._id}`);
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Input field value state
  const [payoutAmount, setPayoutAmount] = useState('');

  // Open dialog handler
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  // Close dialog handler
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setPayoutAmount(''); // Reset input on close
  };

  const handleDownloadInvoice = () => {
    const element = document.getElementById('invoice-pdf-content');
    if (element) {
      html2pdf()
        .set({
          margin: 0,
          filename: `Invoice-${data?.orderId || 'invoice'}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(element)
        .save();
    }
  };

  // //console.log('data comming', data);

  return (
    <Card>
      <div className='flex items-center justify-between px-4'>
        <CardHeader className='px-0' title='Order Details' />
        <Button variant='contained' color='success' onClick={handleOpenDialog}>
          <i className="ri-eye-line me-2 text-md"></i>
          View Invoice
        </Button>
        
      </div>
      <OrderTable orderedProduct={data} />
      <CardContent className='flex justify-end'>
        <div>
          <div className='flex items-center gap-12'>
            <Typography color='text.primary' className='min-is-[100px]'>
              Subtotal:
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              €{data?.subtotal ? data?.subtotal?.toFixed(2) : '0.00'}
            </Typography>
          </div>
          <div className='flex items-center gap-12'>
            <Typography color='text.primary' className='min-is-[100px]'>
              Shipping Fee:
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              €{data?.shipping ? data?.shipping?.toFixed(2) : '0.00'}
            </Typography>
          </div>
          <div className='flex items-center gap-12'>
            <Typography color='text.primary' className='min-is-[100px]'>
              Discount:
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              €{data?.discount ? data?.discount?.toFixed(2) : '0.00'}
            </Typography>
          </div>
          <div className='flex items-center gap-12'>
            <Typography color='text.primary' className='min-is-[100px]'>
              Tax:
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              €{data?.tax ? data?.tax?.toFixed(2) : '0.00'}
            </Typography>
          </div>
          <div className='flex items-center gap-12'>
            <Typography color='text.primary' className='font-medium min-is-[100px]'>
              Total:
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              €{data?.total ? data?.total.toFixed(2) : '0.00'}
            </Typography>
          </div>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth='md'>
        <DialogTitle sx={{ m: 0, paddingRight: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Order Invoice
          <Button
            variant='contained'
            color='primary'
            size='small'
            sx={{ marginLeft: 2 }}
            onClick={handleDownloadInvoice}
          >
            <i className="ri-download-line me-2 text-md"></i>
            Download Invoice
          </Button>
          <IconButton
            aria-label='close'
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme => theme.palette.grey[500]
            }}
          >
            <i className="ri-close-large-line"></i>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div id="invoice-pdf-content">
            <Preview orderId={data?._id} />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default OrderDetailsCard;
