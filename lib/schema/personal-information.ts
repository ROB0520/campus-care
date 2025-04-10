import { z } from "zod";

export const personalInformationSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	middleName: z.string().optional(),
	lastName: z.string().min(1, "Last name is required"),
	sex: z.enum(["male", "female"]),
	dateOfBirth: z.date().refine((date) => date <= new Date(), {
		message: "Date of birth must be in the past",
	}),
	address: z.string().min(1, "Address is required"),
	contactNumber: z.string().min(1, "Contact number is required"),
	height: z.number({
		required_error: "Height is required",
	}).min(1, "Height is required"),
	weight: z.number({
		required_error: "Weight is required",
	}).min(1, "Weight is required"),
	bloodType: z.enum([
		'A+',
		'A-',
		'B+',
		'B-',
		'AB+',
		'AB-',
		'O+',
		'O-',
	], {
		required_error: "Blood type is required",
	}).optional(),
	isPWD: z.boolean().optional(),
	pwdCategory: z.enum([
		'physical',
		'visual',
		'hearing',
		'mental',
		'intellectual',
	]).optional(),
	pwdID: z.string().optional(),
	
	studentId: z.string(),
	courseYearSection: z.string(),
	designation: z.string(),

	emFirstName: z.string().min(1, "First name is required"),
	emLastName: z.string().min(1, "Last name is required"),
	emAddress: z.string().min(1, "Address is required"),
	emPhoneNumber: z.string().min(1, "Phone number is required"),
	emEmail: z.string().email("Invalid email address"),
});

export type PersonalInformationSchema = z.infer<typeof personalInformationSchema>;