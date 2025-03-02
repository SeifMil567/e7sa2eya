import { Elysia } from "elysia";
import type { CreateRankType, CreateRankTypesType } from "../schemas/rank.schema";
import { RankController } from "../controllers/rank.controller";
import { verifyToken } from "../utils/security";

export const rankRoutes = new Elysia({ prefix: "/ranks" })
  .derive(async ({ headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    return { uID: decoded.uID };
  })
  // Get all ranks
  .get("/", async () => {
    return await RankController.getAllRanks();
  })

  .get("/types", async () => {
    return await RankController.getAllRankTypes();
  })

  // Get all family relations
  .get("/family", async () => {
    return await RankController.getAllFamilyRanks();
  })

  // Create a new rank
  .post("/", async ({ body }) => {
    const data = body as CreateRankType;
    return await RankController.createRank(data);
  })

  // Create a new rank type
  .post("/type", async ({ body }) => {
    const data = body as CreateRankTypesType;
    return await RankController.createRankType(data);
  })

  // Update a rank
  .put("/:id", async ({ params, body }) => {
    const id = parseInt(params.id);
    const data = body as Partial<CreateRankType>;
    return await RankController.updateRank(id, data);
  })

  // Update a rank
  .put("/type/:id", async ({ params, body }) => {
    const id = parseInt(params.id);
    const data = body as Partial<CreateRankTypesType>;
    return await RankController.updateRankType(id, data);
  })

  // Delete a rank
  .delete("/:id", async ({ params }) => {
    const id = parseInt(params.id);
    return await RankController.deleteRank(id);
  })

  // Delete a rank
  .delete("/type/:id", async ({ params }) => {
    const id = parseInt(params.id);
    return await RankController.deleteRankType(id);
  });
