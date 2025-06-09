import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDispute } from '@/services/disputeService';

export const useCreateDispute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => createDispute(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['disputes']);
        }
    });
}; 
