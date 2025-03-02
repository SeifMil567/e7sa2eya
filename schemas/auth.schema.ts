import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  uName: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(6),
  milNum: z.string().optional(),
  ByUser: z.number(),
});

export type LoginType = z.infer<typeof loginSchema>;
export type RegisterType = z.infer<typeof registerSchema>;
