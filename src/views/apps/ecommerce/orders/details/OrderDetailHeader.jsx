// MUI Imports
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

// Component Imports
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import { paymentStatus, statusChipColor } from '@/components/common/common';
import moment from 'moment';

const OrderDetailHeader = ({ orderData, order, data }) => {

  console.log(data,'orderDataorderDataorderData')
  // Vars
  const buttonProps = (children, color, variant) => ({
    children,
    color,
    variant
  })

  return (
    <div className='flex flex-wrap justify-between sm:items-center max-sm:flex-col gap-y-4'>
      <div className='flex flex-col items-start gap-1'>
        <div className='flex items-center gap-2'>
          <Typography variant='h5'>{`Order #${order}`}</Typography>
          <Chip
            label={statusChipColor[data?.orderStatus]?.text}
            color={statusChipColor[data?.orderStatus]?.color}
            variant='tonal'
            size='small'
          />
          <Chip
            variant='tonal'
            label={paymentStatus[data?.paymentStatus ?? 0]?.text}
            color={paymentStatus[data?.paymentStatus ?? 0]?.color}
            size='small'
          />
        </div>
        <Typography>{moment(data?.updatedAt).format('MMMM Do YYYY, h:mm:ss a')}</Typography>
      </div>
      <OpenDialogOnElementClick
        element={Button}
        elementProps={buttonProps('Delete Order', 'error', 'outlined')}
        dialog={ConfirmationDialog}
        dialogProps={{ type: 'delete-order' }}
      />
    </div>
  )
}

export default OrderDetailHeader
