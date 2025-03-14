import { z } from "zod";

export const historyFilterSchema = z.object({
  page: z.number().min(1).default(1),
  activeOnly: z.boolean().default(false),
  search: z.string().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  sectionId: z.number().optional(),
  actionType: z.number().optional(),
});

export type HistoryFilterType = z.infer<typeof historyFilterSchema>;
