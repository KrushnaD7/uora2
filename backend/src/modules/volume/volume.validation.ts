import { z } from "zod";

export const createVolumeSchema = z.object({
  body: z.object({
    journalId: z.string().uuid(),

    volumeNumber: z.number().min(1),

    year: z.number().min(2000),
  }),
});

export const updateVolumeSchema = z.object({
  body: z.object({
    volumeNumber: z.number().min(1).optional(),

    year: z.number().min(2000).optional(),
  }),
});

export type CreateVolumeInput =
  z.infer<typeof createVolumeSchema>["body"];

export type UpdateVolumeInput =
  z.infer<typeof updateVolumeSchema>["body"];