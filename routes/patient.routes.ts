import { Elysia } from "elysia";
import { PatientController } from "../controllers/patients.controller";
import { createPatientSchema } from "../schemas/patient.schema";

export const patientRoutes = new Elysia({ prefix: "/patients" })
  .get("/", async () => {
    return await PatientController.getAllPatients();
  })
  .get("/:id", async ({ params }) => {
    const id = parseInt(params.id);
    return await PatientController.getPatientById(id);
  })
  .post("/", async ({ body }) => {
    const validatedData = createPatientSchema.safeParse(body);

    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.errors,
      };
    }

    return await PatientController.createPatient(validatedData.data);
  });
