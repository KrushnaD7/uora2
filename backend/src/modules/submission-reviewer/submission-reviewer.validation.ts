import { z } from "zod";

export const assignReviewerSchema = z.object({
  body: z.object({
    reviewerId: z.string().uuid(),

    deadline: z.coerce.date().optional(),

    remarks: z.string().optional(),
  }),
});

export type AssignReviewerInput =
  z.infer<typeof assignReviewerSchema>["body"];