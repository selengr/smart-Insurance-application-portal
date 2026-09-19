import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { generateZodSchema, type ValidationMessages } from "./use-create-field-schema"
import { insuranceFormsApi } from "@/services/api/insurance-forms"

export const useFetchInsuranceForms = (
  formId: string,
  messages?: ValidationMessages,
) => {
  const queryResult = useQuery({
    queryKey: ["form", formId],
    queryFn: () => insuranceFormsApi(formId),
    staleTime: 1000 * 60 * 5,
    enabled: !!formId,
  })

  const messageKey = messages
    ? [messages.required, messages.invalidNumber, messages.tooSmall, messages.tooBig].join("|")
    : ""

  const schema = useMemo(
    () =>
      queryResult.data
        ? generateZodSchema(queryResult.data.fields, messages)
        : null,
    // messages object identity changes; messageKey captures content
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryResult.data, messageKey],
  )

  return {
    ...queryResult,
    data: {
      form: queryResult.data || null,
      schema,
    },
  }
}
