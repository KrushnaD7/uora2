// Re-export the proxy function as the Next.js middleware entry point.
// proxy.ts holds all the logic (role-based route protection + per-journal
// subdomain rewriting); this file just wires it into the Next.js middleware
// contract, which requires a file called middleware.ts exporting a function
// named `middleware`.

export { proxy as middleware, config } from "./proxy";
