'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// MUI Imports
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

// Hook Imports
import { useSettings } from '@core/hooks/useSettings';
import { useSession } from 'next-auth/react';

// Action Imports
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount
} from '@/app/server/actions/notifications';

const NotificationDropdown = () => {
  // States
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Hooks
  const router = useRouter();
  const { settings } = useSettings();
  const { data: session } = useSession();

  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchUnreadCount, 30000); // Check for new notifications every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      const result = await getNotifications({
        page: pageNum,
        limit: 10,
        filter: {}
      });
      console.log(result,'result fetchNotifications');
      // Safely handle the response with null checks
      const notificationsList = result?.notifications || [];
      const totalPages = result?.totalPages || 1;

      if (pageNum === 1) {
        setNotifications(notificationsList);
      } else {
        setNotifications(prev => [...prev, ...(notificationsList)]);
      }

      setHasMore(pageNum < totalPages);
      setPage(pageNum);
      setUnreadCount(result?.count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again later.');
      setNotifications([]); // Reset notifications on error
      setHasMore(false);
      setUnreadCount(0); // Reset count on error
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const result = await getUnreadNotificationCount();
      console.log(result,'result');
      // Safely handle the count with null check
      setUnreadCount(result?.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0); // Reset count on error
    }
  };

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification?._id) return;

      // Mark as read
      await markNotificationAsRead(notification._id);

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n._id === notification._id ? { ...n, status: 'read' } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      console.log(notification.type , notification.metadata?.orderId?._id,'notification.metadata?.orderId?._id checkk');
      // Navigate based on notification type
      if (notification.type === 'ORDER_STATUS' || notification.type === 'ORDER_CREATION' && notification.metadata?.orderId?._id) {
        router.push(`/admin/ecommerce/orders/${notification.metadata.orderId?._id}`);
      } else if (notification.type === 'PAYMENT_CONFIRMATION' && notification.metadata?.paymentId?._id) {
        router.push(`/admin/ecommerce/payments/${notification.metadata.paymentId?._id}`);
      } else if (notification.type === 'ADMIN_MESSAGE' && notification.metadata?.documentId?._id) {
        router.push(`/admin/ecommerce/documents/${notification.metadata.documentId?._id}`);
      }

      handleClose();
    } catch (error) {
      console.error('Error handling notification click:', error);
      setError('Failed to mark notification as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, status: 'read' }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
      setError('Failed to mark all notifications as read.');
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  const handleErrorClose = () => {
    setError(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER_STATUS':
        return 'ri-shopping-cart-line';
      case 'PAYMENT_CONFIRMATION':
        return 'ri-money-dollar-circle-line';
      case 'ADMIN_MESSAGE':
        return 'ri-message-2-line';
      default:
        return 'ri-notification-line';
    }
  };

  return (
    <>
      <IconButton
        color={unreadCount > 0 ? 'primary' : 'default'}
        onClick={handleClick}
      >
        <Badge badgeContent={unreadCount} color="error">
          <i className="ri-notification-3-line text-xl" />
        </Badge>
      </IconButton>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-end"
        transition
        className="z-50 min-w-[350px] max-w-[400px]"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={handleClose}>
                <div>
                  <div className="flex items-center justify-between p-4">
                    <Typography variant="h6">Notifications</Typography>
                    {unreadCount > 0 && (
                      <Tooltip title="Mark all as read">
                        <IconButton size="small" onClick={handleMarkAllAsRead}>
                          <i className="ri-mail-check-line" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                  <Divider />
                  <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {loading && notifications.length === 0 ? (
                      <ListItem>
                        <ListItemText
                          primary={
                            <div className="flex justify-center">
                              <CircularProgress size={24} />
                            </div>
                          }
                        />
                      </ListItem>
                    ) : notifications.length === 0 ? (
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography align="center" color="textSecondary">
                              No notifications
                            </Typography>
                          }
                        />
                      </ListItem>
                    ) : (
                      notifications.map((notification) => (
                        <ListItem
                          key={notification?._id || Math.random()}
                          button
                          onClick={() => handleNotificationClick(notification)}
                          sx={{
                            bgcolor: notification?.status === 'unread' ? 'action.hover' : 'inherit',
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <i className={getNotificationIcon(notification?.type)} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={notification?.title || 'No title'}
                            secondary={
                              <>
                                <Typography variant="body2" component="span" display="block">
                                  {notification?.message || 'No message'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {notification?.createdAt ? new Date(notification.createdAt).toLocaleString() : 'No date'}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                  {hasMore && (
                    <div className="p-2 text-center">
                      <Button
                        onClick={handleLoadMore}
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationDropdown;
