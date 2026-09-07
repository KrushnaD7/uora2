import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    // Login must not enforce a strength minimum, otherwise accounts created
    // under an older (shorter) password policy can no longer sign in.
    password: z.string().min(1).max(128),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    mobile: z.string().max(40).optional().nullable(),
    country: z.string().max(80).optional().nullable(),
    institution: z.string().max(160).optional().nullable(),
    designation: z.string().max(120).optional().nullable(),
    orcid: z.string().max(64).optional().nullable(),
    expertise: z.string().max(1000).optional().nullable(),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8).max(128),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    mobile: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    institution: z.string().optional().nullable(),
    designation: z.string().optional().nullable(),
    orcid: z.string().optional().nullable(),
    expertise: z.string().optional().nullable(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8).max(128),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];