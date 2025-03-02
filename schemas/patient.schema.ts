import { z } from "zod";

export const createPatientSchema = z.object({
  // pID: z.number().min(1),
  pNum: z.string().min(1),
  fullName: z.string().min(1),
  rank: z.string().min(1),
  unit: z.string().min(1),
  host: z.string().optional(),
  ByUser: z.string().min(1),
  // dateCreated: z.string().optional(),
});

export type CreatePatientType = z.infer<typeof createPatientSchema>;
