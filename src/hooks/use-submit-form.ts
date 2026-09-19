import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { submitFormApi } from '@/services/api/insurance-forms';

interface IFormValues {
  [key: string]: unknown;
}

export const useSubmitForm = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['form-submit'],
    mutationFn: ({ data }: { data: IFormValues }) => submitFormApi(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['purchased-insurances'] });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Unable to submit the form right now.';
      toast.error('Submission failed', {
        description: message,
      });
    },
  });

  return mutation;
};
