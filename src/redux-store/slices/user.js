// Third-party Imports
import { createSlice } from '@reduxjs/toolkit'

// Data Imports
import { db } from '@/fake-db/apps/chat'

export const userSlice = createSlice({
  name: 'chat',
  initialState: db,
  reducers: {
    getActiveUserData: (state, action) => {
      const activeUser = state.contacts.find(user => user.id === action.payload)
      const chat = state.chats.find(chat => chat.userId === action.payload)

      if (chat && chat.unseenMsgs > 0) {
        chat.unseenMsgs = 0
      }

      if (activeUser) {
        state.activeUser = activeUser
      }
    },

  }
})
export const { getActiveUserData } = userSlice.actions
export default userSlice.reducer
