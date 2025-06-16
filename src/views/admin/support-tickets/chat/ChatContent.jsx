// React Imports
import { useEffect, useState, useRef } from 'react';
import moment from 'moment';
import classnames from 'classnames';

// MUI Imports
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';

// Component Imports
import OptionMenu from '@core/components/option-menu';
import AvatarWithBadge from './AvatarWithBadge';
import { statusObj } from './SidebarLeft';
import ChatLog from './ChatLog';
import SendMsgForm from './SendMsgForm';
import UserProfileRight from './UserProfileRight';
import CustomAvatar from '@core/components/mui/Avatar';
// Slice Imports
import { sendMsg } from '@/redux-store/slices/chat';
import { Box } from '@mui/material';
import { useSession } from 'next-auth/react';


// Renders the user avatar with badge and user information
const UserAvatar = ({ activeUser, setUserProfileLeftOpen, setBackdropOpen }) => (
  <div
    className='flex items-center gap-4 cursor-pointer'
    onClick={() => {
      setUserProfileLeftOpen(true);
      setBackdropOpen(true);
    }}
  >
    <AvatarWithBadge
      alt={activeUser?.fullName}
      src={activeUser?.avatar}
      color={activeUser?.avatarColor}
      badgeColor={statusObj[activeUser?.status || 'offline']}
    />
    <div>
      <Typography color='text.primary'>{activeUser?.fullName}</Typography>
      <Typography variant='body2'>{activeUser?.role}</Typography>
    </div>
  </div>
);

const ChatContent = props => {

  // Props
  const {
    chatStore,
    dispatch,
    backdropOpen,
    setBackdropOpen,
    setSidebarOpen,
    isBelowMdScreen,
    isBelowSmScreen,
    isBelowLgScreen,
    messageInputRef,
    socket,
    handleLoadMoreMessages,
    isLoadingMessages,
    hasPrevPageMessages,
    hasNextPageMessages

  } = props;

  const { activeUser } = chatStore;
  // States
  const [userProfileRightOpen, setUserProfileRightOpen] = useState(false);
  const chatContainerRef = useRef(null);
  const { data: session, status } = useSession();

  // console.log('session comming', session);

  useEffect(() => {
    if (!socket.current) return;

    const handleReceiveMessage = (data) => {
      try {
        const parseData = typeof data === 'string' ? JSON.parse(data) : data;
        console.log('Received message:', parseData);
        dispatch(sendMsg({ data: parseData }));
      } catch (error) {
        console.error('Failed to parse received message:', error);
      }
    };

    socket.current.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.current.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket.current, dispatch]);

  // useEffect(() => {
  //   if (!socket.current) return;
  //   // console.log('saxxxx');
  //   const handleReceiveMessage = (data) => {
  //     try {
  //       const parseData = typeof data === 'string' ? JSON.parse(data) : data;
  //       // console.log('Received message:', parseData);
  //       dispatch(sendMsg({ msg: parseData?.message }));
  //     } catch (error) {
  //       console.error('Failed to parse received message:', error);
  //     }
  //   };

  //   socket.current.on('receiveMessage', handleReceiveMessage);

  //   // Cleanup to prevent duplicate listeners
  //   return () => {
  //     socket.current.off('receiveMessage', handleReceiveMessage);
  //   };
  // }, [socket, dispatch]);


  const sendMessage = (messageContent, file) => {

    console.log('file', file);
    if (!socket.current) return;
    let ticketId = props.ticketId;

    // Create message data object
    const messageData = {
      content: messageContent || '',
      senderId: chatStore.profileUser?.id,
      receiverId: chatStore.activeUser?.id,
      sender_detail: {
        _id: session?.user?.id,
        name: session?.user?.name
      },
      timestamp: new Date(),
      ticketId: ticketId
    };

    // If there's a file, convert it to base64
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        messageData.image = file;
        messageData.imageName = file.name;
        messageData.imageType = file.type;
        messageData.imageSize = file.size;
        messageData.hasImage = true;

        // Emit the message with image data
        socket.current.emit("join", { ticketId });
        socket.current.emit('sendMessage', messageData);
      };
      reader.readAsDataURL(file);
    } else {
      // Emit the message without image data
      socket.current.emit("join", { ticketId });
      socket.current.emit('sendMessage', messageData);
    }
  };

  // const sendMessage = (messageContent, file) => {

  //   // console.log('chatStore.profileUser?.id', chatStore.profileUser?.id, chatStore.activeUser?.id);

  //   const messageData = {
  //     content: messageContent,
  //     senderId: chatStore.profileUser?.id,
  //     receiverId: chatStore.activeUser?.id,
  //     sender_detail: {
  //       _id: session?.user?.id,
  //       name: session?.user?.name
  //     },
  //     timestamp: new Date(),
  //     ticketId: ticketId
  //   };


  //   socket.current.emit("join", { ticketId });
  //   // Emit the message to the server
  //   socket.current.emit('sendMessage', JSON.stringify(messageData));
  // };

  // Close user profile right drawer if backdrop is closed and user profile right drawer is open
  useEffect(() => {
    if (!backdropOpen && userProfileRightOpen) {
      setUserProfileRightOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backdropOpen]);

  const renderMessage = (message) => {
    const isOwnMessage = message.sender === chatStore.profileUser?.id;
    const NEXT_PUBLIC_BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

    return (
      <div
        key={message._id}
        className={classnames('flex items-start gap-3', {
          'flex-row-reverse': isOwnMessage
        })}
      >
        <CustomAvatar
          src={isOwnMessage ? chatStore.profileUser?.avatar : chatStore.activeUser?.avatar}
          skin='light'
          size={34}
        />
        <div
          className={classnames('flex flex-col gap-1', {
            'items-end': isOwnMessage
          })}
        >
          <div className='flex items-center gap-2'>
            <Typography variant='subtitle2'>
              {isOwnMessage ? chatStore.profileUser?.name : chatStore.activeUser?.name}
            </Typography>
            <Typography variant='caption'>{moment(message.createdAt).format('h:mm A')}</Typography>
          </div>
          <div
            className={classnames('rounded-lg p-3', {
              'bg-primary/10': isOwnMessage,
              'bg-[var(--mui-palette-customColors-chatBg)]': !isOwnMessage
            })}
          >
            {message.message && (
              <Typography variant='body2'>{message.message}</Typography>
            )}
            {message.fileType === 'image' && message.filePath && (
              <div className='mt-2'>
                <img
                  src={`${NEXT_PUBLIC_BACKEND_DOMAIN}${message.filePath}`}
                  alt={message.fileName}
                  className='max-w-[300px] rounded-lg'
                  onError={(e) => {
                    console.error('Image load error:', e);
                    e.target.src = '/images/error-image.png'; // Fallback image
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return !chatStore.activeUser ? (
    <CardContent className='flex flex-col flex-auto items-center justify-center bs-full gap-[18px] bg-[var(--mui-palette-customColors-chatBg)]'>
      <CustomAvatar variant='circular' size={98} color='primary' skin='light'>
        <i className='ri-wechat-line text-[50px]' />
      </CustomAvatar>
      <Typography className='text-center'>Select a contact to start a conversation.</Typography>
      {isBelowMdScreen && (
        <Button
          variant='contained'
          className='rounded-full'
          onClick={() => {
            setSidebarOpen(true);
            isBelowSmScreen ? setBackdropOpen(false) : setBackdropOpen(true);
          }}
        >
          Select Contact
        </Button>
      )}
    </CardContent>
  ) : (
    <>
      {activeUser && (
        <div className='flex flex-col flex-grow bs-full'>
          <div className='flex items-center justify-between border-be plb-[17px] pli-5 bg-[var(--mui-palette-customColors-chatBg)]'>
            {isBelowMdScreen ? (
              <div className='flex items-center gap-4'>
                <IconButton
                  size='small'
                  onClick={() => {
                    setSidebarOpen(true);
                    setBackdropOpen(true);
                  }}
                >
                  <i className='ri-menu-line text-textSecondary' />
                </IconButton>
                <UserAvatar
                  activeUser={activeUser}
                  setBackdropOpen={setBackdropOpen}
                  setUserProfileLeftOpen={setUserProfileRightOpen}
                />
              </div>
            ) : (
              <UserAvatar
                activeUser={activeUser}
                setBackdropOpen={setBackdropOpen}
                setUserProfileLeftOpen={setUserProfileRightOpen}
              />
            )}

          </div>

          <div
            ref={chatContainerRef}
            // onScroll={handleScroll}
            className='flex-1 overflow-y-auto'
          >


            <ChatLog
              chatStore={chatStore}
              isBelowMdScreen={isBelowMdScreen}
              isBelowSmScreen={isBelowSmScreen}
              isBelowLgScreen={isBelowLgScreen}
              handleLoadMoreMessages={handleLoadMoreMessages}
              isLoadingMessages={isLoadingMessages}
              hasNextPageMessages={hasNextPageMessages}
              hasPrevPageMessages={hasPrevPageMessages}

            />
          </div>

          <SendMsgForm
            dispatch={dispatch}
            activeUser={activeUser}
            isBelowSmScreen={isBelowSmScreen}
            messageInputRef={messageInputRef}
            sendMessage={sendMessage}
          />
        </div>
      )}

      {activeUser && (
        <UserProfileRight
          open={userProfileRightOpen}
          handleClose={() => {
            setUserProfileRightOpen(false);
            setBackdropOpen(false);
          }}
          activeUser={activeUser}
          isBelowSmScreen={isBelowSmScreen}
          isBelowLgScreen={isBelowLgScreen}
        />
      )}
    </>
  );
};

export default ChatContent;
