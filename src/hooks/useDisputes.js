import { useQuery } from '@tanstack/react-query';
import { getDisputes } from '@/services/disputeService';

export const useDisputes = ({ page, limit }) => {
    return useQuery({
        queryKey: ['disputes', page, limit],
        queryFn: () => getDisputes({ page, limit }),
        keepPreviousData: true
    });
}; 
