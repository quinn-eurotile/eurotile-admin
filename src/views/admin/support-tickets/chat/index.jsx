'use client';

// React Imports
import { useEffect, useRef, useState, useCallback } from 'react';
// MUI Imports
import Backdrop from '@mui/material/Backdrop';
import useMediaQuery from '@mui/material/useMediaQuery';

// Third-party Imports
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

// Slice Imports
import { getActiveUserData, setChatData } from '@/redux-store/slices/chat'; // Add fetchChatData

// Component Imports
import SidebarLeft from './SidebarLeft';
import ChatContent from './ChatContent';

// Hook Imports
import { useSettings } from '@core/hooks/useSettings';
import io from 'socket.io-client';
// Util Imports
import { commonLayoutClasses } from '@layouts/utils/layoutClasses';
import { useParams, useRouter } from 'next/navigation';
import { getChatMessageForTicket, loadMoreTickets, loadMoreMessages } from '@/app/server/support-ticket-chat';
import { callCommonAction } from '@/redux-store/slices/common';
import { getLocalizedUrl } from '@/utils/i18n';
import { toast } from 'react-toastify';

const ChatWrapper = () => {
  let { id } = useParams();
  const router = useRouter();
  const [ticketId, setTicketId] = useState(id ? id[0] : null);
  const socket = useRef();

  // States
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ticketPage, setTicketPage] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  const [rowsPerPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPageMessages, setHasNextPageMessages] = useState(false);
  const [hasPrevPageMessages, setHasPrevPageMessages] = useState(false);

  // Refs
  const chatBoxRef = useRef(null);
  const messageInputRef = useRef(null);
  const { lang: locale } = useParams();

  // Hooks
  const { settings } = useSettings();
  const dispatch = useDispatch();
  const chatStore = useSelector(state => state.chatReducer);
  const isBelowLgScreen = useMediaQuery(theme => theme.breakpoints.down('lg'));
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'));
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'));

  const fetchChatData = async (currentPage = 1, searchTerm = '') => {
    console.log('fetchChatData api call', ticketId, currentPage, rowsPerPage, searchTerm);
    try {
      dispatch(callCommonAction({ loading: true }));
      const response = await getChatMessageForTicket(ticketId, currentPage, rowsPerPage, searchTerm, {});

      console.log('response contact fetchChatData', response);
      dispatch(callCommonAction({ loading: false }));
      if (response.statusCode === 200 && response.data) {
        setHasNextPage(response?.data?.hasNextPage);
        setHasPrevPage(response?.data?.hasPrevPage);
        setHasNextPageMessages(response?.data?.hasNextPageMessages);
        setHasPrevPageMessages(response?.data?.hasPrevPageMessages);
        const formatted = {
          contacts: response?.data?.docs,
          chats: response?.data?.chats,
          profileUser: response?.data?.profileUser,
        };

        dispatch(setChatData(formatted));
        activeUser(ticketId);
        if (chatStore.activeUser?.id !== null && messageInputRef.current) {
          messageInputRef.current.focus();
        }
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to fetch team members');
      dispatch(callCommonAction({ loading: false }));
      console.error('Failed to fetch team members', error);
    }
  };

  const handleLoadMoreTickets = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const nextPage = ticketPage + 1;
      const response = await loadMoreTickets(null, nextPage, rowsPerPage, '', {});
      console.log('response load more tickets', response);
      if (response.statusCode === 200 && response.data) {
        const newData = response.data;
        // console.log('newData', newData);
        setHasNextPage(response?.data?.hasNextPage);
        setHasPrevPage(response?.data?.hasPrevPage);
        // Append new data to existing data
        dispatch(setChatData({
          ...chatStore,
          contacts: [...chatStore.contacts, ...newData.contacts],
          chats: [...chatStore.chats, ...newData.chats]
        }));

        setTicketPage(nextPage);
      }
    } catch (error) {
      console.error('Failed to load more tickets', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMoreMessages = async () => {
    if (isLoadingMessages || !ticketId) return;
    setIsLoadingMessages(true);
    try {
      const nextPage = messagePage + 1;
      const response = await loadMoreMessages(ticketId, nextPage, rowsPerPage, '', {});
      if (response.statusCode === 200 && response.data) {



        setHasNextPageMessages(response?.data?.hasNextPageMessages);
        setHasPrevPageMessages(response?.data?.hasPrevPageMessages);
        const newMessages = response.data.chats; // newMessages.chat is the array of old messages
        console.log('newData handleLoadMoreMessages', newMessages);
        const updatedChats = chatStore.chats.map(chat => {
          if (chat.id === ticketId) {
            return {
              ...chat,
              chat: [...newMessages, ...chat.chat] // Prepend older messages
            };
          }
          return chat;
        });

        dispatch(setChatData({ ...chatStore, chats: updatedChats }));

        setMessagePage(nextPage);
      }
    } catch (error) {
      console.error('Failed to load more messages', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchChatData();
  }, []);

  useEffect(() => {
    // Initialize socket connection
    socket.current = io(process.env.NEXT_PUBLIC_BACKEND_DOMAIN, {
      transports: ['websocket', 'polling']
    });

    // Clean up on unmount
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };

  }, []);

  // Get active user's data
  const activeUser = ticketId => {
    if (!socket.current) return;

    // router.push(getLocalizedUrl(`/admin/support-tickets/view/${ticketId}`, locale));
    // const updatedUrl = getLocalizedUrl(`/admin/support-tickets/view/${ticketId}`, locale);

    // Replace the URL without full reload
    // router.replace(updatedUrl, undefined, { shallow: true })

    socket.current.emit("join", { ticketId });
    setTicketId(ticketId);
    dispatch(getActiveUserData(ticketId));

    //
  };

  // Focus on message input when active user changes
  useEffect(() => {
    if (chatStore.activeUser?.id !== null && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [chatStore.activeUser]);

  // Close backdrop when sidebar is open on below md screen
  useEffect(() => {
    if (!isBelowMdScreen && backdropOpen && sidebarOpen) {
      setBackdropOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelowMdScreen]);

  // Open backdrop when sidebar is open on below sm screen
  useEffect(() => {
    if (!isBelowSmScreen && sidebarOpen) {
      setBackdropOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelowSmScreen]);

  // Close sidebar when backdrop is closed on below md screen
  useEffect(() => {
    if (!backdropOpen && sidebarOpen) {
      setSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backdropOpen]);

  return (
    <div className={classNames(commonLayoutClasses.contentHeightFixed, 'flex is-full rounded relative', {
      border: settings.skin === 'bordered',
      'shadow-md': settings.skin !== 'bordered'
    })}>
      <SidebarLeft
        chatStore={chatStore}
        getActiveUserData={activeUser}
        dispatch={dispatch}
        backdropOpen={backdropOpen}
        setBackdropOpen={setBackdropOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isBelowLgScreen={isBelowLgScreen}
        isBelowMdScreen={isBelowMdScreen}
        isBelowSmScreen={isBelowSmScreen}
        messageInputRef={messageInputRef}
        handleLoadMoreTickets={handleLoadMoreTickets}
        isLoading={isLoading}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
      />

      <ChatContent
        chatStore={chatStore}
        dispatch={dispatch}
        backdropOpen={backdropOpen}
        setBackdropOpen={setBackdropOpen}
        setSidebarOpen={setSidebarOpen}
        isBelowMdScreen={isBelowMdScreen}
        isBelowLgScreen={isBelowLgScreen}
        isBelowSmScreen={isBelowSmScreen}
        messageInputRef={messageInputRef}
        ticketId={ticketId}
        socket={socket}
        handleLoadMoreMessages={handleLoadMoreMessages}
        isLoadingMessages={isLoadingMessages}
        hasNextPageMessages={hasNextPageMessages}
        hasPrevPageMessages={hasPrevPageMessages}
      />

      <Backdrop open={backdropOpen} onClick={() => setBackdropOpen(false)} className='absolute z-10' />
    </div>
  );
};

export default ChatWrapper;
