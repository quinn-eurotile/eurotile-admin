'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'

// Component Imports
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import CustomAvatar from '@core/components/mui/Avatar'

// Service Import
import CircularProgress from '@mui/material/CircularProgress'
import { updateStatus } from '@/app/[lang]/(dashboard)/(private)/admin/trade-professionals/list/page'
import { toast } from 'react-toastify'
import AlertDialog from '@/components/common/AlertDialog'
import { Box, FormControlLabel, FormGroup, Switch } from '@mui/material'
import { fetchById } from '@/app/[lang]/(dashboard)/(private)/admin/trade-professionals/view/[id]/page'

const UserDetails = ({ data }) => {
  // const [isLoading, setIsLoading] = useState(false)

  const [userData, setUserData] = useState(data ?? [])
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [userStatus, setUserStatus] = useState(userData.status == 1)

  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    description: '',
    confirmText: 'Yes',
    cancelText: 'No',
    confirmColor: 'success',
    cancelColor: 'inherit',
    onConfirm: null
  })

  if (!userData) return <Typography>Loading...</Typography>

  const roleName = userData.roles?.[0]?.name || 'Unknown'

  // Handles updating the user's status and showing appropriate toast messages
  const handleUser = async status => {
    setIsLoading(true)

    // Determine action label based on status code
    const actionLabel = status === 3 ? 'approved' : 'rejected'

    try {
      await updateStatus(userData._id, 'status', { status })
      toast.success(`User ${actionLabel} successfully.`)
      refreshUserDetails(userData._id)
    } catch (error) {
      console.error(error)
      toast.error(`Failed to ${actionLabel} user. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to open the alert dialog
  const openConfirmationDialog = ({
    title,
    description,
    confirmText = 'Yes',
    cancelText = 'No',
    confirmColor = 'success',
    cancelColor = 'inherit',
    onConfirm
  }) => {
    setDialogConfig({
      title,
      description,
      confirmText,
      cancelText,
      confirmColor,
      cancelColor,
      onConfirm: async () => {
        await onConfirm()
        setDialogOpen(false)
      }
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
        {/* Header */}
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-center flex-col gap-4'>
            <div className='flex flex-col items-center gap-4'>
              <CustomAvatar alt='user-profile' src='/images/avatars/1.png' variant='rounded' size={120} />
              <Typography variant='h5'>{userData.name}</Typography>
            </div>
            <Chip label={roleName} color='error' size='small' variant='tonal' />
          </div>
        </div>

        {/* Details Section */}
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

        {/* Action Buttons */}

        {[2, 4].includes(userData?.status) ? (
          <div className='flex gap-4 justify-center'>
            <Button
              variant='outlined'
              color='success'
              onClick={() =>
                openConfirmationDialog({
                  title: 'Approved User',
                  description: 'Are you sure you want to Approved this user?',
                  confirmText: 'Approved User',
                  cancelText: 'Cancel',
                  confirmColor: 'success',
                  cancelColor: 'error',
                  onConfirm: () => handleUser(3)
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
                  description: 'Are you sure you want to Reject this user?',
                  confirmText: 'Reject User',
                  cancelText: 'Cancel',
                  confirmColor: 'error',
                  cancelColor: 'error',
                  onConfirm: () => handleUser(4)
                })
              }
            >
              Reject
            </Button>
          </div>
        ) : (
          <>
            <Box gap={2} display={'flex'} flexDirection={'column'}>
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
                          setUserStatus(newStatus) // update local state
                          refreshUserDetails(userData._id)
                          toast.success('User status updated successfully.')
                        } catch (error) {
                          console.error('Error updating user status:', error)
                          toast.error('Failed to update user status.')
                        }
                      }}
                    />
                  }
                  sx={{ m: 0 }}
                />
              </FormGroup>
            </Box>
          </>
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
        onCancel={() => setDialogOpen(false)}
        isLoading={isLoading}
      />
    </Card>
  )
}

export default UserDetails
