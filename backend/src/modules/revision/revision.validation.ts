import { z } from "zod";

export const createRevisionSchema = z.object({
  body: z.object({
    submissionId: z.string().uuid(),

    remarks: z.string().optional(),
  }),
});

export type CreateRevisionInput =
  z.infer<typeof createRevisionSchema>["body"];