import { z } from "zod";

export const createJournalSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    shortName: z.string().min(2),
    slug: z.string().min(2),
    subdomain: z.string().min(2),
    issn: z.string().optional(),
    eissn: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
});

export const updateJournalSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    shortName: z.string().min(2).optional(),
    issn: z.string().optional(),
    eissn: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
});

// Journal "settings" holds the descriptive/public-facing content for a
// journal's public page: About, Aims & Scope, Publication Ethics,
// Author Guidelines, contact details and social links. All fields are
// optional and nullable (an empty string clears the field back to the
// page's built-in fallback copy).
export const updateJournalSettingsSchema = z.object({
  body: z.object({
    about: z.string().max(20000).optional().nullable(),
    aimsScope: z.string().max(20000).optional().nullable(),
    ethics: z.string().max(20000).optional().nullable(),
    guidelines: z.string().max(20000).optional().nullable(),
    contactEmail: z
      .union([z.string().email(), z.literal("")])
      .optional()
      .nullable(),
    contactPhone: z.string().max(50).optional().nullable(),
    address: z.string().max(1000).optional().nullable(),
    facebook: z.string().max(500).optional().nullable(),
    twitter: z.string().max(500).optional().nullable(),
    linkedin: z.string().max(500).optional().nullable(),
  }),
});

export type CreateJournalInput = z.infer<typeof createJournalSchema>["body"];
export type UpdateJournalInput = z.infer<typeof updateJournalSchema>["body"];
export type UpdateJournalSettingsInput = z.infer<
  typeof updateJournalSettingsSchema
>["body"];
