import { z } from "zod";

export const CreateSupervisorSchema = z.object({
  name: z.string().min(1),
  rank: z.number().min(1),
});

export type CreateSupervisorType = z.infer<typeof CreateSupervisorSchema>;
