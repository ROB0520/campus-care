import { z } from "zod";

export const clinicProfileSchema = z.object({
	firstName: z.string().min(1, { message: "First name is required" }),
	lastName: z.string().min(1, { message: "Last name is required" }),
	middleName: z.string().optional(),
});

export type ClinicProfileSchema = z.infer<typeof clinicProfileSchema>;