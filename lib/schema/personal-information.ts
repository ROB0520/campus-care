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
	email: z.string().email("Invalid email address"),
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
	
	student_id: z.string(),
	course_year: z.string(),
	designation: z.string(),

	em_first_name: z.string().min(1, "First name is required"),
	em_last_name: z.string().min(1, "Last name is required"),
	em_address: z.string().min(1, "Address is required"),
	em_phone_number: z.string().min(1, "Phone number is required"),
	em_email: z.string().email("Invalid email address"),
});

export type PersonalInformationSchema = z.infer<typeof personalInformationSchema>;