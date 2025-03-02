import { z } from "zod";

export const CreateUserSchema = z.object({
  uName: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  milNum: z.string().min(1),
  activ: z.number().min(1),
  adminLevel: z.number().min(1),
});

export type CreateUserType = z.infer<typeof CreateUserSchema>;
