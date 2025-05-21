'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Box,
  FormControlLabel,
  FormGroup,
  Switch
} from '@mui/material'

import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import CustomAvatar from '@core/components/mui/Avatar'
import { updateStatus } from '@/app/[lang]/(dashboard)/(private)/admin/trade-professionals/list/page'
import { toast } from 'react-toastify'
import AlertDialog from '@/components/common/AlertDialog'
import { fetchById } from '@/app/[lang]/(dashboard)/(private)/admin/trade-professionals/view/[id]/page'

const UserDetails = ({ data }) => {
  const [userData, setUserData] = useState(data ?? [])
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [userStatus, setUserStatus] = useState(userData.status == 1)
  const [rejectionReasonText, setRejectionReasonText] = useState('')
  const [showInput, setShowInput] = useState(false)

  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    description: '',
    confirmText: 'Yes',
    cancelText: 'No',
    confirmColor: 'success',
    cancelColor: 'inherit',
    onConfirm: null
  })

  const roleName = userData.roles?.[0]?.name || 'Unknown'

  const handleUser = async (status, reasonText = '') => {
    // If rejecting and no reason is provided, do not proceed
    if (status === 4 && !reasonText.trim()) {
      toast.error('Rejection reason is required.')
      return // Prevent request and dialog close
    }

    // setIsLoading(true)

    const requestData = {
      reason: status === 4 ? reasonText : null,
      email: userData.email,
      name: userData.name,
      userRole: userData.roles?.[0]?.name || 'Unknown',
      status
    }

    try {
      const response = await updateStatus(userData._id, 'status', requestData)
      console.log(response,'responseresponse')
      toast.success(`User ${status === 3 ? 'approved' : 'rejected'} successfully.`)
      refreshUserDetails(userData._id)
      setDialogOpen(false) // ✅ Only close dialog here
      setRejectionReasonText('') // Clear input after success
    } catch (error) {
      console.error(error)
      toast.error(`Failed to ${status === 3 ? 'approve' : 'reject'} user. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const openConfirmationDialog = ({
    title,
    description,
    confirmText,
    cancelText,
    confirmColor,
    cancelColor,
    status,
    showInput = false
  }) => {
    setShowInput(showInput)
    setDialogConfig({
      title,
      description,
      confirmText,
      cancelText,
      confirmColor,
      cancelColor,
      onConfirm: reason => handleUser(status, reason)
    })
    setDialogOpen(true)
  }

  const refreshUserDetails = async userId => {
    const updatedResult = await fetchById(userId)
    setUserData(updatedResult?.data ?? [])
  }

  return (
    <Card>
      <CardContent className='flex flex-col pbs-12 gap-6'>
        {/* User info */}
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-center flex-col gap-4'>
            <CustomAvatar alt='user-profile' src='/images/avatars/1.png' variant='rounded' size={120} />
            <Typography variant='h5'>{userData.name}</Typography>
            <Chip label={roleName} color='error' size='small' variant='tonal' />
          </div>
        </div>

        {/* Details */}
        <div>
          <Typography variant='h5'>Details</Typography>
          <Divider className='mlb-4' />
          <div className='flex flex-col gap-2'>
            {[
              ['Email', userData.email],
              ['Phone', userData.phone],
              ['Status', userData.status === 0 ? 'Inactive' : 'Active'],
              ['Role', roleName]
            ].map(([label, value]) => (
              <div key={label} className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  {label}:
                </Typography>
                <Typography>{value || 'N/A'}</Typography>
              </div>
            ))}
          </div>
        </div>

        {/* Business Info */}
        {userData.business && (
          <div>
            <Typography variant='h5'>Business Info</Typography>
            <Divider className='mlb-4' />
            <div className='flex flex-col gap-2'>
              {[
                ['Business Name', userData.business.name],
                ['Business Email', userData.business.email],
                ['Business Phone', userData.business.phone]
              ].map(([label, value]) => (
                <div key={label} className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography className='font-medium' color='text.primary'>
                    {label}:
                  </Typography>
                  <Typography>{value || 'N/A'}</Typography>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {userData?.status === 2 ? (
          <div className='flex gap-4 justify-center'>
            <Button
              variant='outlined'
              color='success'
              onClick={() =>
                openConfirmationDialog({
                  title: 'Approve User',
                  description: 'Are you sure you want to approve this user?',
                  confirmText: 'Approve',
                  cancelText: 'Cancel',
                  confirmColor: 'success',
                  cancelColor: 'inherit',
                  status: 3,
                  showInput: false
                })
              }
            >
              Approve
            </Button>

            <Button
              variant='outlined'
              color='error'
              onClick={() =>
                openConfirmationDialog({
                  title: 'Reject User',
                  description: 'Are you sure you want to reject this user?',
                  confirmText: 'Reject',
                  cancelText: 'Cancel',
                  confirmColor: 'error',
                  cancelColor: 'inherit',
                  status: 4,
                  showInput: true
                })
              }
            >
              Reject
            </Button>
          </div>
        ) : userData?.status === 4 ? (
          <Chip label='Status Disabled' color='error' size='small' variant='tonal' />
        ) : (
          <Box gap={2} display='flex' flexDirection='column'>
            <Divider />
            <FormGroup>
              <FormControlLabel
                label='Status'
                control={
                  <Switch
                    checked={userStatus}
                    onChange={async event => {
                      const newStatus = event.target.checked ? 1 : 0
                      try {
                        await updateStatus(userData._id, 'status', { status: newStatus })
                        setUserStatus(newStatus)
                        refreshUserDetails(userData._id)
                        toast.success('User status updated successfully.')
                      } catch (error) {
                        console.error('Error updating user status:', error)
                        toast.error('Failed to update user status.')
                      }
                    }}
                  />
                }
              />
            </FormGroup>
          </Box>
        )}
      </CardContent>

      <AlertDialog
        open={dialogOpen}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmText={dialogConfig.confirmText}
        cancelText={dialogConfig.cancelText}
        confirmColor={dialogConfig.confirmColor}
        cancelColor={dialogConfig.cancelColor}
        onConfirm={dialogConfig.onConfirm}
        onCancel={() => {
          setDialogOpen(false)
          setRejectionReasonText('')
        }}
        isLoading={isLoading}
        showInput={showInput}
        rejectionReasonText={rejectionReasonText}
        setRejectionReasonText={setRejectionReasonText}
      />
    </Card>
  )
}

export default UserDetails
