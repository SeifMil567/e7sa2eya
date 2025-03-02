import db from "../config/db";
import { eq } from "drizzle-orm";
import { nutritions } from "../db/schema";
import  type { CreateNutritionType }  from "../schemas/nutrition.schema"

export class NutritionController {
  // Get all sections
  static async getAllNutritions() {
    try {
      const allnutrtions = await db.select().from(nutritions);
      return { success: true, data: allnutrtions };
    } catch (error) {
      console.error("Error in getAllSections:", error); // Log the actual error
      return { success: false, error: "Failed to fetch nutrtions" };
    }
  }

  // Create a new nutrtion
  static async createNutrtion(data: CreateNutritionType, uID : any ) {
    try {
        const nutData = {nName : data.nname , ByUser : uID} 
      const newSection = await db.insert(nutritions).values(nutData).returning();
      return { success: true, data: newSection[0] };
    } catch (error) {
      console.error("Error in createNutrtion:", error); // Log the actual error
      return { success: false, error: "Failed to create nutrtion" };
    }
  }

  // Update a nutrtion
  static async updateNutrtion(id: number, data: Partial<CreateNutritionType>, uID : any) {
    try {
        const nutData = { nName : data.nname, ByUser : uID} 
      const updatedNutrtion = await db
        .update(nutritions)
        .set(nutData)
        .where(eq(nutritions.nID, id))
        .returning();

      if (!updatedNutrtion.length) {
        return { success: false, error: "Nutrition not found" };
      }

      return { success: true, data: updatedNutrtion[0] };
    } catch (error) {
      console.error(`Error in updatedNutrtion for ID ${id}:`, error); // Log the actual error
      return { success: false, error: "Failed to update nutrtion" };
    }
  }

  // Delete a nutrtion
  static async deleteNutrtion(id: number) {
    try {
      const deletedNutrtion = await db
        .delete(nutritions)
        .where(eq(nutritions.nID, id))
        .returning();

      if (!deletedNutrtion.length) {
        return { success: false, error: "Section not found" };
      }

      return { success: true, data: deletedNutrtion[0] };
    } catch (error) {
      console.error(`Error in deletedNutrtion for ID ${id}:`, error); // Log the actual error
      return { success: false, error: "Failed to delete nutrtion" };
    }
  }
}
