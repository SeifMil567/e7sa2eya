// Suppress deprecation warning
process.removeAllListeners("warning");

import { Elysia } from "elysia";
import { mainRoutes } from "./routes/main.routes";
import { cors } from "@elysiajs/cors";
import dotenv from "dotenv";

dotenv.config();

const app = new Elysia()
  .use(cors())
  .get("/", () => ({ message: "Elysia.js with Bun is running!" }))
  .use(mainRoutes)
  .listen({
    hostname: "0.0.0.0",
    port: process.env.PORT || 3000,
  });
console.log(`🚀 Server is running on http://128.2.5.51:${app.server?.port}`);
