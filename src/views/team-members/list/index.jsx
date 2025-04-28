// MUI Imports
import Grid from '@mui/material/Grid2'
import TeamListCards from './TeamListCards';
import TeamListTable from './TeamListTable';

// Component Imports



const UserList = ({ userData }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <TeamListCards />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TeamListTable tableData={userData} />
      </Grid>
    </Grid>
  )
}

export default UserList
