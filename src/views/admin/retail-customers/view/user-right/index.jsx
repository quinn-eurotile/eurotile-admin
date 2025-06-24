'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid2'
import { useParams, useSearchParams, usePathname } from 'next/navigation'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import { useSession } from 'next-auth/react'
import { checkUserRoleIsAdmin } from '@/components/common/userRole'

const UserRight = ({ tabContentList, data }) => {
  const params = useParams()
  const pathname = usePathname()
  const userId = params?.id

  // Get the last segment of the path
  const lastSegment = pathname?.split('/')?.filter(Boolean).pop()

  // States
  const [activeTab, setActiveTab] = useState(lastSegment === 'security' ? 'security' : 'orders')

  const handleChange = (event, value) => {
    setActiveTab(value)
  }

  return (
    <>
      <TabContext value={activeTab}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              {!userId && (
                <Tab icon={<i className='ri-lock-line' />} value='security' label='Security' iconPosition='start' />
              )}
              <Tab icon={<i className='ri-lock-line' />} value='orders' label='Order History' iconPosition='start' />
            </CustomTabList>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </Grid>
        </Grid>
      </TabContext>
    </>
  )
}

export default UserRight
