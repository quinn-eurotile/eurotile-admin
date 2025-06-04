'use client';

// MUI Imports
import Grid from '@mui/material/Grid2';

// Component Imports
import ChangePassword from './ChangePassword';
import AddBankAccount from './AddBankAccount';
import AdminSettings from './AdminSettings';
import TwoStepVerification from './TwoStepVerification';
import RecentDevice from './RecentDevice';
import usePermission from '@/components/common/usePermission';

const SecurityTab = async ({ userId }) => {
  const canAddSupportTicket = usePermission("create-support-ticket");
  const canUpdateSupportTicket = usePermission("update-support-ticket");
  const canDeleteSupportTicket = usePermission("delete-support-ticket");
  const canViewSupportTicket = usePermission("view-support-ticket");
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
