import { Elysia } from "elysia";
import type { CreateNutritionType } from "../schemas/nutrition.schema";
import { verifyToken } from "../utils/security";
import { NutritionController } from "../controllers/nutrition.controller";

export const nutritionsRoutes = new Elysia({ prefix: "/nutritions" })
  .derive(async ({ headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    return { uID: decoded.uID };
  })

  // Get all nutritions
  .get("/", async () => {
    return await NutritionController.getAllNutritions();
  })

  // Create a new nutrition
  .post("/", async ({ body, uID }) => {
    const data = body as CreateNutritionType;
    return await NutritionController.createNutrtion(data, uID);
  })

  // // Update a nutrition
  .put("/:id", async ({ params, body, uID }) => {
    const id = parseInt(params.id);
    const data = body as Partial<CreateNutritionType>;
    return await NutritionController.updateNutrtion(id, data, uID);
  })
  
  // Delete a nutrition
  .delete("/:id", async ({ params }) => {
    const id = parseInt(params.id);
    return await NutritionController.deleteNutrtion(id);
  });
