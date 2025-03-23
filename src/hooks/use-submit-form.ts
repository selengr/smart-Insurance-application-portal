import { useMutation } from '@tanstack/react-query';
import { submitFormApi } from '@/services/api/insurance-forms';

interface IFormValues {
  [key: string]: unknown;
}

export const useSubmitForm = () => {
  const mutation = useMutation({
    mutationKey: ['form-submit'],
    mutationFn: ({ data }: { data: IFormValues }) => submitFormApi(data),
    onError: () => {},
  });

  return mutation;
};
