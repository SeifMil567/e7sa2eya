import { z } from "zod";

export const CreateNutritionSchema = z.object({
  nname: z.string().min(1),
});

export type CreateNutritionType = z.infer<typeof CreateNutritionSchema>;
