import db from "../config/db";
import { patients } from "../db/schema";
import type { CreatePatientType } from "../schemas/patient.schema";
import { eq } from "drizzle-orm";

export class PatientController {
  static async getAllPatients() {
    try {
      const allPatients = await db.select().from(patients);
      return { success: true, data: allPatients };
    } catch (error) {
      return { success: false, error: "Failed to fetch patients" };
    }
  }

  static async getPatientById(id: number) {
    try {
      const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.pID, id));

      if (!patient.length) {
        return { success: false, error: "Patient not found" };
      }

      return { success: true, data: patient[0] };
    } catch (error) {
      return { success: false, error: "Failed to fetch patient" };
    }
  }

  static async createPatient(data: CreatePatientType) {
    try {


      return { success: true};
    } catch (error) {
      return { success: false, error: "Failed to create patient" };
    }
  }
}
