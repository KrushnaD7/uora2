import bcrypt from "bcrypt";
import crypto from "crypto";
import { UserRepository } from "../user/user.repository";
import { generateToken } from "../../utils/jwt";
import { prisma } from "../../config/prisma";
import { getPermissionsForRole } from "../../shared/permissions";
import {
  generateOpaqueToken,
  hashToken,
  verifyTokenHash,
} from "../../utils/token";
import { env } from "../../config/env";
import { security } from "../../config/security";
import { logActivity } from "../../utils/logger";
import { getMailProvider, emailDeliveryEnabled } from "../../security/mailer";
import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { BadRequestError } from "../../errors/BadRequestError";
import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { TooManyRequestsError } from "../../errors/TooManyRequestsError";

const BCRYPT_ROUNDS = 12;

export class AuthService {
  private repository = new UserRepository();

  private async issueSession(user: { id: string; email: string; role: string }) {
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
    });
    const rawRefresh = generateOpaqueToken();
    const expires = new Date(
      Date.now() + env.REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    );

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawRefresh),
        expiresAt: expires,
      },
    });

    return { token, refreshToken: rawRefresh, expiresAt: expires };
  }

  async getMe(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const { password: _, ...safeUser } = user;

    let authorProfile = null;
    if (user.role === "AUTHOR") {
      authorProfile = await prisma.author.findUnique({
        where: { userId: user.id },
      });
    }

    let reviewerProfile = null;
    if (user.role === "REVIEWER") {
      reviewerProfile = await prisma.reviewer.findUnique({
        where: { email: user.email },
      });
    }

    return {
      ...safeUser,
      emailVerified: user.emailVerified,
      authorProfile,
      reviewerProfile,
      permissions: getPermissionsForRole(user.role),
    };
  }

  async login(email: string, password: string, ip?: string) {
    const user = await this.repository.findByEmail(email);

    // No enumeration: same message whether the email exists or not.
    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Account-level lockout: if the lock window is active, reject immediately.
    if (user.loginLockUntil && user.loginLockUntil > new Date()) {
      // Distinct log line so a lockout can never be mistaken for (or hidden
      // behind) a generic "invalid credentials" report when diagnosing a
      // login problem — see the LOGIN_LOCKED / LOGIN_BAD_PASSWORD markers.
      console.warn(
        `[auth] LOGIN_LOCKED user=${user.id} email=${user.email} lockedUntil=${user.loginLockUntil.toISOString()} ip=${ip || "unknown"}`
      );
      throw new TooManyRequestsError(
        "Too many failed login attempts. Please try again later."
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      // Increment the failed-attempt counter; lock the account once the
      // threshold is reached.
      const attempts = user.loginAttempts + 1;
      const shouldLock = attempts >= security.loginMaxFailedAttempts;
      await prisma.users.update({
        where: { id: user.id },
        data: {
          loginAttempts: shouldLock ? 0 : attempts,
          loginLockUntil: shouldLock
            ? new Date(Date.now() + security.loginLockoutMinutes * 60 * 1000)
            : user.loginLockUntil,
        },
      });
      console.warn(
        `[auth] LOGIN_BAD_PASSWORD user=${user.id} email=${user.email} attempts=${attempts}/${security.loginMaxFailedAttempts} locked=${shouldLock} ip=${ip || "unknown"}`
      );
      throw new UnauthorizedError("Invalid email or password");
    }

    // Success: clear any lockout/attempt state.
    await prisma.users.update({
      where: { id: user.id },
      data: { loginAttempts: 0, loginLockUntil: null },
    });

    const { token, refreshToken, expiresAt } = await this.issueSession(user);

    await logActivity(
      user.id,
      "LOGIN",
      "auth",
      "User logged in",
      ip,
      "user",
      user.id
    );

    const { password: _, ...safeUser } = user;
    return {
      token,
      refreshToken,
      expiresIn: env.JWT_EXPIRES_IN,
      tokenExpiresAt: expiresAt,
      user: {
        ...safeUser,
        emailVerified: user.emailVerified,
        permissions: getPermissionsForRole(user.role),
      },
    };
  }

  async register(
    name: string,
    email: string,
    password: string,
    authorData?: {
      mobile?: string;
      country?: string;
      institution?: string;
      designation?: string;
      orcid?: string;
      expertise?: string;
    },
    ip?: string
  ) {
    const requestedRole = "AUTHOR";

    const existingUser = await this.repository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: requestedRole,
        },
      });

      await tx.author.create({
        data: {
          userId: created.id,
          fullName: name,
          email,
          mobile: authorData?.mobile || null,
          country: authorData?.country || null,
          institution: authorData?.institution || null,
          designation: authorData?.designation || null,
          orcid: authorData?.orcid || null,
        },
      });

      return created;
    });

    const { token, refreshToken, expiresAt } = await this.issueSession(user);
    await logActivity(
      user.id,
      "CREATE",
      "auth",
      "New author registered",
      ip,
      "user",
      user.id
    );

    const { password: _, ...safeUser } = user;
    return {
      token,
      refreshToken,
      expiresIn: env.JWT_EXPIRES_IN,
      tokenExpiresAt: expiresAt,
      user: {
        ...safeUser,
        emailVerified: user.emailVerified,
        permissions: getPermissionsForRole(user.role),
      },
    };
  }

  async refreshToken(rawToken: string, ip?: string) {
    const hash = hashToken(rawToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: hash },
      include: { user: true },
    });

    const invalid = !stored || stored.revokedAt !== null || stored.expiresAt < new Date();

    if (!stored || invalid) {
      if (stored) {
        // Reuse of an invalid/revoked token: revoke the whole family defensively.
        await prisma.refreshToken.updateMany({
          where: { userId: stored.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = stored.user;
    if (user.status !== "ACTIVE") {
      throw new ForbiddenError("Account is inactive or blocked");
    }

    // Rotate: revoke this token and issue a fresh pair.
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const { token, refreshToken, expiresAt } = await this.issueSession(user);
    await logActivity(user.id, "LOGIN", "auth", "Token refreshed", ip, "user", user.id);

    return { token, refreshToken, tokenExpiresAt: expiresAt };
  }

  async logout(userId: string, rawToken: string, ip?: string) {
    // Resolve the session owner from the refresh token so revocation works even
    // when the caller's access token has already expired.
    let resolvedUserId = userId;
    if (rawToken) {
      const stored = await prisma.refreshToken.findUnique({
        where: { tokenHash: hashToken(rawToken) },
      });
      if (stored) {
        resolvedUserId = stored.userId;
        // Revoke the presented token (and the whole family for good measure).
        await prisma.refreshToken.updateMany({
          where: { userId: stored.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
    }

    if (resolvedUserId) {
      await logActivity(
        resolvedUserId,
        "LOGOUT",
        "auth",
        "User logged out",
        ip,
        "user",
        resolvedUserId
      );
    }
    return { success: true };
  }

  async forgotPassword(email: string, ip?: string) {
    const user = await this.repository.findByEmail(email);

    // Always return the same generic message to prevent account enumeration.
    if (user && user.status === "ACTIVE") {
      const rawToken = generateOpaqueToken();
      const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000);
      await prisma.users.update({
        where: { id: user.id },
        data: {
          passwordResetTokenHash: hashToken(rawToken),
          passwordResetExpiresAt: expiresAt,
        },
      });

      const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${rawToken}`;
      await getMailProvider().send({
        to: email,
        subject: "Reset your UORA password",
        html: `Click this link to reset your password (valid ${env.PASSWORD_RESET_EXPIRES_MINUTES} minutes): <a href="${resetUrl}">${resetUrl}</a>`,
      });

      await logActivity(user.id, "UPDATE", "auth", "Password reset requested", ip, "user", user.id);
    }

    return {
      success: true,
      message:
        "If an account exists for that email, a password reset link has been sent.",
      // Indicate delivery status only when a provider is really configured.
      delivered: emailDeliveryEnabled(),
    };
  }

  async resetPassword(rawToken: string, newPassword: string, ip?: string) {
    // Find a user by hashed token (compare in constant time against each).
    const hash = hashToken(rawToken);
    const user = await prisma.users.findFirst({
      where: { passwordResetTokenHash: hash },
    });

    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await prisma.$transaction([
      prisma.users.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
          passwordResetTokenHash: null,
          passwordResetExpiresAt: null,
        },
      }),
      // Invalidate all existing sessions after a reset.
      prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await logActivity(user.id, "UPDATE", "auth", "Password reset completed", ip, "user", user.id);
    return { success: true };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string, ip?: string) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      throw new BadRequestError("Invalid current password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await prisma.$transaction([
      prisma.users.update({
        where: { id: userId },
        data: { password: hashedPassword, passwordChangedAt: new Date() },
      }),
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await logActivity(userId, "UPDATE", "auth", "Password changed", ip, "user", userId);
    return { success: true };
  }

  async verifyEmail(rawToken: string, ip?: string) {
    const hash = hashToken(rawToken);
    const user = await prisma.users.findFirst({
      where: { emailVerifyTokenHash: hash },
    });

    if (!user || !user.emailVerifyExpiresAt || user.emailVerifyExpiresAt < new Date()) {
      throw new BadRequestError("Invalid or expired verification token");
    }

    await prisma.users.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyTokenHash: null,
        emailVerifyExpiresAt: null,
      },
    });

    await logActivity(user.id, "UPDATE", "auth", "Email verified", ip, "user", user.id);
    return { success: true };
  }

  /**
   * Emergency admin recovery — independent of the DB-seeded bootstrap.
   *
   * Gated entirely by ADMIN_BOOTSTRAP_SECRET (env). If that variable is
   * unset, this always throws NotFoundError so the route is indistinguishable
   * from a route that doesn't exist. On a correct secret, creates the
   * ADMIN_EMAIL account if it doesn't exist, or resets its password/role/
   * status/lockout state if it does — this doubles as a way to clear a stuck
   * lockout on the admin account without direct DB access.
   */
  async bootstrapAdmin(providedSecret: string, ip?: string) {
    const expected = env.ADMIN_BOOTSTRAP_SECRET;

    if (!expected || !env.ADMIN_PASSWORD) {
      // Feature disabled — never reveal whether it *would* be enabled with a
      // different secret.
      throw new NotFoundError("Not found");
    }

    const providedBuf = Buffer.from(providedSecret || "", "utf8");
    const expectedBuf = Buffer.from(expected, "utf8");
    const matches =
      providedBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(providedBuf, expectedBuf);

    if (!matches) {
      throw new NotFoundError("Not found");
    }

    const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, BCRYPT_ROUNDS);
    const existing = await this.repository.findByEmail(env.ADMIN_EMAIL);

    const admin = existing
      ? await prisma.users.update({
          where: { id: existing.id },
          data: {
            password: hashedPassword,
            role: "ADMIN",
            status: "ACTIVE",
            loginAttempts: 0,
            loginLockUntil: null,
            passwordChangedAt: new Date(),
          },
        })
      : await prisma.users.create({
          data: {
            name: env.ADMIN_NAME,
            email: env.ADMIN_EMAIL,
            password: hashedPassword,
            role: "ADMIN",
            status: "ACTIVE",
            emailVerified: true,
          },
        });

    await logActivity(
      admin.id,
      existing ? "UPDATE" : "CREATE",
      "auth",
      existing ? "Admin recovered via bootstrap secret" : "Admin created via bootstrap secret",
      ip,
      "user",
      admin.id
    );

    // Never return the password hash, even here.
    const { password: _pw, ...safeAdmin } = admin;
    return { success: true, user: safeAdmin };
  }

  async applyForReviewer(data: {
    journalId: string;
    fullName: string;
    email: string;
    mobile?: string;
    institution?: string;
    designation?: string;
    expertise?: string;
    cvFile?: string;
  }) {
    const application = await prisma.reviewerApplication.create({ data });
    return application;
  }

  async updateProfile(userId: string, data: any) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id: userId },
        data: { name: data.name },
      });

      if (user.role === "AUTHOR") {
        await tx.author.upsert({
          where: { userId: user.id },
          update: {
            fullName: data.name,
            mobile: data.mobile,
            country: data.country,
            institution: data.institution,
            designation: data.designation,
            orcid: data.orcid,
          },
          create: {
            userId: user.id,
            fullName: data.name,
            email: user.email,
            mobile: data.mobile,
            country: data.country,
            institution: data.institution,
            designation: data.designation,
            orcid: data.orcid,
          },
        });
      } else if (user.role === "REVIEWER") {
        await tx.reviewer.upsert({
          where: { email: user.email },
          update: {
            fullName: data.name,
            mobile: data.mobile,
            country: data.country,
            institution: data.institution,
            designation: data.designation,
            expertise: data.expertise,
          },
          create: {
            fullName: data.name,
            email: user.email,
            mobile: data.mobile,
            country: data.country,
            institution: data.institution,
            designation: data.designation,
            expertise: data.expertise,
          },
        });
      }
    });

    return this.getMe(userId);
  }
}
