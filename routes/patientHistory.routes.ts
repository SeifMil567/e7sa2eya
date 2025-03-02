import { Elysia } from "elysia";
import { PatientHistoryController } from "../controllers/patientHistory.controller";
import {
  admissionSchema,
  transferSchema,
  exitSchema,
  changeNutritionSchema,
  changeRoomSchema,
  addEscortSchema,
  editAdmissionSchema,
} from "../schemas/patientHistory.schema";
import { verifyToken } from "../utils/security";
import type { ZodIssue } from "zod";

export const patientHistoryRoutes = new Elysia({ prefix: "/patient-history" })
  .derive(async ({ headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    return { uID: decoded.uID };
  })
  .get("/active-by-section", async () => {
    try {
      return await PatientHistoryController.getActivePatientsBySection();
    } catch (error) {
      return {
        success: false,
        error: "Unauthorized access or server error",
      };
    }
  })
  // .get("/history", async () => {
  //   try {
  //     return await PatientHistoryController.getHistory();
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: "Unauthorized access or server error",
  //     };
  //   }
  // })
  .post("/admit", async ({ body, uID, set }) => {
    try {
      const validatedData = admissionSchema.safeParse(body);

      if (!validatedData.success) {
        return {
          success: false,
          error: validatedData.error.errors,
        };
      }

      return await PatientHistoryController.admitPatient(
        validatedData.data,
        uID,
        set
      );
    } catch (error) {
      return {
        success: false,
        error: "Failed to process admission request",
      };
    }
  })
  .post("/editEntry", async ({ body, uID, set }) => {
    try {
      const validatedData = editAdmissionSchema.safeParse(body);

      if (!validatedData.success) {
        return {
          success: false,
          error: validatedData.error.errors,
        };
      }

      return await PatientHistoryController.editAdmission(
        validatedData.data,
        uID,
        set
      );
    } catch (error) {
      return {
        success: false,
        error: "Failed to process admission request",
      };
    }
  })
  .put("/addEscort/:id", async ({ body, params }) => {
    try {
      const validatedData = addEscortSchema.safeParse(body);

      if (!validatedData.success) {
        return {
          success: false,
          error: validatedData.error.errors,
        };
      }
      const id = parseInt(params.id);

      return await PatientHistoryController.addEscortController(
        validatedData.data,
        id
      );
    } catch (error) {
      return {
        success: false,
        error: "Failed to process add escort request",
      };
    }
  })
  .post("/transfer", async ({ body }) => {
    try {
      const validatedData = transferSchema.safeParse(body);

      if (!validatedData.success) {
        return {
          success: false,
          error: validatedData.error.errors,
        };
      }

      //   const { uID } = await getCurrentUser();
      const uID = 1;
      return await PatientHistoryController.transferPatient(
        validatedData.data,
        uID
      );
    } catch (error) {
      return {
        success: false,
        error: "Failed to process transfer request",
      };
    }
  })
  .post("/exit", async ({ body }) => {
    try {
      const validatedData = exitSchema.safeParse(body);

      if (!validatedData.success) {
        return {
          success: false,
          error: validatedData.error.errors,
        };
      }

      //   const { uID } = await getCurrentUser();
      const uID = 1;
      return await PatientHistoryController.exitPatient(
        validatedData.data,
        uID
      );
    } catch (error) {
      return {
        success: false,
        error: "Failed to process exit request",
      };
    }
  })
  .post("/change-nutrition", async ({ body }) => {
    try {
      const validatedData = changeNutritionSchema.safeParse(body);

      if (!validatedData.success) {
        return {
          success: false,
          error: validatedData.error.errors,
        };
      }

      //   const { uID } = await getCurrentUser();
      const uID = 1;
      return await PatientHistoryController.changeNutrition(
        validatedData.data,
        uID
      );
    } catch (error) {
      return {
        success: false,
        error: "Failed to process nutrition change request",
      };
    }
  })
  .post("/change-room", async ({ body }) => {
    try {
      const validatedData = changeRoomSchema.safeParse(body);

      if (!validatedData.success) {
        return {
          success: false,
          error: validatedData.error.errors,
        };
      }

      // const { uID } = await getCurrentUser();
      const uID = 1;
      return await PatientHistoryController.changeRoom(validatedData.data, uID);
    } catch (error) {
      return {
        success: false,
        error: "Failed to process nutrition change request",
      };
    }
  });

function post(
  arg0: string,
  arg1: ({
    body,
  }: {
    body: any;
  }) => Promise<
    | { success: boolean; error: string; message?: undefined }
    | { success: boolean; message: string; error?: undefined }
    | { success: boolean; error: ZodIssue[] }
  >
) {
  throw new Error("Function not implemented.");
}
