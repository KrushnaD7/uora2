import { z } from "zod";

export const editorialDecisionSchema = z.object({
  body: z.object({
    status: z.enum([
      "INITIAL_SCREENING",
      "UNDER_REVIEW",
      "REVISION_REQUIRED",
      "REVISED_SUBMITTED",
      "ACCEPTED",
      "REJECTED",
      "PUBLISHED",
    ]),

    remarks: z.string().optional(),
  }),
});

export type EditorialDecisionInput =
  z.infer<typeof editorialDecisionSchema>["body"];