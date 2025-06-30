import * as z from "zod"

const SubConditionSchema = z.object({
  logicalOperator: z.string().optional(),
  questionType: z.string().optional(),
  operatorType: z.string().optional(),
  conditionType: z.string().optional(),
  value: z.union([
    z.string().optional(),
    z.array(z.string().optional()),
  ]),
  id: z.number(),
})

const ConditionSchema = z.object({
  subConditions: z.array(SubConditionSchema),
  returnText: z.string().min(1, { message: "اين فيلد الزامي است" }),
  elseReturnText: z.string().optional().default(""),
  id: z.number().optional(),
})

export const ConditionFormSchema = z.object({
  conditions: z.array(ConditionSchema),
})

export type TConditionFormData = z.infer<typeof ConditionFormSchema>
export type TConditionData = z.infer<typeof ConditionSchema>;
export type TSubConditionData = z.infer<typeof SubConditionSchema>;

