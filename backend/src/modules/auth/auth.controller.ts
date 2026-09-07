import { Request, Response } from "express";
import { AuthService } from "./auth.service";

const authService = new AuthService();

/** Extract a safe client IP without trusting it blindly. */
function clientIp(req: Request): string | undefined {
  const xff = req.headers["x-forwarded-for"];
  const val = typeof xff === "string" ? xff.split(",")[0] : undefined;
  const ip = val?.trim() || req.socket?.remoteAddress || req.ip;
  if (!ip || ip === "::1") return undefined;
  return ip.slice(0, 64);
}

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = await authService.getMe(req.user.id);
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error: any) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password, clientIp(req));
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    // Known, user-safe credential/lockout messages; anything else is generic.
    const known = [
      "Invalid email or password",
      "Account is inactive or blocked",
      "Too many failed login attempts. Please try again later.",
    ];
    const message = known.includes(error?.message)
      ? error.message
      : "Invalid email or password";
    return res.status(401).json({ success: false, message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken || typeof refreshToken !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "refreshToken is required" });
    }
    const result = await authService.refreshToken(refreshToken, clientIp(req));
    return res
      .status(200)
      .json({ success: true, message: "Token refreshed", data: result });
  } catch (error: any) {
    const message =
      error.message === "Account is inactive or blocked"
        ? error.message
        : "Invalid or expired refresh token";
    return res.status(401).json({ success: false, message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body?.refreshToken;
    // If authenticated via access token, use its user id; otherwise require token.
    const result = await authService.logout(
      req.user?.id || "",
      typeof refreshToken === "string" ? refreshToken : "",
      clientIp(req)
    );
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully", data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, mobile, country, institution, designation, orcid, expertise } = req.body;
    const result = await authService.register(
      name,
      email,
      password,
      { mobile, country, institution, designation, orcid, expertise },
      clientIp(req)
    );
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: result,
    });
  } catch (error: any) {
    const message =
      error.message === "Email already in use" ? error.message : "Registration failed";
    return res.status(400).json({ success: false, message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email, clientIp(req));
    return res.status(200).json({ success: true, message: result.message, data: { delivered: result.delivered } });
  } catch (error: any) {
    // Never reveal whether an email exists.
    return res.status(200).json({
      success: true,
      message:
        "If an account exists for that email, a password reset link has been sent.",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || typeof token !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "token is required" });
    }
    const result = await authService.resetPassword(token, newPassword, clientIp(req));
    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully", data: result });
  } catch (error: any) {
    const message =
      error.message === "Invalid or expired reset token"
        ? error.message
        : "Password reset failed";
    return res.status(400).json({ success: false, message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "token is required" });
    }
    const result = await authService.verifyEmail(token, clientIp(req));
    return res
      .status(200)
      .json({ success: true, message: "Email verified", data: result });
  } catch (error: any) {
    const message =
      error.message === "Invalid or expired verification token"
        ? error.message
        : "Email verification failed";
    return res.status(400).json({ success: false, message });
  }
};

export const bootstrapAdmin = async (req: Request, res: Response) => {
  try {
    const secret = req.headers["x-bootstrap-secret"];
    const result = await authService.bootstrapAdmin(
      typeof secret === "string" ? secret : "",
      clientIp(req)
    );
    return res.status(200).json({
      success: true,
      message: "Admin account is ready",
      data: result,
    });
  } catch (error: any) {
    // Always 404, whether the feature is disabled or the secret is wrong —
    // never reveal which, and never leak the underlying error message.
    return res.status(404).json({ success: false, message: "Not found" });
  }
};

export const apply = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const cvFile = req.file?.filename;
    const result = await authService.applyForReviewer({ ...data, cvFile });
    return res
      .status(201)
      .json({ success: true, message: "Application submitted successfully", data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = await authService.updateProfile(req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(
      req.user.id,
      currentPassword,
      newPassword,
      clientIp(req)
    );
    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully", data: result });
  } catch (error: any) {
    const message =
      error.message === "Invalid current password" ? error.message : "Password change failed";
    return res.status(400).json({ success: false, message });
  }
};
