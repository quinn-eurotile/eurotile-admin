// MUI Imports
import Grid from '@mui/material/Grid2';

// Component Imports
import ChangePassword from './ChangePassword';
import AddBankAccount from './AddBankAccount';
import AdminSettings from './AdminSettings';
import TwoStepVerification from './TwoStepVerification';
import RecentDevice from './RecentDevice';

const SecurityTab = async ({ userId }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AdminSettings userId={userId} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AddBankAccount userId={userId} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ChangePassword userId={userId} />
      </Grid>
    </Grid>
  );
};

export default SecurityTab;
