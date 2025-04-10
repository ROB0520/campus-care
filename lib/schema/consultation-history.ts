import { z } from "zod";

export const consultationHistorySchema = z.object({
	id: z.number().int(),
	userId: z.number().int(),
	attendingPersonnel: z.number().int(),
	reason: z.string(),
	diagnosis: z.string(),
	medication: z.string(),
	remarks: z.string().optional(),
	consultationTimestamp: z.number().int(),
});

export type ConsulationHistorySchema = z.infer<typeof consultationHistorySchema>;