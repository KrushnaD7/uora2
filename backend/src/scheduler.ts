import cron from "node-cron";
import { ArticleService } from "./modules/article/article.service";
import { prisma } from "./config/prisma";

const articleService = new ArticleService();

export function startScheduler() {
  cron.schedule("* * * * *", async () => {
    try {
      const count = await articleService.publishScheduledArticles();
      if (count > 0) {
        console.log(`[Scheduler] Auto-published ${count} article(s)`);
      }
    } catch (err) {
      console.error("[Scheduler] Error:", err);
    }
  });

  // Daily token hygiene: prune expired refresh tokens and stale one-time
  // reset/verification tokens so the database never accumulates orphaned data.
  cron.schedule("0 3 * * *", async () => {
    try {
      const now = new Date();
      const [refresh, resetTokens] = await Promise.all([
        prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: now } } }),
        prisma.users.updateMany({
          where: {
            OR: [
              { passwordResetExpiresAt: { lt: now } },
              { emailVerifyExpiresAt: { lt: now } },
            ],
          },
          data: {
            passwordResetTokenHash: null,
            passwordResetExpiresAt: null,
            emailVerifyTokenHash: null,
            emailVerifyExpiresAt: null,
          },
        }),
      ]);
      if (refresh.count > 0 || resetTokens.count > 0) {
        console.log(
          `[Scheduler] Pruned ${refresh.count} expired refresh token(s), cleared ${resetTokens.count} stale reset/verify token record(s)`
        );
      }
    } catch (err) {
      console.error("[Scheduler] Token-prune error:", err);
    }
  });

  console.log("[Scheduler] Started — checking every 60 seconds");
}
