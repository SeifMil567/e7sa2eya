import { z } from "zod";

export const CreateRankSchema = z.object({
  name: z.string().min(1),
  typeID: z.number().min(1)
});

export const CreateRankTypesSchema = z.object({
  name: z.string().min(1)
});

export type CreateRankType = z.infer<typeof CreateRankSchema>;
export type CreateRankTypesType = z.infer<typeof CreateRankTypesSchema>;
