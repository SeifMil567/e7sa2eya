import { z } from "zod";

export const ComputerInfoSchema = z.object({
  device_ip: z.string().min(1),
  device_type: z.string().min(1),
  device_serial: z.string().min(1),
  device_location: z.string().min(1),
  device_name: z.string().min(1),
});

export type ComputerInfoType = z.infer<typeof ComputerInfoSchema>;
