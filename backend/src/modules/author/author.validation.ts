import { z } from "zod";

export const createAuthorSchema = z.object({
  body: z.object({
    fullName: z.string().min(3),

    email: z.string().email().optional(),

    mobile: z.string().optional(),

    country: z.string().optional(),

    institution: z.string().optional(),

    designation: z.string().optional(),

    orcid: z.string().optional(),
  }),
});

export const updateAuthorSchema = z.object({
  body: z.object({
    fullName: z.string().min(3).optional(),

    email: z.string().email().optional(),

    mobile: z.string().optional(),

    country: z.string().optional(),

    institution: z.string().optional(),

    designation: z.string().optional(),

    orcid: z.string().optional(),
  }),
});

export type CreateAuthorInput =
  z.infer<typeof createAuthorSchema>["body"];

export type UpdateAuthorInput =
  z.infer<typeof updateAuthorSchema>["body"];