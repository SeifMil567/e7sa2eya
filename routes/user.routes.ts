import { Elysia } from "elysia";
import type { CreateUserType } from "../schemas/user.schema";
import { verifyToken } from "../utils/security";
import { UserController } from "../controllers/user.controller";

export const userRoutes = new Elysia({ prefix: "/users" })
  .derive(async ({ headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    return { uID: decoded.uID };
  })

  // Get all Users
  .get("/", async () => {
    return await UserController.getAllUsers();
  })

  // Create a new User
  .post("/", async ({ body, uID }) => {
    const data = body as CreateUserType;
    return await UserController.createUser(data, uID);
  })

  // Update a User
  .put("/:id", async ({ params, body, uID }) => {
    const id = parseInt(params.id);
    const data = body as Partial<CreateUserType>;
    return await UserController.updateUser(id, data, uID);
  })

  // Delete a User
  .delete("/:id", async ({ params }) => {
    const id = parseInt(params.id);
    return await UserController.deleteUser(id);
  });
