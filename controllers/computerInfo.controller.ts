import db from "../config/db";
import { eq, sql, or } from "drizzle-orm";
import { computerInfo } from "../db/schema";
import type { ComputerInfoType } from "../schemas/computerInfo.schema";
import { hashPassword } from "../utils/security";

export class ComputerInfoController {
  // Get all computers
  static async getAllComputers(search?: string) {
    try {
      const query = db.select().from(computerInfo);

      if (search) {
        const searchTerm = `%${search}%`;
        query.where(
          or(
            sql`${computerInfo.device_ip} ILIKE ${searchTerm}`,
            sql`${computerInfo.device_location} ILIKE ${searchTerm}`,
            sql`${computerInfo.device_name} ILIKE ${searchTerm}`,
            sql`${computerInfo.device_serial} ILIKE ${searchTerm}`,
            sql`${computerInfo.device_type} ILIKE ${searchTerm}`
          )
        );
      }

      return {
        success: true,
        data: await query,
      };
    } catch (error) {
      console.error("Error in getAllComputers:", error);
      return { success: false, error: "Failed to fetch computers" };
    }
  }

  // Create a new Computer
  static async createComputer(data: ComputerInfoType) {
    try {
      await db.insert(computerInfo).values(data);

      return { success: true, message: "Computer Added Successfully" };
    } catch (error) {
      console.error("Error in createComputer:", error);
      return { success: false, error: "Failed to create Computer" };
    }
  }

  // Update a Computer
  static async updateComputer(id: number, data: Partial<ComputerInfoType>) {
    try {
      const updatedComputer = await db
        .update(computerInfo)
        .set({
          ...data,
        })
        .where(eq(computerInfo.id, id));

      if (!updatedComputer) {
        return { success: false, error: "Computer not found" };
      }

      return { success: true, message: "Computer updated successfully" };
    } catch (error) {
      console.error(`Error in updatedComputer for ID ${id}:`, error);
      return { success: false, error: "Failed to update computer" };
    }
  }

  // Delete a Computer
  static async deleteComputer(id: number) {
    try {
      const deletedcomputer = await db
        .delete(computerInfo)
        .where(eq(computerInfo.id, id))
        .returning();

      if (!deletedcomputer.length) {
        return { success: false, error: "computer not found" };
      }

      return { success: true, data: deletedcomputer[0] };
    } catch (error) {
      console.error(`Error in deletedcomputer for ID ${id}:`, error); // Log the actual error
      return { success: false, error: "Failed to delete computer" };
    }
  }
}
