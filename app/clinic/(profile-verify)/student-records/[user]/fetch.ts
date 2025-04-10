"use server"

import { createConnection } from "@/lib/db"
import { z } from "zod";
import { userSchema as userFormSchema } from "@/lib/schema/user";
import { personalInformationSchema } from "@/lib/schema/personal-information";
import { healthSurveySchema } from "@/lib/schema/health-survey";
import { appointmentSchema } from "@/lib/schema/appointment";
import mysql from "mysql2/promise";

const UserSchema = userFormSchema
	.omit({ password: true, confirmPassword: true })
	.extend({
		...personalInformationSchema.shape,
		...healthSurveySchema.shape,
		appointments: z.array(
			appointmentSchema.extend({
				appointmentId: z.number().optional(),
			})
		).optional(),
		isLocked: z.boolean(),
	});

export type UserSchema = z.infer<typeof UserSchema>;

export async function fetchUser(userId: number): Promise<UserSchema & { hasPersonalInfo: boolean; hasMedicalSurvey: boolean }> {
	const connection = await createConnection()
	
	const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
		`SELECT 
			u.email,
			u.isLocked,
			pi.firstName,
			pi.middleName,
			pi.lastName,
			pi.sex,
			pi.dateOfBirth,
			pi.address,
			pi.contactNumber,
			pi.height,
			pi.weight,
			pi.bloodType,
			pi.isPWD,
			pi.pwdCategory,
			pi.pwdID,
			pi.studentId,
			pi.courseYearSection,
			pi.designation,
			pi.emFirstName,
			pi.emLastName,
			pi.emAddress,
			pi.emPhoneNumber,
			pi.emEmail,
			hs.hasFeverChills,
			hs.hasFatigue,
			hs.hasCough,
			hs.coughType,
			hs.hasSoreThroat,
			hs.hasShortnessOfBreath,
			hs.hasHeadache,
			hs.hasNauseaVomiting,
			hs.hasStomachPain,
			hs.hasBodyAches,
			hs.hasSkinRash,
			hs.hasDifficultySleeping,
			hs.hasOtherSymptoms,
			hs.otherSymptoms,
			hs.hasChronicIllness,
			hs.hasAsthma,
			hs.hasHypertension,
			hs.hasDiabetes,
			hs.diabetesType,
			hs.hasHeartDisease,
			hs.hasSeizures,
			hs.hasTuberculosis,
			hs.hasKidneyDisease,
			hs.hasDigestiveIssues,
			hs.hasMigrains,
			hs.hasCancer,
			hs.hasOtherConditions,
			hs.otherConditions,
			hs.wasHospitalized,
			hs.hospitalizedReason,
			hs.hasMedication,
			hs.hasAllergies,
			hs.allergies,
			hs.hasHereditaryDisease,
			hs.hereditaryDisease,
			hs.hasChildhoodVaccines,
			hs.hasVaccineAllergies,
			hs.withCovidCommurbidity,
			hs.covidVaccineStatus
		FROM Users u
		LEFT JOIN PersonalInformation pi ON u.id = pi.userId
		LEFT JOIN HealthSurvey hs ON u.id = hs.userId
		WHERE u.id = ?;`,
		[userId]
	);

	const [appointmentRows] = await connection.execute<mysql.RowDataPacket[]>(
		`SELECT 
			id AS appointmentId,
			appointmentTimestamp,
			status
		FROM Appointments
		WHERE userId = ?
		ORDER BY appointmentTimestamp DESC;`,
		[userId]
	);

	const user = userRows[0];
	if (user) {
		user.appointments = appointmentRows;
		user.hasPersonalInfo = !!user.firstName; // Check if personal information exists
		user.hasMedicalSurvey = !!user.covidVaccineStatus; // Check if medical survey exists
	}

	await connection.end()

	return user as UserSchema & { hasPersonalInfo: boolean; hasMedicalSurvey: boolean };
}