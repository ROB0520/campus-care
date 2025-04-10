import { z } from "zod";

export const appointmentSchema = z.object({
	appointmentTimestamp: z.date(),
	status: z.enum(['pending', 'approved', 'cancelled', 'completed']),
});

export type AppointmentSchema = z.infer<typeof appointmentSchema>;