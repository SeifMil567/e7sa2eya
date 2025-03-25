import db from "../config/db";
import { eq } from "drizzle-orm";
import type {
  CreateSectionType,
  CreateSectionGroupType,
} from "../schemas/section.schema";
import { sectionsOccupancy, sectionGroup } from "../db/schema";

export class SectionController {
  // Get all sections
  static async getAllSections() {
    try {
      const sections = await db
        .select({
          // Section Data
          secID: sectionsOccupancy.secID,
          secName: sectionsOccupancy.secName,
          totalCapacity: sectionsOccupancy.totalCapacity,
          sectionGroupID: sectionsOccupancy.sectionGroupID,
          hasRoom: sectionsOccupancy.hasRoom,
          hasNutrition: sectionsOccupancy.hasNutrition,
          underConstruction: sectionsOccupancy.underConstruction,
        })
        .from(sectionsOccupancy)
        .orderBy(sectionsOccupancy.order);

      return { success: true, data: sections };
    } catch (error) {
      console.error("Error in getAllSections:", error);
      return { success: false, error: "Failed to fetch sections" };
    }
  }

  static async getAllSectionsStats() {
    try {
      const sections = await db
        .select({
          // Section Data
          secID: sectionsOccupancy.secID,
          secName: sectionsOccupancy.secName,
          officers: sectionsOccupancy.officers,
          officersfamily: sectionsOccupancy.officersfamily,
          ranks: sectionsOccupancy.ranks,
          familyranks: sectionsOccupancy.familyranks,
          civilian: sectionsOccupancy.civilian,
          escorts: sectionsOccupancy.escorts,
          patients: sectionsOccupancy.patients,
          totalCapacity: sectionsOccupancy.totalCapacity,
          availableBeds: sectionsOccupancy.availableBeds,
          hasNutrition: sectionsOccupancy.hasNutrition,
          hasRoom: sectionsOccupancy.hasRoom,
          underConstruction: sectionsOccupancy.underConstruction,
          // Group Data
          groupId: sectionGroup.id,
          groupName: sectionGroup.groupName,
        })
        .from(sectionsOccupancy)
        .leftJoin(
          sectionGroup,
          eq(sectionsOccupancy.sectionGroupID, sectionGroup.id)
        )
        .orderBy(sectionGroup.id, sectionsOccupancy.secID);

      // Calculate totals
      const totals = sections.reduce(
        (acc, section) => {
          // Skip sections with groupID 6666
          if (section.groupId === 6666 || section.totalCapacity == 1111) {
            return acc;
          }

          return {
            totalOfficers: (acc.totalOfficers || 0) + (section.officers || 0),
            totalOfficersFamily:
              (acc.totalOfficersFamily || 0) + (section.officersfamily || 0),
            totalRanks: (acc.totalRanks || 0) + (section.ranks || 0),
            totalFamilyRanks:
              (acc.totalFamilyRanks || 0) + (section.familyranks || 0),
            totalCivilian: (acc.totalCivilian || 0) + (section.civilian || 0),
            totalEscorts: (acc.totalEscorts || 0) + (section.escorts || 0),
            totalPatients: (acc.totalPatients || 0) + (section.patients || 0),
            totalAvailableBeds:
              (acc.totalAvailableBeds || 0) + (section.availableBeds || 0),
            totalCapacity:
              (acc.totalCapacity || 0) + (section.totalCapacity || 0),
          };
        },
        {} as {
          totalOfficers: number;
          totalOfficersFamily: number;
          totalRanks: number;
          totalFamilyRanks: number;
          totalCivilian: number;
          totalEscorts: number;
          totalPatients: number;
          totalAvailableBeds: number;
          totalCapacity: number;
        }
      );

      // Calculate occupancy percentage
      const occupancyPercentage =
        totals.totalCapacity > 0
          ? ((totals.totalPatients + totals.totalEscorts) /
              totals.totalCapacity) *
            100
          : 0;

      // Group sections by their section group
      const sectionsByGroup = sections.reduce(
        (acc, section) => {
          const sectionData = {
            secID: section.secID,
            secName: section.secName,
            officers: section.officers,
            officersfamily: section.officersfamily,
            ranks: section.ranks,
            familyranks: section.familyranks,
            civilian: section.civilian,
            escorts: section.escorts,
            patients: section.patients,
            totalCapacity: section.totalCapacity,
            availableBeds: section.availableBeds,
            underConstruction: section.underConstruction,
          };

          const group = acc.find((g) => g.groupId === section.groupId);

          if (group) {
            group.sections.push(sectionData);
          } else {
            acc.push({
              groupId: section.groupId ?? 0,
              groupName: section.groupName ?? "Ungrouped",
              sections: [sectionData],
            });
          }

          return acc;
        },
        [] as Array<{
          groupId: number;
          groupName: string;
          sections: Array<any>;
        }>
      );

      return {
        success: true,
        data: {
          groups: sectionsByGroup,
          statistics: {
            ...totals,
            occupancyPercentage: Math.round(occupancyPercentage * 100) / 100, // Round to 2 decimal places
          },
        },
      };
    } catch (error) {
      console.error("Error in getAllSectionsStats:", error);
      return { success: false, error: "Failed to fetch sections stats" };
    }
  }

  // Get all sections groups
  static async getAllSectionsGroups() {
    try {
      const allSectionsGroups = await db.select().from(sectionGroup);
      return { success: true, data: allSectionsGroups };
    } catch (error) {
      console.error("Error in getAllSectionsGroups:", error); // Log the actual error
      return { success: false, error: "Failed to fetch sections groups" };
    }
  }

  // Create a new section
  static async createSection(data: CreateSectionType) {
    try {
      const newSection = await db
        .insert(sectionsOccupancy)
        .values(data)
        .returning();
      return { success: true, data: newSection[0] };
    } catch (error) {
      console.error("Error in createSection:", error); // Log the actual error
      return { success: false, error: "Failed to create section" };
    }
  }

  // Create a new section group
  static async createSectionGroup(data: CreateSectionGroupType) {
    try {
      const newSectionGroup = await db
        .insert(sectionGroup)
        .values(data)
        .returning();
      return { success: true, data: newSectionGroup[0] };
    } catch (error) {
      console.error("Error in createSectionGroup:", error); // Log the actual error
      return { success: false, error: "Failed to create section group" };
    }
  }

  // Update a rank type
  static async updateSectionGroup(
    id: number,
    data: Partial<CreateSectionGroupType>
  ) {
    try {
      const updatedSectionGroup = await db
        .update(sectionGroup)
        .set(data)
        .where(eq(sectionGroup.id, id))
        .returning();

      if (!updatedSectionGroup.length) {
        return { success: false, error: "section group not found type" };
      }

      return { success: true, data: updatedSectionGroup[0] };
    } catch (error) {
      return { success: false, error: "Failed to update section group type" };
    }
  }

  // Update a section
  static async updateSection(id: number, data: Partial<CreateSectionType>) {
    try {
      // Fetch current section data
      const existingSection = await db
        .select()
        .from(sectionsOccupancy)
        .where(eq(sectionsOccupancy.secID, id))
        .limit(1);

      if (!existingSection.length) {
        return { success: false, error: "Section not found" };
      }

      const section = existingSection[0];

      // Ensure numerical fields are safely updated
      const officers = data.officers ?? section.officers ?? 0;
      const officersFamily = data.officersfamily ?? section.officersfamily ?? 0;
      const ranks = data.ranks ?? section.ranks ?? 0;
      const familyRanks = data.familyranks ?? section.familyranks ?? 0;
      const civilian = data.civilian ?? section.civilian ?? 0;
      const escorts = data.escorts ?? section.escorts ?? 0;
      const totalCapacity = data.totalCapacity ?? section.totalCapacity ?? 0;

      // Compute derived values
      const patients =
        officers + officersFamily + ranks + familyRanks + civilian;
      const availableBeds = totalCapacity - (patients + escorts);

      // Ensure values are valid
      if (patients < 0 || availableBeds < 0) {
        return {
          success: false,
          error:
            "There are patients currently in this section you have to remove them first before changing to these values",
        };
      }

      // Prepare updated data with computed values
      const updatedValues: Partial<CreateSectionType> = {
        ...data,
        patients,
        availableBeds,
      };

      // Perform database update
      const updatedSection = await db
        .update(sectionsOccupancy)
        .set(updatedValues)
        .where(eq(sectionsOccupancy.secID, id))
        .returning();

      return { success: true, data: updatedSection[0] };
    } catch (error) {
      console.error(`Error in updateSection for ID ${id}:`, error);
      return { success: false, error: "Failed to update section" };
    }
  }

  // Delete a rank
  static async deleteSectionGroup(id: number) {
    try {
      const deletedSectionGroup = await db
        .delete(sectionGroup)
        .where(eq(sectionGroup.id, id))
        .returning();

      if (!deletedSectionGroup.length) {
        return { success: false, error: "section Group not found" };
      }

      return { success: true, data: deletedSectionGroup[0] };
    } catch (error) {
      return { success: false, error: "Failed to delete section Group" };
    }
  }

  // Delete a section
  static async deleteSection(id: number) {
    try {
      // Fetch the section to check if it exists and has patients
      const existingSection = await db
        .select({
          secID: sectionsOccupancy.secID,
          patients: sectionsOccupancy.patients,
        })
        .from(sectionsOccupancy)
        .where(eq(sectionsOccupancy.secID, id))
        .limit(1);

      if (!existingSection.length) {
        return { success: false, error: "Section not found" };
      }

      const section = existingSection[0];

      // Ensure patients is a number (convert null to 0)
      const patients = section.patients ?? 0;

      // Prevent deletion if there are patients
      if (patients > 0) {
        return { success: false, error: "Cannot delete section with patients" };
      }

      // Proceed with deletion if no patients
      const deletedSection = await db
        .delete(sectionsOccupancy)
        .where(eq(sectionsOccupancy.secID, id))
        .returning();

      return { success: true, data: deletedSection[0] };
    } catch (error) {
      console.error(`Error in deleteSection for ID ${id}:`, error);
      return { success: false, error: "Failed to delete section" };
    }
  }
}
