import { z } from "zod";

export const CreateSectionSchema = z.object({
  secName: z.string().min(1),
  totalCapacity: z.number().min(1),
  officers: z.number(),
  officersfamily: z.number(),
  ranks: z.number(),
  familyranks: z.number(),
  civilian: z.number(),
  patients: z.number(),
  escorts: z.number(),
  availableBeds: z.number(),
  sectionGroupID: z.number().min(1),
  hasRoom: z.boolean(),
  hasNutrition: z.boolean(),
  underConstruction: z.boolean(),
  order: z.number(),
});

export const CreateSectionGroupSchema = z.object({
  groupName: z.string().min(1),
});

export type CreateSectionType = z.infer<typeof CreateSectionSchema>;
export type CreateSectionGroupType = z.infer<typeof CreateSectionGroupSchema>;
