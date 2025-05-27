'use client';

// React Imports
import { useEffect, useRef, useState } from 'react';

// MUI Imports
import Backdrop from '@mui/material/Backdrop';
import useMediaQuery from '@mui/material/useMediaQuery';

// Third-party Imports
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

// Slice Imports
import { getActiveUserData, fetchChatData, setChatData } from '@/redux-store/slices/chat'; // Add fetchChatData

// Component Imports
import SidebarLeft from './SidebarLeft';
import ChatContent from './ChatContent';

// Hook Imports
import { useSettings } from '@core/hooks/useSettings';

// Util Imports
import { commonLayoutClasses } from '@layouts/utils/layoutClasses';
import { useParams } from 'next/navigation';
import { getChatMessageForTicket } from '@/app/server/support-ticket-chat';
import { callCommonAction } from '@/redux-store/slices/common';

const ChatWrapper = () => {
  const { id: ticketId } = useParams();
  // States
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  // Refs
  const messageInputRef = useRef(null);

  // Hooks
  const { settings } = useSettings();
  const dispatch = useDispatch();
  const chatStore = useSelector(state => state.chatReducer);
  const isBelowLgScreen = useMediaQuery(theme => theme.breakpoints.down('lg'));
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'));
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'));

  const fetchChatData = async (currentPage = 1, searchTerm = '') => {
    try {
      dispatch(callCommonAction({ loading: true }));
      const response = await getChatMessageForTicket(ticketId, currentPage, rowsPerPage, searchTerm, {});

      dispatch(callCommonAction({ loading: false }));
      if (response.statusCode === 200 && response.data) {
        const formatted = {
          contacts: response?.data?.contacts,
          chats: response?.data?.chats,
          profileUser: response?.data?.profileUser,
        };
        dispatch(setChatData(formatted));
      }
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
      console.error('Failed to fetch team members', error);
    }
  };

  useEffect(() => {
    fetchChatData();
  }, []);


  // Get active user’s data
  const activeUser = id => {
    dispatch(getActiveUserData(id));
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
    <div
      className={classNames(commonLayoutClasses.contentHeightFixed, 'flex is-full overflow-hidden rounded relative', {
        border: settings.skin === 'bordered',
        'shadow-md': settings.skin !== 'bordered'
      })}
    >
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
      />

      <Backdrop open={backdropOpen} onClick={() => setBackdropOpen(false)} className='absolute z-10' />
    </div>
  );
};

export default ChatWrapper;
