// MUI Imports
import Grid from '@mui/material/Grid2';

// Component Imports
import UserDetails from './UserDetails';
const UserLeftOverview = ({ data }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <UserDetails data={data} />
      </Grid>
    </Grid>
  );
};

export default UserLeftOverview;
