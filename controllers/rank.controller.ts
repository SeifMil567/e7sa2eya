import db from "../config/db";
import { ranks, rankType, rankFamily } from "../db/schema";
import { eq } from "drizzle-orm";
import type {
  CreateRankType,
  CreateRankTypesType,
} from "../schemas/rank.schema";

export class RankController {
  // Get all ranks
  static async getAllRanks() {
    try {
      const allRanks = await db
        .select({
          rankID: ranks.id,
          rankName: ranks.name,
          rankTypeID: ranks.typeID, // Include rankTypeID for grouping
          rankTypeName: rankType.name,
        })
        .from(ranks)
        .innerJoin(rankType, eq(ranks.typeID, rankType.id))
        .orderBy(ranks.typeID, ranks.id); // Order by rankTypeID first for grouping

      // Group results by rankTypeID
      const groupedRanks = allRanks.reduce((acc, rank) => {
        const { rankTypeID, rankTypeName, ...rankData } = rank;

        let typeGroup = acc.find((group) => group.rankTypeID === rankTypeID);
        if (!typeGroup) {
          typeGroup = {
            rankTypeID,
            rankTypeName,
            ranks: [],
          };
          acc.push(typeGroup);
        }

        typeGroup.ranks.push(rankData);
        return acc;
      }, [] as Array<{ rankTypeID: number; rankTypeName: string; ranks: Array<any> }>);

      return {
        success: true,
        data: groupedRanks,
      };
    } catch (error) {
      console.error("Error in getAllRanks:", error);
      return {
        success: false,
        error: "Failed to fetch ranks",
      };
    }
  }

  // Get  all rank types
  static async getAllRankTypes() {
    try {
      const allRankTypes = await db.select().from(rankType);

      return {
        success: true,
        data: allRankTypes,
      };
    } catch (error) {
      console.error("Error in getAllRankTypes:", error);
      return {
        success: false,
        error: "Failed to fetch ranks",
      };
    }
  }

  // Get all rank family types
  static async getAllFamilyRanks() {
    try {
      const allRelations = await db
        .select({
          id: rankFamily.id,
          relationName: rankFamily.name,
        })
        .from(rankFamily);
      return {
        success: true,
        data: allRelations,
      };
    } catch (error) {
      console.error("Error in getAllRanks:", error);
      return {
        success: false,
        error: "Failed to fetch ranks",
      };
    }
  }

  // Create a new rank
  static async createRank(data: CreateRankType) {
    try {
      const newRank = await db.insert(ranks).values(data).returning();
      return { success: true, data: newRank[0] };
    } catch (error) {
      return { success: false, error: "Failed to create rank" };
    }
  }

  // Create a new rank
  static async createRankType(data: CreateRankTypesType) {
    try {
      const newRankType = await db.insert(rankType).values(data).returning();
      return { success: true, data: newRankType[0] };
    } catch (error) {
      return { success: false, error: "Failed to create rank type" };
    }
  }

  // Update a rank
  static async updateRank(id: number, data: Partial<CreateRankType>) {
    try {
      const updatedRank = await db
        .update(ranks)
        .set(data)
        .where(eq(ranks.id, id))
        .returning();

      if (!updatedRank.length) {
        return { success: false, error: "Rank not found" };
      }

      return { success: true, data: updatedRank[0] };
    } catch (error) {
      return { success: false, error: "Failed to update rank" };
    }
  }

  // Update a rank type
  static async updateRankType(id: number, data: Partial<CreateRankTypesType>) {
    try {
      const updatedRank = await db
        .update(rankType)
        .set(data)
        .where(eq(rankType.id, id))
        .returning();

      if (!updatedRank.length) {
        return { success: false, error: "Rank not found type" };
      }

      return { success: true, data: updatedRank[0] };
    } catch (error) {
      return { success: false, error: "Failed to update rank type" };
    }
  }

  // Delete a rank
  static async deleteRank(id: number) {
    try {
      const deletedRank = await db
        .delete(ranks)
        .where(eq(ranks.id, id))
        .returning();

      if (!deletedRank.length) {
        return { success: false, error: "Rank not found" };
      }

      return { success: true, data: deletedRank[0] };
    } catch (error) {
      return { success: false, error: "Failed to delete rank" };
    }
  }

  // Delete a rank
  static async deleteRankType(id: number) {
    try {
      const deletedRankType = await db
        .delete(rankType)
        .where(eq(rankType.id, id))
        .returning();

      if (!deletedRankType.length) {
        return { success: false, error: "Rank type not found" };
      }

      return { success: true, data: deletedRankType[0] };
    } catch (error) {
      return { success: false, error: "Failed to delete rank type" };
    }
  }
}
