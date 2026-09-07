import { z } from "zod";

export const createSubmissionSchema = z.object({
  body: z.object({
    journalId: z.string().uuid(),

    title: z.string().min(10),

    abstract: z.string().min(50),

    correspondingEmail: z.string().email(),

    correspondingPhone: z.string().optional(),
  }),
});

export type CreateSubmissionInput =
  z.infer<typeof createSubmissionSchema>["body"];