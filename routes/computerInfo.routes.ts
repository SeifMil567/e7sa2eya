import { Elysia } from "elysia";
import type { ComputerInfoType } from "../schemas/computerInfo.schema";
import { verifyToken } from "../utils/security";
import { ComputerInfoController } from "../controllers/computerInfo.controller";

export const computerRoutes = new Elysia({ prefix: "/computer" })
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
  .get("/", async ({ query }) => {
    const search = query.search as string | undefined;
    return await ComputerInfoController.getAllComputers(search);
  })

  // Create a new User
  .post("/", async ({ body }) => {
    const data = body as ComputerInfoType;
    return await ComputerInfoController.createComputer(data);
  })

  // Update a User
  .put("/:id", async ({ params, body, uID }) => {
    const id = parseInt(params.id);
    const data = body as Partial<ComputerInfoType>;
    return await ComputerInfoController.updateComputer(id, data);
  })

  // Delete a User
  .delete("/:id", async ({ params }) => {
    const id = parseInt(params.id);
    return await ComputerInfoController.deleteComputer(id);
  });
