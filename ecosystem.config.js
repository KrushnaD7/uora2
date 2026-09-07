/**
 * PM2 process configuration for UORA.
 *
 * Use this when running on a self-managed VPS or any environment with PM2
 * (npm install -g pm2). Hostinger's managed Node.js hosting has its own process
 * runner — on that plan, follow DEPLOY.md instead and use the individual
 * `start` scripts below.
 *
 *   pm2 start ecosystem.config.js
 *   pm2 save && pm2 startup   # (VPS) keep the apps alive across reboots
 *
 * The backend must be built (npm run build:backend) and the frontend built
 * (npm run build:frontend) before `pm2 start`.
 */
module.exports = {
  apps: [
    {
      name: "uora-backend",
      cwd: "./backend",
      script: "./dist/server.js",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        NODE_OPTIONS: "--max-old-space-size=512",
      },
      // Load runtime secrets from backend/.env (production values).
      env_file: "./backend/.env",
    },
    {
      name: "uora-frontend",
      cwd: "./frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NODE_OPTIONS: "--max-old-space-size=512",
      },
    },
  ],
};
