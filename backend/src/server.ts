import app from "./app";
import { env } from "./config/env";
import { startScheduler } from "./scheduler";

startScheduler();

app.listen(env.PORT, () => {
  console.log(`
====================================
🚀 UORA Journal API Started
🌐 Port : ${env.PORT}
🌍 Environment : ${env.NODE_ENV}
====================================
`);
});