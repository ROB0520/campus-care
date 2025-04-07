import { z } from "zod";

export const userSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
	confirmPassword: z.string().min(8, "Password must be at least 8 characters long"),
	role: z.enum(['0', '1']),
});

export type UserSchema = z.infer<typeof userSchema>;