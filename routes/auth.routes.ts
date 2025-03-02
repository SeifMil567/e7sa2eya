import { Elysia } from "elysia";
import { AuthController } from "../controllers/auth.controller";
import { loginSchema } from "../schemas/auth.schema";
// import { bodyFormatter } from "../middleware/bodyFormatter";

export const authRoutes = new Elysia({ prefix: "/auth" }).post(
  "/login",
  async ({ body }) => {
    const validatedData = loginSchema.safeParse(body);

    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.errors,
      };
    }

    return await AuthController.login(validatedData.data);
  }
);
