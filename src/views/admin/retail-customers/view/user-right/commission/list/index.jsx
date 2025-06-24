'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import CommissionCard from './CommissionCard'
import CommissionListTable from './CommissionListTable'


const CommissionList = ({ userId }) => {

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CommissionListTable userId={userId} />
      </Grid>
    </Grid>
  )
}

export default CommissionList
