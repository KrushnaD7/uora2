import { Router } from "express";

import {
  login,
  register,
  apply,
  getMe,
  updateProfile,
  changePassword,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  bootstrapAdmin,
} from "./auth.controller";
import { upload } from "../../middlewares/upload.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
  refreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validation";
import { loginLimiter, resetLimiter, createLimiter } from "../../middlewares/rate.limit";

const router = Router();

router.post("/login", loginLimiter(), validate(loginSchema), login);

router.post("/register", validate(registerSchema), register);

router.post("/refresh", validate(refreshSchema), refresh);

router.post("/forgot-password", resetLimiter(), validate(forgotPasswordSchema), forgotPassword);

router.post("/reset-password", resetLimiter(), validate(resetPasswordSchema), resetPassword);

router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);

router.post("/logout", validate(logoutSchema), logout);

// Very tight limit — this is an emergency-recovery endpoint gated by a
// long random secret, but still deserves brute-force protection.
const bootstrapLimiter = createLimiter(
  60 * 60 * 1000,
  5,
  "Too many requests, please try again later."
);
router.post("/bootstrap-admin", bootstrapLimiter, bootstrapAdmin);

router.post("/apply", upload.single("cv"), apply);

router.get("/me", authenticate, getMe);

router.patch("/profile", authenticate, validate(updateProfileSchema), updateProfile);

router.post("/change-password", authenticate, validate(changePasswordSchema), changePassword);

export default router;
