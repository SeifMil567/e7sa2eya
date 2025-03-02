import { Elysia } from "elysia";
import { mainRoutes } from "./routes/main.routes";
import { cors } from "@elysiajs/cors";
import dotenv from "dotenv";
// import { authMiddleware } from "./middleware/auth";
// import { verifyToken } from "./utils/security";
dotenv.config();

const app = new Elysia()
  .use(cors())
   // Apply middleware globally
  .get("/", () => ({ message: "Elysia.js with Bun is running!" }))
  .use(mainRoutes)
  .listen(process.env.PORT || 3000);

console.log(`🚀 Server is running on http://localhost:${app.server?.port}`);
