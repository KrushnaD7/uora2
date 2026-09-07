import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    submissionReviewerId: z.string().uuid(),

    recommendation: z.enum([
      "ACCEPT",
      "MINOR_REVISION",
      "MAJOR_REVISION",
      "REJECT",
    ]),

    overallRating: z.number().min(1).max(5).optional(),

    commentsToAuthor: z.string().optional(),

    commentsToEditor: z.string().optional(),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    recommendation: z.enum([
      "ACCEPT",
      "MINOR_REVISION",
      "MAJOR_REVISION",
      "REJECT",
    ]).optional(),

    overallRating: z.number().min(1).max(5).optional(),

    commentsToAuthor: z.string().optional(),

    commentsToEditor: z.string().optional(),
  }),
});

export type CreateReviewInput =
  z.infer<typeof createReviewSchema>["body"];

export type UpdateReviewInput =
  z.infer<typeof updateReviewSchema>["body"];