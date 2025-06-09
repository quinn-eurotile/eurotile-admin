// MUI Imports
import Grid from '@mui/material/Grid2';

// Component Imports
import DisputeListTable from '@/views/trade-professional/disputes/list';

const DisputeList = () => {
    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <DisputeListTable />
            </Grid>
        </Grid>
    );
};

export default DisputeList; 
