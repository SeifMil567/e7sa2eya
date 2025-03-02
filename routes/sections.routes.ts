import { Elysia } from "elysia";
import { verifyToken } from "../utils/security";
import { SectionController } from "../controllers/section.controller";
import type {
  CreateSectionType,
  CreateSectionGroupType,
} from "../schemas/section.schema";

export const sectionsRoutes = new Elysia({ prefix: "/sections" })
  .derive(async ({ headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    return { uID: decoded.uID };
  })

  // Get all sections
  .get("/", async () => {
    return await SectionController.getAllSections();
  })

  // Get all sections stats
  .get("/stats", async () => {
    return await SectionController.getAllSectionsStats();
  })

  // Get all section groups
  .get("/groups", async () => {
    return await SectionController.getAllSectionsGroups();
  })

  // Create a new sections
  .post("/", async ({ body }) => {
    const data = body as CreateSectionType;
    return await SectionController.createSection(data);
  })

  // Create a new section group
  .post("/groups", async ({ body }) => {
    const data = body as CreateSectionGroupType;
    return await SectionController.createSectionGroup(data);
  })

  // Update a sections
  .put("/:id", async ({ params, body }) => {
    const id = parseInt(params.id);
    const data = body as Partial<CreateSectionType>;
    return await SectionController.updateSection(id, data);
  })

  // Update a sections group
  .put("/groups/:id", async ({ params, body }) => {
    const id = parseInt(params.id);
    const data = body as Partial<CreateSectionGroupType>;
    return await SectionController.updateSectionGroup(id, data);
  })

  // Delete a sections
  .delete("/:id", async ({ params }) => {
    const id = parseInt(params.id);
    return await SectionController.deleteSection(id);
  })

  // Delete a sections
  .delete("/groups/:id", async ({ params }) => {
    const id = parseInt(params.id);
    return await SectionController.deleteSectionGroup(id);
  });
