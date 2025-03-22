import { InsuranceForm } from '@/types/insurance';
import { useMutation } from '@tanstack/react-query';
import { submitFormApi } from '@/services/api/insurance-forms';



export const useSubmitForm = () => {
  const mutation = useMutation({
    mutationKey: ['form-submit'],
    mutationFn: ({ data }: { data: InsuranceForm }) => submitFormApi(data),
    onError: () => {},
  });

  return mutation;
};
