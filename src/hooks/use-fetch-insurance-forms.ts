import { useQuery } from '@tanstack/react-query';
import { useGenerateZodSchema } from './use-create-field-schema';
import { insuranceFormsApi } from '@/services/api/insurance-forms';


export const useFetchInsuranceForms = (formId: string) => {
    return useQuery({
      queryKey: ["form", formId],
      queryFn: () => insuranceFormsApi(formId),
      select: (form) => {
        if (!form) return { form: null, schema: null };
        const schema = useGenerateZodSchema(form.fields);
        return { form, schema };
      },
      staleTime: 1000 * 60 * 5,
      enabled: !!formId,
    });
  };

