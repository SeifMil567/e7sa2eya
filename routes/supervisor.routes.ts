import { Elysia } from "elysia";
import type { CreateSupervisorType } from "../schemas/supervisor.schema.ts";
import { verifyToken } from "../utils/security";
import { supervisorController } from "../controllers/supervisor.controller.ts";

export const supervisorRoutes = new Elysia({ prefix: "/supervisors" })
  .derive(async ({ headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    return { uID: decoded.uID };
  })

  // Get all supervisors
  .get("/", async () => {
    return await supervisorController.getAllsupervisors();
  })

  // Create a new supervisor
  .post("/", async ({ body }) => {
    const data = body as CreateSupervisorType;
    return await supervisorController.createsupervisor(data);
  })

  // Update a supervisor
  .put("/:id", async ({ params, body }) => {
    const id = parseInt(params.id);
    const data = body as Partial<CreateSupervisorType>;
    return await supervisorController.updatesupervisor(id, data);
  })

  // Delete a supervisor
  .delete("/:id", async ({ params }) => {
    const id = parseInt(params.id);
    return await supervisorController.deletesupervisor(id);
  });
