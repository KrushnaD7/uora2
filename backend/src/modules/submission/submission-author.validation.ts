import { z } from "zod";

export const attachAuthorSchema = z.object({
  body: z.object({
    authorId: z.string().uuid(),
    authorOrder: z.number().int().min(1),
    isCorresponding: z.boolean().default(false),
  }),
});

export type AttachAuthorInput = z.infer<typeof attachAuthorSchema>["body"];
