import db from "../config/db";
import {
  patients,
  patientsHistory,
  sectionsOccupancy,
  ranks,
  rankFamily,
  rankType,
  nutritions,
  users,
  sectionGroup,
  actions,
} from "../db/schema";
import { eq, and, or, desc, SQL } from "drizzle-orm";
import type {
  AdmissionType,
  TransferType,
  ExitType,
  ChangeNutritionType,
  changeRoomType,
  addEscortType,
  EditAdmissionType,
  RestoreType,
} from "../schemas/patientHistory.schema";
import { sql } from "drizzle-orm";
import type { HistoryFilterType } from "../schemas/history.schema";

const getFormattedKey = (
  rankName: string | null,
  rankTypeID: number | null,
  familyRelationName: string | null
) => {
  if (!familyRelationName) {
    if (rankTypeID == 1) {
      return "مدني";
    }
    return rankName;
  }
  // Get first letter of familyRelationName
  const prefix = familyRelationName.charAt(0);
  return `${prefix} - ${rankName}`;
};
export class PatientHistoryController {
  // Helper method to update section occupancy
  private static async updateSectionOccupancy(
    tx: any,
    sectionId: number | null,
    rankId: number,
    increment: boolean,
    familyRelation: number | null
  ) {
    if (!sectionId) {
      throw new Error("Invalid section ID");
    }

    const modifier = increment ? 1 : -1;

    // Get current section occupancy
    const [section] = await tx
      .select()
      .from(sectionsOccupancy)
      .where(eq(sectionsOccupancy.secID, sectionId));

    // Get rank type
    const [rType] = await db
      .select({
        id: rankType.id,
      })
      .from(ranks)
      .where(eq(ranks.id, rankId))
      .innerJoin(rankType, eq(ranks.typeID, rankType.id));

    if (!section) {
      throw new Error("Section not found");
    }

    // Determine which column to update based on rankId
    let updateFields: Record<string, any> = {
      patients: sql`patients + ${modifier}`,
    };

    // rankId mapping based on your patient_ranks table
    if (familyRelation) {
      switch (rType.id) {
        case 2: // درجات عائلات
          updateFields.familyranks = sql`familyranks + ${modifier}`;
          break;
        case 3: //Officers Family
          updateFields.officersfamily = sql`officersfamily + ${modifier}`;
          break;
      }
    } else {
      switch (rType.id) {
        case 3: // Officer
          updateFields.officers = sql`officers + ${modifier}`;
          break;
        case 2: // Ranks
          updateFields.ranks = sql`ranks + ${modifier}`;
          break;
        case 1: // Civilian
          updateFields.civilian = sql`civilian + ${modifier}`;
          break;
        default:
          throw new Error("Invalid rank ID");
      }
    }

    // Update the section occupancy
    await tx
      .update(sectionsOccupancy)
      .set(updateFields)
      .where(eq(sectionsOccupancy.secID, sectionId));
  }

  static async admitPatient(data: AdmissionType, uID: number, set: any) {
    try {
      return await db.transaction(async (tx) => {
        // Check if patient already exists
        const existingPatient = await tx
          .select()
          .from(patients)
          .where(eq(patients.pNum, String(data.pNum)))
          .limit(1);

        let patientId: number;

        if (existingPatient.length > 0) {
          // Patient exists, check if they have an active admission
          const activeHistory = await tx
            .select()
            .from(patientsHistory)
            .where(
              and(
                eq(patientsHistory.pID, existingPatient[0].pID),
                sql`exitDate IS NULL`
              )
            )
            .limit(1);

          if (activeHistory.length > 0) {
            set.status = 400;
            return {
              success: false,
              error: "Patient is already admitted to the hospital",
            };
          }

          patientId = existingPatient[0].pID;
        } else {
          // Create new patient record
          const [newPatient] = await tx
            .insert(patients)
            .values({
              pNum: String(data.pNum),
              rankID: data.rank,
              fullName: data.fullName,
              unit: data.unit ?? "", // Ensure string type
              host: data.host ?? null,
              ByUser: uID,
              familyRelation: data.familyRelation ?? null,
              dateCreated: new Date(), // Use Date object instead of SQL
            })
            .returning();

          patientId = newPatient.pID;
        }

        // Create patient history record
        const [newHistory] = await tx
          .insert(patientsHistory)
          .values({
            pID: patientId,
            Diagnoses: data.Diagnoses,
            entryDate: data.entryDate,
            nutrition: data.nutrition,
            section: data.section,
            room: data.room,
            action: 1, // Admission action ID
            ByUser: uID,
          })
          .returning();

        // Update section occupancy
        await this.updateSectionOccupancy(
          tx,
          data.section,
          data.rank,
          true,
          data.familyRelation
        );

        return {
          success: true,
          data: {
            history: newHistory,
            patientId: patientId,
            message:
              existingPatient.length > 0
                ? "Existing patient readmitted"
                : "New patient admitted",
          },
        };
      });
    } catch (error) {
      return {
        success: false,
        error: "Failed to admit patient",
        details: error,
      };
    }
  }

  static async transferPatient(data: TransferType, uID: number) {
    try {
      return await db.transaction(async (tx) => {
        // Check if patient has an active admission
        const [activeHistory] = await tx
          .select()
          .from(patientsHistory)
          .where(and(eq(patientsHistory.pID, data.pID), sql`exitDate IS NULL`))
          .limit(1);

        if (!activeHistory) {
          return {
            success: false,
            error: "Patient is not currently admitted to the hospital",
          };
        }

        // Get patient details to know their rankID
        const [patient] = await tx
          .select()
          .from(patients)
          .where(eq(patients.pID, data.pID));

        if (!patient) {
          throw new Error("Patient not found");
        }

        // Get current section from the most recent history record
        const [currentHistory] = await tx
          .select()
          .from(patientsHistory)
          .where(eq(patientsHistory.pID, data.pID))
          .orderBy(sql`datecreated DESC`)
          .limit(1);

        if (!currentHistory?.section) {
          throw new Error("Invalid section data");
        }

        // Get patient details
        if (!currentHistory.pID) {
          throw new Error("Invalid patient ID");
        }

        const [patientDetails] = await tx
          .select()
          .from(patients)
          .where(eq(patients.pID, currentHistory.pID));

        if (!patientDetails) {
          throw new Error("Patient not found");
        }

        // 1. Decrement old section occupancy
        await this.updateSectionOccupancy(
          tx,
          currentHistory.section, // Now guaranteed to be non-null
          patientDetails.rankID,
          false,
          patientDetails.familyRelation
        );

        // 2. Increment new section occupancy
        await this.updateSectionOccupancy(
          tx,
          data.newSection,
          patientDetails.rankID,
          true,
          patientDetails.familyRelation
        );

        // 3. Update current history record with exit date
        await tx
          .update(patientsHistory)
          .set({ exitDate: sql`CURRENT_TIMESTAMP` })
          .where(eq(patientsHistory.pID, data.pID));

        // 4. Create new history record for transfer
        await tx.insert(patientsHistory).values({
          pID: data.pID,
          Diagnoses: currentHistory.Diagnoses,
          entryDate: currentHistory.entryDate,
          section: data.newSection,
          nutrition: currentHistory.nutrition,
          room: currentHistory.room,
          action: 2, // Transfer action ID
          ByUser: uID,
        });

        return { success: true, message: "Patient transferred successfully" };
      });
    } catch (error) {
      return { success: false, error: "Failed to transfer patient" };
    }
  }

  static async exitPatient(data: ExitType, uID: number) {
    try {
      return await db.transaction(async (tx) => {
        // Check if patient has an active admission
        const [activeHistory] = await tx
          .select()
          .from(patientsHistory)
          .where(and(eq(patientsHistory.pID, data.pID), sql`exitDate IS NULL`))
          .limit(1);

        if (!activeHistory) {
          return {
            success: false,
            error: "Patient is not currently admitted to the hospital",
          };
        }

        // Verify the phID matches the active history
        if (activeHistory.phID !== data.phID) {
          return {
            success: false,
            error: "Invalid patient history record",
          };
        }

        // Get patient details to know their rankID
        const [patient] = await tx
          .select()
          .from(patients)
          .where(eq(patients.pID, data.pID));

        if (!patient) {
          throw new Error("Patient not found");
        }

        // Get current section from the most recent history record
        const [currentHistory] = await tx
          .select()
          .from(patientsHistory)
          .where(eq(patientsHistory.pID, data.pID))
          .orderBy(sql`datecreated DESC`)
          .limit(1);

        // 1. Decrement section occupancy
        await this.updateSectionOccupancy(
          tx,
          currentHistory.section,
          patient.rankID,
          false,
          patient.familyRelation
        );

        // 2. Update current history record with exit date
        await tx
          .update(patientsHistory)
          .set({
            exitDate: data.exitDate,
            action: 4, // Exit action ID
            ByUser: uID,
          })
          .where(eq(patientsHistory.phID, data.phID));

        return { success: true, message: "Patient exited successfully" };
      });
    } catch (error) {
      return { success: false, error: "Failed to exit patient" };
    }
  }

  static async changeNutrition(data: ChangeNutritionType, uID: number) {
    try {
      return await db.transaction(async (tx) => {
        // Check if patient has an active admission
        const [activeHistory] = await tx
          .select()
          .from(patientsHistory)
          .where(and(eq(patientsHistory.pID, data.pID), sql`exitDate IS NULL`))
          .limit(1);

        if (!activeHistory) {
          return {
            success: false,
            error: "Patient is not currently admitted to the hospital",
          };
        }

        // Update current history record with exit date
        await tx
          .update(patientsHistory)
          .set({ exitDate: sql`CURRENT_TIMESTAMP` })
          .where(eq(patientsHistory.phID, activeHistory.phID));

        // Create new history record with new nutrition
        await tx.insert(patientsHistory).values({
          pID: activeHistory.pID,
          Diagnoses: activeHistory.Diagnoses,
          entryDate: activeHistory.entryDate,
          nutrition: data.nutrition,
          section: activeHistory.section,
          action: 3, // Change nutrition action ID
          ByUser: uID,
          room: activeHistory.room,
        });

        return {
          success: true,
          message: "Patient nutrition changed successfully",
        };
      });
    } catch (error) {
      return { success: false, error: "Failed to change patient nutrition" };
    }
  }

  static async addEscortController(data: addEscortType, id: number) {
    try {
      const addEscort = await db
        .update(sectionsOccupancy)
        .set(data)
        .where(eq(sectionsOccupancy.secID, id))
        .returning();

      if (!addEscort.length) {
        return { success: false, error: "section not found" };
      }

      return { success: true, data: addEscort[0] };
    } catch (error) {
      return { success: false, error: "Failed to update rank" };
    }
  }

  static async changeRoom(data: changeRoomType, uID: number) {
    try {
      return await db.transaction(async (tx) => {
        // Check if patient has an active admission
        const [activeHistory] = await tx
          .select()
          .from(patientsHistory)
          .where(and(eq(patientsHistory.pID, data.pID), sql`exitDate IS NULL`))
          .limit(1);

        if (!activeHistory) {
          return {
            success: false,
            error: "Patient is not currently admitted to the hospital",
          };
        }

        // Update current history record with exit date
        await tx
          .update(patientsHistory)
          .set({ exitDate: sql`CURRENT_TIMESTAMP` })
          .where(eq(patientsHistory.phID, activeHistory.phID));

        // Create new history record with new nutrition
        await tx.insert(patientsHistory).values({
          pID: activeHistory.pID,
          Diagnoses: activeHistory.Diagnoses,
          entryDate: sql`CURRENT_TIMESTAMP`,
          nutrition: activeHistory.nutrition,
          room: data.room,
          section: activeHistory.section,
          action: 3, // Change nutrition action ID
          ByUser: uID,
        });

        return {
          success: true,
          message: "Patient nutrition changed successfully",
        };
      });
    } catch (error) {
      return { success: false, error: "Failed to change patient nutrition" };
    }
  }

  static async getActivePatientsBySection() {
    try {
      const activePatients = await db
        .select({
          // Section Data (Start from here to include all sections)
          sectionId: sectionsOccupancy.secID,
          sectionName: sectionsOccupancy.secName,
          escorts: sectionsOccupancy.escorts,
          totalCapacity: sectionsOccupancy.totalCapacity,
          hasRoom: sectionsOccupancy.hasRoom,
          hasNutrition: sectionsOccupancy.hasNutrition,
          underConstruction: sectionsOccupancy.underConstruction,

          // Patient History Data
          phID: patientsHistory.phID,
          entryDate: patientsHistory.entryDate,
          diagnoses: patientsHistory.Diagnoses,
          room: patientsHistory.room,
          familyRelationID: patients.familyRelation,
          familyRelationName: rankFamily.name,

          // Patient Data
          patientId: patients.pID,
          patientNumber: patients.pNum,
          fullName: patients.fullName,
          unit: patients.unit,
          host: patients.host,

          // Rank Data
          rankId: ranks.id,
          rankName: ranks.name,
          rankTypeID: rankType.id,
          rankTypeName: rankType.name,

          // Nutrition Data
          nutritionId: nutritions.nID,
          nutritionName: nutritions.nName,
        })
        .from(sectionsOccupancy) // Start from sectionsOccupancy
        .leftJoin(
          patientsHistory,
          and(
            eq(patientsHistory.section, sectionsOccupancy.secID),
            sql`${patientsHistory.exitDate} IS NULL`
          )
        ) // LEFT JOIN to include empty sections
        .leftJoin(patients, eq(patientsHistory.pID, patients.pID))
        .leftJoin(ranks, eq(patients.rankID, ranks.id))
        .leftJoin(rankFamily, eq(patients.familyRelation, rankFamily.id))
        .leftJoin(rankType, eq(ranks.typeID, rankType.id))
        .leftJoin(nutritions, eq(patientsHistory.nutrition, nutritions.nID))
        .orderBy(sectionsOccupancy.order, patientsHistory.entryDate);

      // Group patients by section for better organization
      const patientsBySection = activePatients.reduce(
        (acc, patient) => {
          const section = acc.find((s) => s.sectionId === patient.sectionId);
          const patientData = {
            sectionId: patient.sectionId,
            sectionName: patient.sectionName,
            phID: patient.phID,
            patientId: patient.patientId,
            patientNumber: patient.patientNumber,
            fullName: patient.fullName,
            entryDate: patient.entryDate,
            diagnoses: patient.diagnoses,
            room: patient.room,
            unit: patient.unit,
            host: patient.host,
            rank: {
              id: patient.rankId,
              name: patient.rankName,
              rankTypeID: patient.rankTypeID,
              rankTypeName: patient.rankTypeName,
              familyRelationID: patient.familyRelationID,
              familyRelationName: patient.familyRelationName,
              realRankName: getFormattedKey(
                patient.rankName,
                patient.rankTypeID,
                patient.familyRelationName
              ),
            },
            sectionHasRoom: patient.hasRoom,
            sectionHasNutrition: patient.hasNutrition,
            nutrition: patient.nutritionId
              ? {
                  id: patient.nutritionId,
                  name: patient.nutritionName,
                }
              : null,
          };

          if (section) {
            if (patient.totalCapacity !== 1111) {
              section.patients.push(patientData);
            }
          } else {
            if (patient.totalCapacity !== 1111) {
              acc.push({
                sectionId: patient.sectionId,
                sectionName: patient.sectionName,
                sectionEscorts: patient.escorts,
                hasRoom: patient.hasRoom,
                hasNutrition: patient.hasNutrition,
                underConstruction: patient.underConstruction,
                patients: [patientData],
              });
            }
          }

          return acc;
        },
        [] as Array<{
          sectionId: number | null;
          sectionName: string | null;
          sectionEscorts: number | null;
          hasRoom: boolean | null;
          hasNutrition: boolean | null;
          underConstruction: boolean | null;
          patients: Array<any>;
        }>
      );

      return {
        success: true,
        data: patientsBySection,
      };
    } catch (error) {
      return { success: false, error: error };
    }
  }

  static async getHistory(filters: HistoryFilterType) {
    try {
      const itemsPerPage = 25;
      const offset = (filters.page - 1) * itemsPerPage;

      // Initialize whereConditions with the correct type
      const whereConditions: SQL[] = [];

      if (filters.activeOnly) {
        whereConditions.push(sql`${patientsHistory.exitDate} IS NULL`);
      }

      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        whereConditions.push(
          sql`(${patients.fullName} ILIKE ${searchTerm} OR 
              ${patients.pNum} ILIKE ${searchTerm} OR
              ${sectionsOccupancy.secName} ILIKE ${searchTerm} OR
              ${users.uName} ILIKE ${searchTerm} OR
              ${patientsHistory.Diagnoses} ILIKE ${searchTerm})`
        );
      }

      if (filters.startDate) {
        whereConditions.push(
          sql`${patientsHistory.dateCreated} >= ${filters.startDate}`
        );
      }

      if (filters.endDate) {
        whereConditions.push(
          sql`${patientsHistory.dateCreated} <= ${filters.endDate}`
        );
      }

      if (filters.sectionId) {
        whereConditions.push(eq(patientsHistory.section, filters.sectionId));
      }

      if (filters.actionType) {
        whereConditions.push(eq(patientsHistory.action, filters.actionType));
      }

      // Build base query
      const baseQuery = db
        .select({
          // History Data
          patientID: patientsHistory.pID,
          phID: patientsHistory.phID,
          entryDate: patientsHistory.entryDate,
          dateCreated: patientsHistory.dateCreated,

          // Patient Data
          patientName: patients.fullName,
          patientNumber: patients.pNum,

          // Section Data
          sectionName: sectionsOccupancy.secName,

          // Action Data
          actionID: actions.aID,
          actionType: actions.Type,

          // User Data
          userName: users.uName,

          // Additional context data
          diagnoses: patientsHistory.Diagnoses,
          room: patientsHistory.room,
          nutritionName: nutritions.nName,
          rankName: ranks.name,
          familyRelationName: rankFamily.name,
        })
        .from(patientsHistory)
        .innerJoin(patients, eq(patientsHistory.pID, patients.pID))
        .innerJoin(
          sectionsOccupancy,
          eq(patientsHistory.section, sectionsOccupancy.secID)
        )
        .innerJoin(actions, eq(patientsHistory.action, actions.aID))
        .innerJoin(users, eq(patientsHistory.ByUser, users.uID))
        .leftJoin(ranks, eq(patients.rankID, ranks.id))
        .leftJoin(rankFamily, eq(patients.familyRelation, rankFamily.id))
        .leftJoin(nutritions, eq(patientsHistory.nutrition, nutritions.nID));

      // Apply filters
      const query =
        whereConditions.length > 0
          ? baseQuery.where(and(...whereConditions))
          : baseQuery;

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(query.as("filtered_history"));

      // Get paginated results with previous records for comparison
      const records = await query
        .orderBy(desc(patientsHistory.dateCreated))
        .limit(itemsPerPage)
        .offset(offset);

      // Format records
      const formattedRecords = await Promise.all(
        records.map(async (record) => {
          // Get previous record for this patient
          const [previousRecord] = await db
            .select({
              nutrition: nutritions.nName,
              section: sectionsOccupancy.secName,
              room: patientsHistory.room,
              diagnoses: patientsHistory.Diagnoses,
            })
            .from(patientsHistory)
            .innerJoin(
              nutritions,
              eq(patientsHistory.nutrition, nutritions.nID)
            )
            .innerJoin(
              sectionsOccupancy,
              eq(patientsHistory.section, sectionsOccupancy.secID)
            )
            .where(
              and(
                sql`${patientsHistory.pID} = ${record.patientID}`,
                eq(
                  patientsHistory.phID,
                  sql`(
                  SELECT ph2.phID 
                  FROM patients_history ph2 
                  WHERE ph2.pID = ${record.patientID} 
                  AND ph2.phID < ${record.phID}
                  ORDER BY ph2.phID DESC 
                  LIMIT 1
                )`
                )
              )
            );

          // Build main description
          let description = `قام "${record.userName}" `;
          let changes: string[] = [];

          switch (record.actionID) {
            case 1:
              // description += `اضاف حالة "${record.patientName}" الى "${record.sectionName}"`;
              description += `باضافة "${record.patientName}" الي قسم "${record.sectionName}"`;
              // changes.push(`اضافة جديدة الي قسم "${record.sectionName}"`);
              break;
            case 2:
              description += `بنقل حالة "${record.patientName}" الى قسم "${record.sectionName}"`;
              // if (previousRecord) {
              //   changes.push(
              //     `نقل الحالة من قسم ${previousRecord.section} الى "${record.sectionName}"`
              //   );
              // }
              break;
            case 4:
              description += `بإخراج حالة "${record.patientName}" من قسم "${record.sectionName}"`;
              // changes.push(`خرج حالة من "${record.sectionName}"`);
              break;
            case 3:
              description += `بتغير التغذية لدى "${record.patientName}" إلي ${record.nutritionName}`;
              // if (previousRecord) {
              //   changes.push(
              //     `غير التغذية من ${
              //       previousRecord.nutrition == null
              //         ? "-"
              //         : previousRecord.nutrition
              //     } الى ${record.nutritionName}`
              //   );
              // }
              break;
            case 5:
              description += `بتغير تفاصيل الاقامة لدى "${record.patientName}"`;
              if (previousRecord) {
                if (record.nutritionName !== previousRecord.nutrition) {
                  changes.push(
                    `غير التغذية من ${
                      previousRecord.nutrition == null
                        ? "-"
                        : previousRecord.nutrition
                    } الى ${record.nutritionName}`
                  );
                }
                if (record.sectionName !== previousRecord.section) {
                  changes.push(
                    `نقل الحالة من قسم ${previousRecord.section} الى "${record.sectionName}"`
                  );
                }
              }

              break;
            default:
              description += `${record.actionType.toLowerCase()} ${
                record.patientName
              }`;
          }

          // Add additional changes
          if (previousRecord) {
            if (record.room !== previousRecord.room) {
              changes.push(
                `غير الغرفة من ${
                  previousRecord.room == null ? "-" : previousRecord.room
                } الى ${record.room}`
              );
            }
            if (record.diagnoses !== previousRecord.diagnoses) {
              changes.push(
                `غير التشخيص من ${previousRecord.diagnoses} الى ${record.diagnoses}`
              );
            }
          }

          return {
            id: record.phID,
            description,
            changes,
            date: record.dateCreated,
            username: record.userName,
            action: record.actionType,

            // details: {
            //   patient: {
            //     name: record.patientName,
            //     number: record.patientNumber,
            //     rank: record.rankName,
            //     familyRelation: record.familyRelationName,
            //   },
            //   section: record.sectionName,
            //   diagnoses: record.diagnoses,
            //   room: record.room,
            //   nutrition: record.nutritionName,
            //   user: record.userName,
            // },
          };
        })
      );

      return {
        success: true,
        data: formattedRecords,
        pagination: {
          currentPage: filters.page,
          totalPages: Math.ceil(count / itemsPerPage),
          totalRecords: Number(count),
          hasMore: count > filters.page * itemsPerPage,
        },
      };
    } catch (error) {
      console.error("Error in getHistory:", error);
      return { success: false, error: "Failed to fetch history" };
    }
  }

  static async editAdmission(data: EditAdmissionType, uID: number, set: any) {
    try {
      return await db.transaction(async (tx) => {
        // Get current patient history
        const [currentHistory] = await tx
          .select()
          .from(patientsHistory)
          .where(
            and(eq(patientsHistory.phID, data.phID), sql`exitDate IS NULL`)
          )
          .limit(1);

        if (!currentHistory) {
          set.status = 404;
          return {
            success: false,
            error: "Active admission record not found",
          };
        }

        // Get patient details
        if (!currentHistory.pID) {
          throw new Error("Invalid patient ID");
        }

        const [patient] = await tx
          .select()
          .from(patients)
          .where(eq(patients.pID, currentHistory.pID));

        if (!patient) {
          throw new Error("Patient not found");
        } else if (data.rank) {
          if (
            data.rank !== patient.rankID ||
            data.familyRelation !== patient.familyRelation
          ) {
            // Decrement old section
            await this.updateSectionOccupancy(
              tx,
              currentHistory.section,
              patient.rankID,
              false,
              patient.familyRelation
            );

            // Increment new section
            await this.updateSectionOccupancy(
              tx,
              currentHistory.section,
              data.rank,
              true,
              data.familyRelation ?? 0
            );
          }
        }

        // Update patient record if needed
        if (
          data.fullName ||
          data.unit ||
          data.host ||
          data.rank ||
          data.familyRelation ||
          data.pNum
        ) {
          let editFamilyRelation =
            data.familyRelation ?? patient.familyRelation;
          if (
            patient.familyRelation &&
            (data.patientType == "مدني" ||
              data.patientType == "درجات" ||
              data.patientType == "ظباط")
          ) {
            editFamilyRelation = null;
          }
          let editHost = data.host ?? patient.host;
          if (patient.familyRelation && data.patientType == "مدني") {
            editHost = null;
          }
          await tx
            .update(patients)
            .set({
              pNum: String(data.pNum) || patient.pNum,
              rankID: data.rank || patient.rankID,
              familyRelation: editFamilyRelation,
              fullName: data.fullName || patient.fullName,
              unit: data.unit || patient.unit,
              host: editHost,
            })
            .where(eq(patients.pID, currentHistory.pID));
        }

        // Check if section is changing
        if (data.section && data.section !== currentHistory.section) {
          // Decrement old section
          await this.updateSectionOccupancy(
            tx,
            currentHistory.section,
            patient.rankID,
            false,
            patient.familyRelation
          );

          // Increment new section
          await this.updateSectionOccupancy(
            tx,
            data.section,
            patient.rankID,
            true,
            patient.familyRelation
          );
        }
        // Update history record
        // const [updatedHistory] = await tx
        //   .update(patientsHistory)
        //   .set({
        //     entryDate: data.entryDate || currentHistory.entryDate,
        //     Diagnoses: data.Diagnoses || currentHistory.Diagnoses,
        //     nutrition: data.nutrition || currentHistory.nutrition,
        //     section: data.section || currentHistory.section,
        //     room: data.room || currentHistory.room,
        //     ByUser: uID,
        //   })
        //   .where(eq(patientsHistory.phID, data.phID))
        //   .returning();

        // 3. Update current history record with exit date
        await tx
          .update(patientsHistory)
          .set({ exitDate: sql`CURRENT_TIMESTAMP` })
          .where(eq(patientsHistory.pID, data.pID));

        const [updatedHistory] = await tx
          .insert(patientsHistory)
          .values({
            pID: data.pID,
            entryDate: data.entryDate || currentHistory.entryDate,
            Diagnoses: data.Diagnoses || currentHistory.Diagnoses,
            nutrition: data.nutrition || currentHistory.nutrition,
            section: data.section || currentHistory.section,
            room: data.room || currentHistory.room,
            action: 5,
            ByUser: uID,
          })
          .returning();

        return {
          success: true,
          data: {
            history: updatedHistory,
            message: "Admission updated successfully",
          },
        };
      });
    } catch (error) {
      return {
        success: false,
        error: "Failed to update admission",
        details: error,
      };
    }
  }

  // Get deleted records
  static async getDeletedRecords(page: number = 1) {
    try {
      const itemsPerPage = 25;
      const offset = (page - 1) * itemsPerPage;

      const baseQuery = db
        .select({
          pID: patientsHistory.pID,
          phID: patientsHistory.phID,
          patientName: patients.fullName,
          patientNumber: patients.pNum,
          sectionName: sectionsOccupancy.secName,
          exitDate: patientsHistory.exitDate,
          dateCreated: patientsHistory.dateCreated,
          deletedBy: users.uName,
          rankName: ranks.name,
          familyRelationName: rankFamily.name,
        })
        .from(patientsHistory)
        .innerJoin(patients, eq(patientsHistory.pID, patients.pID))
        .innerJoin(
          sectionsOccupancy,
          eq(patientsHistory.section, sectionsOccupancy.secID)
        )
        .innerJoin(users, eq(patientsHistory.ByUser, users.uID))
        .leftJoin(ranks, eq(patients.rankID, ranks.id))
        .leftJoin(rankFamily, eq(patients.familyRelation, rankFamily.id))
        .where(sql`${patientsHistory.exitDate} IS NOT NULL`)
        .orderBy(desc(patientsHistory.dateCreated));

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(baseQuery.as("deleted_records"));

      // Get paginated results
      const records = await baseQuery.limit(itemsPerPage).offset(offset);

      return {
        success: true,
        data: {
          records,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(count / itemsPerPage),
            totalRecords: count,
            hasMore: count > page * itemsPerPage,
          },
        },
      };
    } catch (error) {
      console.error("Error in getDeletedRecords:", error);
      return { success: false, error: "Failed to fetch deleted records" };
    }
  }
  // Restore deleted record
  static async restoreRecord(data: RestoreType, uID: number) {
    try {
      return await db.transaction(async (tx) => {
        // Get the record to restore
        const [record] = await tx
          .select({
            phID: patientsHistory.phID,
            section: patientsHistory.section,
            exitDate: patientsHistory.exitDate,
            rankID: patients.rankID,
            familyRelation: patients.familyRelation,
          })
          .from(patientsHistory)
          .innerJoin(patients, eq(patientsHistory.pID, patients.pID))
          .where(eq(patientsHistory.phID, data.phID));

        if (!record) {
          return { success: false, error: "Record not found" };
        }

        if (!record.exitDate) {
          return { success: false, error: "Record is not deleted" };
        }

        // Update the record
        const [restored] = await tx
          .update(patientsHistory)
          .set({
            exitDate: null,
            ByUser: uID,
          })
          .where(eq(patientsHistory.phID, data.phID))
          .returning();

        // Update section occupancy
        await this.updateSectionOccupancy(
          tx,
          record.section,
          record.rankID,
          true,
          record.familyRelation
        );

        return {
          success: true,
          message: "Record restored successfully",
        };
      });
    } catch (error) {
      console.error("Error in restoreRecord:", error);
      return { success: false, error: "Failed to restore record" };
    }
  }
}
