"use server"

import { createConnection } from "@/lib/db"
import { z } from "zod";
import { userSchema as userFormSchema } from "@/lib/schema/user";
import { personalInformationSchema } from "@/lib/schema/personal-information";
import { healthSurveySchema } from "@/lib/schema/health-survey";
import { appointmentSchema } from "@/lib/schema/appointment";

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
	});

export type UserSchema = z.infer<typeof UserSchema>;

export async function fetchUser(userId: number): Promise<UserSchema & { hasPersonalInfo: boolean; hasMedicalSurvey: boolean }> {
	const connection = await createConnection()
	
	const [userRows] = await connection.execute(
		`SELECT 
			pi.firstName,
			pi.middleName,
			pi.lastName,
			pi.sex,
			pi.dateOfBirth,
			pi.address,
			pi.contactNumber,
			pi.email,
			pi.height,
			pi.weight,
			pi.bloodType,
			pi.isPWD,
			pi.pwdCategory,
			pi.pwdID,
			pi.student_id,
			pi.course_year,
			pi.designation,
			pi.em_first_name,
			pi.em_last_name,
			pi.em_address,
			pi.em_phone_number,
			pi.em_email,
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

	const [appointmentRows] = await connection.execute(
		`SELECT 
			id AS appointmentId,
			appointment_timestamp,
			status
		FROM Appointments
		WHERE userId = ?
		ORDER BY appointment_timestamp DESC;`,
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