// MUI Imports
import Grid from '@mui/material/Grid2';

// Component Imports
import CreateDisputeForm from '@/views/trade-professional/disputes/create';
import { getOrders } from '@/app/server/actions';

const CreateDispute = async () => {
    const orders = await getOrders();

    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <CreateDisputeForm orders={orders} />
            </Grid>
        </Grid>
    );
};

export default CreateDispute; 
