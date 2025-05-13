import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';

function AlertDialog({
  open,
  title,
  description,
  confirmText = 'Yes',
  cancelText = 'No',
  confirmColor = 'success',
  cancelColor = 'inherit',
  onConfirm,
  onCancel,
  isLoading = false // Add isLoading prop
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth='xs' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {description && (
          <Typography variant='body2' color='text.secondary'>
            {description}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color={cancelColor} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color={confirmColor}
          variant='contained'
          disabled={isLoading}
          startIcon={isLoading && <CircularProgress size={16} color='inherit' />}
        >
          {isLoading ? `${confirmText}...` : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AlertDialog;
