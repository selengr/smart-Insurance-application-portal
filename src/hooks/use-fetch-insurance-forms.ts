import { useQuery } from '@tanstack/react-query';
import { generateZodSchema } from './use-create-field-schema';
import { insuranceFormsApi } from '@/services/api/insurance-forms';

export const useFetchInsuranceForms = (formId: string) => {
  const queryResult = useQuery({
    queryKey: ["form", formId],
    queryFn: () => insuranceFormsApi(formId),
    staleTime: 1000 * 60 * 5,
    enabled: !!formId,
  });

  const schema = queryResult.data ? generateZodSchema(queryResult.data.fields) : null;

  return {
    ...queryResult,
    data: {
      form: queryResult.data || null,
      schema,
    },
  };
};
