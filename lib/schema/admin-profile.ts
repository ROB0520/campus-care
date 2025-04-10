import { z } from "zod";

export const adminProfileSchema = z.object({
	firstName: z.string().min(1, { message: "First name is required" }),
	lastName: z.string().min(1, { message: "Last name is required" }),
	middleName: z.string().optional(),
});

export type AdminProfileSchema = z.infer<typeof adminProfileSchema>;