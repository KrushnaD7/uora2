import { z } from "zod";

export const createIssueSchema = z.object({
  body: z.object({
    journalId: z.string().uuid(),

    volumeId: z.string().uuid(),

    issueNumber: z.number().min(1),

    title: z.string().optional(),
  }),
});

export const updateIssueSchema = z.object({
  body: z.object({
    issueNumber: z.number().min(1).optional(),

    title: z.string().optional(),

    status: z.enum(["UPCOMING", "PUBLISHED"]).optional(),

    publishedAt: z.coerce.date().optional(),
  }),
});

export const publishIssueSchema = z.object({
  body: z.object({
    publishedAt: z.coerce.date().optional(),
  }),
});

export type CreateIssueInput =
  z.infer<typeof createIssueSchema>["body"];

export type UpdateIssueInput =
  z.infer<typeof updateIssueSchema>["body"];