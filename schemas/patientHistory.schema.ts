import { z } from "zod";

// Base patient schema
const basePatientSchema = z.object({
  pNum: z.number(),
  rank: z.number(),
  familyRelation: z.number().nullable(),
  fullName: z.string(),
  unit: z.string().optional().nullable(),
  Diagnoses: z.string(),
  host: z.string().optional().nullable(),
  entryDate: z.string().date(),
});

// Admission schema
export const admissionSchema = basePatientSchema
  .extend({
    nutrition: z.number().optional().nullable(),
    section: z.number(),
    room: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.familyRelation) {
        return data.host;
      }
      return true;
    },
    {
      message: "Family ranks require a host and unit must be 'FAMILY'",
    }
  );

// Transfer schema
export const transferSchema = z.object({
  pID: z.number(),
  phID: z.number(),
  newSection: z.number(),
});

// Exit schema
export const exitSchema = z.object({
  phID: z.number(),
  pID: z.number(),
  exitDate: z.string().date(),
});

// Change nutrition schema
export const changeNutritionSchema = z.object({
  pID: z.number(),
  phID: z.number(),
  nutrition: z.number(),
});

// Add Escort schema
export const addEscortSchema = z.object({
  escorts: z.number().min(0),
});

//change room schema
export const changeRoomSchema = z.object({
  pID: z.number(),
  phID: z.number(),
  room: z.string(),
});

// Edit admission schema
export const editAdmissionSchema = basePatientSchema
  .extend({
    phID: z.number().min(1),
    pID: z.number().min(1),
    nutrition: z.number().optional().nullable(),
    section: z.number().optional(),
    room: z.string().optional().nullable(),
    patientType: z.string().optional(),
  })
  .partial()
  .required({ phID: true, pID: true })
  .refine(
    (data) => {
      if (data.unit === "FAMILY") {
        return data.host != null;
      }
      return true;
    },
    {
      message: "Family unit requires a host",
    }
  );

// Add restore schema
export const restoreSchema = z.object({
  phID: z.number().min(1),
  pID: z.number().min(1),
});

export type RestoreType = z.infer<typeof restoreSchema>;
export type AdmissionType = z.infer<typeof admissionSchema>;
export type TransferType = z.infer<typeof transferSchema>;
export type ExitType = z.infer<typeof exitSchema>;
export type ChangeNutritionType = z.infer<typeof changeNutritionSchema>;
export type changeRoomType = z.infer<typeof changeRoomSchema>;
export type addEscortType = z.infer<typeof addEscortSchema>;
export type EditAdmissionType = z.infer<typeof editAdmissionSchema>;
