"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"

import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"

import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers"

import { IGetCondition } from "@/types/conditionReportSolo";
import { ConditionCard } from "./ConditionCard";
import CreateCondition from "./CreateCondition";
import { idGenerator } from "@/lib/idGenerator";
import { useMemo, useState } from "react";

interface IConditionListProps {
  conditions: IGetCondition[];
}

const ConditionList: React.FC<IConditionListProps> = ({ conditions : initialConditions }) => {
  const [conditions, setConditions] = useState<IGetCondition[]>(
    Array.isArray(initialConditions) ? initialConditions : [],
  )

  // const { mutate: updatePosition, isPending: isUpdatingPosition } = useUpdateConditionPosition()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const conditionsIds = useMemo(() => {
    return conditions.map((condition) => condition.id)
  }, [conditions])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setConditions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // const handleDragEnd = async (event: DragEndEvent) => {
  //   const { active, over } = event

  //   if (active.id !== over?.id) {
  //     const oldIndex = conditions.findIndex((item) => item.id === active.id)
  //     const newIndex = conditions.findIndex((item) => item.id === over?.id)

  //     // Get the condition that was moved
  //     const movedCondition = conditions[oldIndex]

  //     // Update UI immediately for better UX
  //     const newConditions = arrayMove(conditions, oldIndex, newIndex)
  //     setConditions(newConditions)

  //     // Call API with old and new positions
  //     updatePosition(
  //       {
  //         conditionId: movedCondition.id,
  //         oldPosition: oldIndex,
  //         newPosition: newIndex,
  //       },
  //       {
  //         onError: () => {
  //           // Revert the UI change if API call fails
  //           setConditions(conditions) // Revert to original order
  //           alert("Failed to update position. Please try again.")
  //         },
  //       },
  //     )
  //   }
  // }



  return (
    <div className="w-full max-w-md flex flex-col pt-4">
      <CreateCondition />
      {Array.isArray(conditions) && conditions.length > 0 && (
        <div
          dir="rtl"
          className="bg-[#F7F7FF] rounded-lg p-[10px] w-full flex flex-col gap-3 pb-10 mb-10"
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
          >
           <SortableContext
            items={conditionsIds}
            strategy={verticalListSortingStrategy}
          >
            {conditions?.map((condition: IGetCondition, index: number) => (
            // eslint-disable-next-line react/jsx-key
            <div key={idGenerator()}> 
                 <ConditionCard condition={condition} index={index} />
            </div>
          ))}
          </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};

export default ConditionList;
