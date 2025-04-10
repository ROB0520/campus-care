import { hashPassword } from '@/lib/utils';
import moment from 'moment-timezone';
import mysql from 'mysql2/promise';

import dotenv from 'dotenv';
dotenv.config({
	path: './.env.local',
});

async function main() {
	// Create a connection to the database
	const connection = await mysql.createConnection({
		// host: '51.79.196.57',
		// user: 'root',
		// password: 'egXHOV9R7rZoLchotBud7F3RXSUn7r4Wt1UpQkzLW3LsgPJw23efXCG0dBKG5LHF',
		// database: 'default',
		// port: Number(3307),
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		port: Number(process.env.DB_PORT),
	});

	try {
		// Hash the default password
		const hashedPassword = hashPassword('securepassword123');

		// Student names
		const students = [
			{ firstName: 'Arvin Joshua', middleName: 'A.', lastName: 'Cunanan' },
			{ firstName: 'Chester', middleName: 'E.', lastName: 'Dayao' },
			{ firstName: 'Francheska Claire', middleName: 'L.', lastName: 'Lopez' },
			{ firstName: 'Jay-r', middleName: 'D.', lastName: 'Maglaque' },
			{ firstName: 'Margie', middleName: 'C.', lastName: 'Manabat' },
			{ firstName: 'Jerald Aron', middleName: 'V.', lastName: 'Pangilinan' },
			{ firstName: 'Seigi', middleName: 'R.', lastName: 'Pascual' },
			{ firstName: 'Alecz Francois', middleName: 'V.', lastName: 'Reyes' },
			{ firstName: 'Khian Angelo', middleName: 'S.', lastName: 'Vivar' },
		];

		// Clinic users
		const clinicUsers = [
			{ firstName: 'John', lastName: 'Doe', position: 0 },
			{ firstName: 'Jane', lastName: 'Smith', position: 1 },
			{ firstName: 'Alice', lastName: 'Brown', position: 2 },
			{ firstName: 'Bob', lastName: 'Johnson', position: 0 },
			{ firstName: 'Charlie', lastName: 'Davis', position: 1 },
		];

		// Helper function to generate random dates (Monday-Friday, 8AM-6PM)
		function getRandomAppointmentDate() {
			const start = moment().add(1, 'days').startOf('day').hour(8); // Start tomorrow at 8AM
			const end = moment().add(30, 'days').endOf('day').hour(18); // End 30 days from now at 6PM
			let randomDate;
			do {
				randomDate = moment(start.valueOf() + Math.random() * (end.valueOf() - start.valueOf()));
			} while (randomDate.isoWeekday() > 5); // Ensure it's Monday-Friday
			return randomDate.valueOf() / 1000; // Convert to seconds
		}

		// Helper function to get random values for consultation history
		function getRandomConsultationData() {
			const reasons = ['General Checkup', 'Follow-up', 'Fever', 'Headache', 'Stomach Pain'];
			const diagnoses = ['Healthy', 'Flu', 'Migraine', 'Gastritis', 'Hypertension'];
			const medications = ['Paracetamol', 'Ibuprofen', 'Antibiotics', 'Antacids', 'None'];
			const remarks = ['No issues', 'Follow-up needed', 'Prescribed medication', 'Referred to specialist', 'Rest recommended'];

			return {
				reason: reasons[Math.floor(Math.random() * reasons.length)],
				diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
				medication: medications[Math.floor(Math.random() * medications.length)],
				remarks: remarks[Math.floor(Math.random() * remarks.length)],
			};
		}

		// Insert clinic users
		for (const clinicUser of clinicUsers) {
			const [userResult] = await connection.query<mysql.RowDataPacket[]>(
				`INSERT INTO Users (email, password, role) VALUES (?, ?, ?)`,

				[`${clinicUser.lastName.toLowerCase()}@clinic.edu`, hashedPassword, '1']
			);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const userId = (userResult as any).insertId;

			await connection.query(
				`INSERT INTO ClinicProfile (userId, firstName, middleName, lastName, position) VALUES (?, ?, ?, ?, ?)`,

				[userId, clinicUser.firstName, null, clinicUser.lastName, clinicUser.position]
			);
		}

		// Insert students
		for (const student of students) {
			const [userResult] = await connection.query(
				`INSERT INTO Users (email, password, role) VALUES (?, ?, ?)`,

				[`${student.lastName.toLowerCase()}@school.edu`, hashedPassword, '0']
			);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const userId = (userResult as any).insertId;

			// Insert personal information
			await connection.query(
				`INSERT INTO PersonalInformation (userId, firstName, middleName, lastName, sex, dateOfBirth, address, contactNumber, email, height, weight, bloodType, isPWD, student_id, course_year, designation, em_first_name, em_last_name, em_address, em_phone_number, em_email)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

				[
					userId,
					student.firstName,
					student.middleName,
					student.lastName,
					Math.random() > 0.5 ? 'male' : 'female', // Random sex
					'2000-01-01', // Default DOB
					'123 Main St', // Default address
					'09123456789', // Default contact number
					`${student.lastName.toLowerCase()}@school.edu`,
					Math.floor(Math.random() * 50) + 150, // Random height (150-200 cm)
					Math.floor(Math.random() * 50) + 50, // Random weight (50-100 kg)
					['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][Math.floor(Math.random() * 8)], // Random blood type
					false, // Default isPWD
					`STU-${userId}`, // Unique student ID
					'BSIT-2C',
					'College of Information and Communications Technology',
					'John', // Default emergency contact first name
					'Doe', // Default emergency contact last name
					'456 Elm St', // Default emergency contact address
					'09876543210', // Default emergency contact phone
					'emergency@contact.com', // Default emergency contact email
				]
			);

			// Insert health survey - ensure column count matches value count
			await connection.execute(
				`INSERT INTO HealthSurvey (
					userId, hasFeverChills, hasFatigue, hasCough, coughType, 
					hasSoreThroat, hasShortnessOfBreath, hasHeadache, hasNauseaVomiting, 
					hasStomachPain, hasBodyAches, hasSkinRash, hasDifficultySleeping, 
					hasOtherSymptoms, otherSymptoms, hasChronicIllness, hasAsthma, 
					hasHypertension, hasDiabetes, diabetesType, hasHeartDisease, 
					hasSeizures, hasTuberculosis, hasKidneyDisease, hasDigestiveIssues, 
					hasMigrains, hasCancer, hasOtherConditions, otherConditions, 
					wasHospitalized, hospitalizedReason, hasMedication, hasAllergies, 
					allergies, hasHereditaryDisease, hereditaryDisease, hasChildhoodVaccines, 
					hasVaccineAllergies, withCovidCommurbidity, covidVaccineStatus
				) VALUES (
					?, ?, ?, ?, ?,
					?, ?, ?, ?,
					?, ?, ?, ?,
					?, ?, ?, ?,
					?, ?, ?, ?,
					?, ?, ?, ?,
					?, ?, ?, ?,
					?, ?, ?, ?,
					?, ?, ?, ?,
					?, ?, ?
				)`,
				[
					userId,
					Math.random() > 0.5, // hasFeverChills
					Math.random() > 0.5, // hasFatigue
					Math.random() > 0.5, // hasCough
					Math.random() > 0.5 ? 'dry' : 'phlegm', // coughType
					Math.random() > 0.5, // hasSoreThroat
					Math.random() > 0.5, // hasShortnessOfBreath
					Math.random() > 0.5, // hasHeadache
					Math.random() > 0.5, // hasNauseaVomiting
					Math.random() > 0.5, // hasStomachPain
					Math.random() > 0.5, // hasBodyAches
					Math.random() > 0.5, // hasSkinRash
					Math.random() > 0.5, // hasDifficultySleeping
					Math.random() > 0.5, // hasOtherSymptoms
					'Other symptoms description', // otherSymptoms
					Math.random() > 0.5, // hasChronicIllness
					Math.random() > 0.5, // hasAsthma
					Math.random() > 0.5, // hasHypertension
					Math.random() > 0.5, // hasDiabetes
					Math.random() > 0.5 ? 'type1' : 'type2', // diabetesType
					Math.random() > 0.5, // hasHeartDisease
					Math.random() > 0.5, // hasSeizures
					Math.random() > 0.5, // hasTuberculosis
					Math.random() > 0.5, // hasKidneyDisease
					Math.random() > 0.5, // hasDigestiveIssues
					Math.random() > 0.5, // hasMigrains
					Math.random() > 0.5, // hasCancer
					Math.random() > 0.5, // hasOtherConditions
					'Other conditions description', // otherConditions
					Math.random() > 0.5, // wasHospitalized
					'Hospitalized reason', // hospitalizedReason
					Math.random() > 0.5, // hasMedication
					Math.random() > 0.5, // hasAllergies
					'Allergy description', // allergies
					Math.random() > 0.5, // hasHereditaryDisease
					'Hereditary disease description', // hereditaryDisease
					['yes', 'no', 'not_sure'][Math.floor(Math.random() * 3)], // hasChildhoodVaccines
					Math.random() > 0.5, // hasVaccineAllergies
					Math.random() > 0.5, // withCovidCommurbidity
					['no_vaccine', 'first_dose', 'fully_vaccinated', 'first_booster', 'fully_boosted'][Math.floor(Math.random() * 5)] // covidVaccineStatus
				]
			);

			// Insert Appointments and consultation histories
			for (let i = 0; i < 5; i++) {
				await connection.query(
					`INSERT INTO Appointments (userId, appointment_timestamp, status) VALUES (?, ?, ?)`,

					[userId, getRandomAppointmentDate(), 'pending']
				);

				const consultationData = getRandomConsultationData();
				// Fetch clinic Users with role 1
				const [clinicUsersWithRole1] = await connection.query(
					`SELECT id FROM Users WHERE role = 1`
				);

				// Ensure there are clinic Users with role 1
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				if ((clinicUsersWithRole1 as any[]).length > 0) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const attendingPersonnelId = (clinicUsersWithRole1 as any[])[Math.floor(Math.random() *
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						(clinicUsersWithRole1 as any[]).length)].id;
					console.log('Attending personnel ID:', attendingPersonnelId);


					await connection.query(
						`INSERT INTO ConsultationHistory (userId, attendingPersonnel, reason, diagnosis, medication, remarks, consultation_timestamp)
						VALUES (?, ?, ?, ?, ?, ?, ?)`,

						[
							userId,
							attendingPersonnelId, // Random clinic user ID with role 1
							consultationData.reason,
							consultationData.diagnosis,
							consultationData.medication,
							consultationData.remarks,
							(Date.now() - Math.floor(Math.random() * 30) * 86400000) / 1000, // Random past date
						]
					);
				} else {
					console.warn('No clinic Users with role 1 found.');
				}
			}
		}
	} catch (error) {
		console.error('Error creating users:', error);
	} finally {
		// Close the connection
		await connection.end();
	}
}

main().catch((error) => {
	console.error('Unexpected error:', error);
	process.exit(1);
});