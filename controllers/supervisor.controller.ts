import db from "../config/db";
import { eq } from "drizzle-orm";
import { supervisors, ranks } from "../db/schema";
import type { CreateSupervisorType } from "../schemas/supervisor.schema.ts";

export class supervisorController {
  // Get all sections
  static async getAllsupervisors() {
    try {
      const allsupervisors = await db
        .select({
          id: supervisors.id,
          supervisorName: supervisors.name,
          rankID: supervisors.rank,
          rankName: ranks.name,
        })
        .from(supervisors)
        .innerJoin(ranks, eq(supervisors.rank, ranks.id))
        .orderBy(supervisors.id);
      return { success: true, data: allsupervisors };
    } catch (error) {
      console.error("Error in getAllsupervisors:", error); // Log the actual error
      return { success: false, error: "Failed to fetch supervisors" };
    }
  }

  // Create a new supervisor
  static async createsupervisor(data: CreateSupervisorType) {
    try {
      const newSuperVisor = await db
        .insert(supervisors)
        .values(data)
        .returning();
      return { success: true, data: newSuperVisor[0] };
    } catch (error) {
      console.error("Error in createsupervisor:", error); // Log the actual error
      return { success: false, error: "Failed to create supervisor" };
    }
  }

  // Update a supervisor
  static async updatesupervisor(
    id: number,
    data: Partial<CreateSupervisorType>
  ) {
    try {
      const updatedSupervisor = await db
        .update(supervisors)
        .set(data)
        .where(eq(supervisors.id, id))
        .returning();

      if (!updatedSupervisor.length) {
        return { success: false, error: "supervisor not found" };
      }

      return { success: true, data: updatedSupervisor[0] };
    } catch (error) {
      console.error(`Error in updatedsupervisor for ID ${id}:`, error); // Log the actual error
      return { success: false, error: "Failed to update supervisor" };
    }
  }

  // Delete a supervisor
  static async deletesupervisor(id: number) {
    try {
      const deletedSupervisor = await db
        .delete(supervisors)
        .where(eq(supervisors.id, id))
        .returning();

      if (!deletedSupervisor.length) {
        return { success: false, error: "Section not found" };
      }

      return { success: true, data: deletedSupervisor[0] };
    } catch (error) {
      console.error(`Error in deletedsupervisor for ID ${id}:`, error); // Log the actual error
      return { success: false, error: "Failed to delete supervisor" };
    }
  }
}
