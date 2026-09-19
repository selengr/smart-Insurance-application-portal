import { useMutation, useQueryClient } from "@tanstack/react-query"
import { submitFormApi } from "@/services/api/insurance-forms"

interface IFormValues {
  [key: string]: unknown
}

export const useSubmitForm = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ["form-submit"],
    mutationFn: ({ data }: { data: IFormValues }) => submitFormApi(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["purchased-insurances"] })
    },
  })

  return mutation
}
