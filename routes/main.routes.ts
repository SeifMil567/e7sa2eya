import { Elysia } from "elysia";
import { authRoutes } from "./auth.routes";
import { patientRoutes } from "./patient.routes";
import { patientHistoryRoutes } from "./patientHistory.routes";
import { rankRoutes } from "./rank.routes";
import { nutritionsRoutes } from "./nutritions.routes";
import { sectionsRoutes } from "./sections.routes";
import { userRoutes } from "./user.routes";
import { supervisorRoutes } from "../routes/supervisor.routes";
// import { nutritionsRoutes } from "./nutritions.";

// Main router that combines all module routes
export const mainRoutes = new Elysia({ prefix: "/api" })
  .use(authRoutes)
  .use(patientRoutes)
  .use(patientHistoryRoutes)
  .use(rankRoutes)
  .use(sectionsRoutes)
  .use(nutritionsRoutes)
  .use(userRoutes)
  .use(supervisorRoutes);

//   .use(nutritionsRoutes);
