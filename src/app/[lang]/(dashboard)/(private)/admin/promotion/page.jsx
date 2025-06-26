// MUI Imports
import Grid from '@mui/material/Grid2';
import PromotionList from '@/views/admin/promotion/list';

const PromotionListTable = async () => {
    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <PromotionList />
            </Grid>
        </Grid>
    );
};

export default PromotionListTable;
