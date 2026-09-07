import { z } from "zod";

export const createReviewerSchema = z.object({
  body: z.object({
    fullName: z.string().min(3),

    email: z.string().email(),

    mobile: z.string().optional(),

    country: z.string().optional(),

    institution: z.string().optional(),

    designation: z.string().optional(),

    expertise: z.string().optional(),
  }),
});

export const updateReviewerSchema = z.object({
  body: z.object({
    fullName: z.string().min(3).optional(),

    email: z.string().email().optional(),

    mobile: z.string().optional(),

    country: z.string().optional(),

    institution: z.string().optional(),

    designation: z.string().optional(),

    expertise: z.string().optional(),
  }),
});

export type CreateReviewerInput =
  z.infer<typeof createReviewerSchema>["body"];

export type UpdateReviewerInput =
  z.infer<typeof updateReviewerSchema>["body"];