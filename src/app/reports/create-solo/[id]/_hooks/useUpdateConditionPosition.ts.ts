import { useMutation } from "@tanstack/react-query"

interface UpdatePositionParams {
  conditionId: number
  oldPosition: number
  newPosition: number
}

const updateConditionPosition = async ({ conditionId, oldPosition, newPosition }: UpdatePositionParams) => {
  const response = await fetch("/api/conditions/update-position", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      conditionId,
      oldPosition,
      newPosition,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to update condition position")
  }

  return response.json()
}

export const useUpdateConditionPosition = () => {
  return useMutation({
    mutationFn: updateConditionPosition,
    onSuccess: (data, variables) => {
      console.log(`Position updated successfully for condition ${variables.conditionId}`)
    },
    onError: (error, variables) => {
      console.error(`Failed to update position for condition ${variables.conditionId}:`, error)
    },
  })
}
