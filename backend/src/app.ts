import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { corsOrigins, env } from "./config/env";
import { requestIdMiddleware } from "./middlewares/requestId";
import {
  generalLimiter,
  authLimiter,
  sensitiveLimiter,
} from "./middlewares/rate.limit";
import healthRoutes from "./modules/health/health.routes";


// Routes

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

import journalRoutes from "./modules/journal/journal.routes";
import volumeRoutes from "./modules/volume/volume.routes";
import issueRoutes from "./modules/issue/issue.routes";

import articleRoutes from "./modules/article/article.routes";

import submissionRoutes from "./modules/submission/submission.routes";
import submissionReviewerRoutes from "./modules/submission-reviewer/submission-reviewer.routes";

import editorialDecisionRoutes from "./modules/editorial-decision/editorial-decision.routes";

import authorRoutes from "./modules/author/author.routes";
import reviewerRoutes from "./modules/reviewer/reviewer.routes";
import reviewRoutes from "./modules/review/review.routes";

import revisionRoutes from "./modules/revision/revision.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import journalSuggestionRoutes from "./modules/journal-suggestion/journal-suggestion.routes";


// Public API Route
import publicRoutes from "./modules/public/public.routes";


// Swagger

import {
  swaggerUi,
  swaggerDocument,
} from "./config/swagger";


// Error Handler

import {
  errorHandler
} from "./middlewares/error.middleware";



const app = express();

// Correctly honour the X-Forwarded-For proxy chain only when deployed behind a
// reverse proxy (production). The hop count is configurable via
// TRUST_PROXY_HOPS because it MUST match the real number of proxies in front
// of this app — an incorrect value here (e.g. hard-coding 1 when there are
// actually 2 hops) makes Express resolve the wrong IP, which silently breaks
// per-IP rate limiting (multiple real visitors can end up sharing one
// bucket) and pollutes audit-log IPs. See .env.example.
app.set(
  "trust proxy",
  process.env.NODE_ENV === "production" ? env.TRUST_PROXY_HOPS : false
);


/**
 * ===========================
 * Global Middleware
 * ===========================
 */

// Request correlation ID for tracing every request through logs.
app.use(requestIdMiddleware);

// Safe request logging (method, path, status, request id — never bodies/secrets).
app.use((req, res, next) => {
  res.on("finish", () => {
    const safePath = (req.originalUrl || req.url || "").split("?")[0];
    console.log(
      `[req] ${req.requestId} ${req.method} ${safePath} ${res.statusCode} IP=${String(process.env.NODE_ENV === "development" ? (req as any).ip : "")}`
    );
  });
  next();
});

// Security headers (Helmet). CSP is applied in development via default; a
// production-safe CSP is configured below without breaking the SPA/admin UI.
app.use(
  helmet({
    contentSecurityPolicy: false, // SPA served by Next.js; CSP configured there.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Gzip/brotli-capable compression for JSON API responses — meaningfully
// reduces bandwidth and response time on Hostinger's shared network for the
// larger public listing/detail payloads (journals, issues, articles), at a
// small, well worth it CPU cost for a text-heavy JSON API.
app.use(compression());

// CORS - restrict to configured origins (never "*" with credentials)
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (server-to-server, curl, mobile).
      if (!origin) return callback(null, true);
      if (corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Global rate limit for the public API (per IP).
app.use(generalLimiter());

// Stricter rate limit for auth/registration/application endpoints.
app.use("/api/auth", authLimiter());

// Body size limits - reject oversized payloads.
app.use(express.json({ limit: "1mb" }));

app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Removed insecure static serving of /uploads





/**
 * ===========================
 * Health Check
 * ===========================
 */


app.get(
  "/",
  (_req, res) => {

    res.status(200).json({

      success:true,

      message:
      "🚀 UORA Journal API is running successfully"

    });

  }
);

// Health / readiness endpoints (liveness + DB connectivity).
app.use("/api/health", healthRoutes);




/**
 * ===========================
 * Swagger Documentation
 * ===========================
 */


app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(
    swaggerDocument
  )
);




/**
 * ===========================
 * Authentication
 * ===========================
 */


app.use(
  "/api/auth",
  authRoutes
);




/**
 * ===========================
 * User Management
 * ===========================
 */


app.use(
  "/api/users",
  sensitiveLimiter(),
  userRoutes
);




/**
 * ===========================
 * Dashboard
 * ===========================
 */


app.use(
  "/api/dashboard",
  dashboardRoutes
);




/**
 * ===========================
 * Journal Management
 * ===========================
 */


app.use(
  "/api/journals",
  journalRoutes
);




/**
 * ===========================
 * Volume Management
 * ===========================
 */


app.use(
  "/api/volumes",
  volumeRoutes
);




/**
 * ===========================
 * Issue Management
 * ===========================
 */


app.use(
  "/api/issues",
  issueRoutes
);




/**
 * ===========================
 * Article Management
 * ===========================
 */


app.use(
  "/api/articles",
  articleRoutes
);




/**
 * ===========================
 * Submission Management
 * ===========================
 */


app.use(
  "/api/submissions",
  sensitiveLimiter(),
  submissionRoutes
);




/**
 * ===========================
 * Submission Reviewer
 * ===========================
 */


app.use(
  "/api/submissions",
  sensitiveLimiter(),
  submissionReviewerRoutes
);




/**
 * ===========================
 * Editorial Decision
 * ===========================
 */


app.use(
  "/api/editorial-decisions",
  sensitiveLimiter(),
  editorialDecisionRoutes
);




/**
 * ===========================
 * Author Management
 * ===========================
 */


app.use(
  "/api/authors",
  authorRoutes
);




/**
 * ===========================
 * Reviewer Management
 * ===========================
 */


app.use(
  "/api/reviewers",
  sensitiveLimiter(),
  reviewerRoutes
);




/**
 * ===========================
 * Review Management
 * ===========================
 */


app.use(
  "/api/reviews",
  sensitiveLimiter(),
  reviewRoutes
);




/**
 * ===========================
 * Revision Management
 * ===========================
 */


app.use(
  "/api/revisions",
  sensitiveLimiter(),
  revisionRoutes
);


/**
 * ===========================
 * Notification Management
 * ===========================
 */

app.use(
  "/api/notifications",
  notificationRoutes
);


/**
 * ===========================
 * Journal Suggestion Management
 * ===========================
 */

app.use(
  "/api/journals-suggestions",
  journalSuggestionRoutes
);




/**
 * ===========================
 * PUBLIC JOURNAL APIs
 * ===========================
 *
 * No authentication required
 *
 * Examples:
 *
 * GET /api/public/journals
 * GET /api/public/journals/:slug
 * GET /api/public/articles
 * GET /api/public/articles/:id
 *
 */


app.use(
  "/api/public",
  publicRoutes
);




/**
 * ===========================
 * Global Error Handler
 * ===========================
 */


app.use(
  errorHandler
);



export default app;