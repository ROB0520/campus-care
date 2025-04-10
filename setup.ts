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
			{ firstName: 'Alice', lastName: 'Brown', position: 1 },
			{ firstName: 'Bob', lastName: 'Johnson', position: 0 },
			{ firstName: 'Charlie', lastName: 'Davis', position: 1 },
		];

		// Helper function to generate random dates (Monday-Friday, 8AM-6PM)
		function getRandomAppointmentDate() {
			const start = moment().add(1, 'days').startOf('day'); // Start tomorrow at 12AM
			const end = moment().add(30, 'days').endOf('day'); // End 30 days from now at 11:59PM
			let randomDate;
			do {
				randomDate = moment(start.valueOf() + Math.random() * (end.valueOf() - start.valueOf()));
				// Ensure it's Monday-Friday
				if (randomDate.isoWeekday() <= 5) {
					// Set hours between 8AM and 6PM
					randomDate.hour(8 + Math.floor(Math.random() * 10)); // Hours from 8 to 17 (5PM)
					randomDate.minute(Math.floor(Math.random() * 60)); // Random minutes
				}
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
				`INSERT INTO PersonalInformation (userId, firstName, middleName, lastName, sex, dateOfBirth, address, contactNumber, height, weight, bloodType, isPWD, studentId, courseYearSection, designation, emFirstName, emLastName, emAddress, emPhoneNumber, emEmail)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

				[
					userId,
					student.firstName,
					student.middleName,
					student.lastName,
					Math.random() > 0.5 ? 'male' : 'female', // Random sex
					'2000-01-01', // Default DOB
					'123 Main St', // Default address
					'09123456789', // Default contact number
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

			const hasCough = Math.random() > 0.5
			const hasOtherSymptoms = Math.random() > 0.5
			const hasChronicIllness = Math.random() > 0.5
			const hasDiabetes = Math.random() > 0.5
			const hasOtherConditions = Math.random() > 0.5
			const wasHospitalized = Math.random() > 0.5
			const hasAllergies = Math.random() > 0.5
			const hasHereditaryDisease = Math.random() > 0.5
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
					hasCough, // hasCough
					hasCough ? (Math.random() > 0.5 ? 'dry' : 'phlegm' ) : null, // coughType
					Math.random() > 0.5, // hasSoreThroat
					Math.random() > 0.5, // hasShortnessOfBreath
					Math.random() > 0.5, // hasHeadache
					Math.random() > 0.5, // hasNauseaVomiting
					Math.random() > 0.5, // hasStomachPain
					Math.random() > 0.5, // hasBodyAches
					Math.random() > 0.5, // hasSkinRash
					Math.random() > 0.5, // hasDifficultySleeping
					hasOtherSymptoms, // hasOtherSymptoms
					hasOtherSymptoms ? 'Other symptoms description' : null, // otherSymptoms
					hasChronicIllness, // hasChronicIllness
					hasChronicIllness ? Math.random() > 0.5 : null, // hasAsthma
					hasChronicIllness ? Math.random() > 0.5 : null, // hasHypertension
					hasChronicIllness ? hasDiabetes : null, // hasDiabetes
					hasChronicIllness ? (hasDiabetes ? (Math.random() > 0.5 ? 'type1' : 'type2') : null) : null, // diabetesType
					hasChronicIllness ? Math.random() > 0.5 : null, // hasHeartDisease
					hasChronicIllness ? Math.random() > 0.5 : null, // hasSeizures
					hasChronicIllness ? Math.random() > 0.5 : null, // hasTuberculosis
					hasChronicIllness ? Math.random() > 0.5 : null, // hasKidneyDisease
					hasChronicIllness ? Math.random() > 0.5 : null, // hasDigestiveIssues
					hasChronicIllness ? Math.random() > 0.5 : null, // hasMigrains
					hasChronicIllness ? Math.random() > 0.5 : null, // hasCancer
					hasChronicIllness ? hasOtherConditions : null, // hasOtherConditions
					hasChronicIllness ? (hasOtherConditions ? 'Other conditions description' : null) : null, // otherConditions
					wasHospitalized, // wasHospitalized
					wasHospitalized ? 'Hospitalized reason' : null, // hospitalizedReason
					Math.random() > 0.5, // hasMedication
					hasAllergies, // hasAllergies
					hasAllergies ? 'Allergy description' : null, // allergies
					hasHereditaryDisease, // hasHereditaryDisease
					hasHereditaryDisease ? 'Hereditary disease description' : null, // hereditaryDisease
					['yes', 'no', 'not_sure'][Math.floor(Math.random() * 3)], // hasChildhoodVaccines
					Math.random() > 0.5, // hasVaccineAllergies
					Math.random() > 0.5, // withCovidCommurbidity
					['no_vaccine', 'first_dose', 'fully_vaccinated', 'first_booster', 'fully_boosted'][Math.floor(Math.random() * 5)] // covidVaccineStatus
				]
			);

			// Insert Appointments and consultation histories
			for (let i = 0; i < 5; i++) {
				await connection.query(
					`INSERT INTO Appointments (userId, appointmentTimestamp, status) VALUES (?, ?, ?)`,

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

					await connection.query(
						`INSERT INTO ConsultationHistory (userId, attendingPersonnel, reason, diagnosis, medication, remarks, consultationTimestamp)
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

		// Insert admin accounts
		const admins = [
			{ firstName: 'Admin', lastName: 'One' },
			{ firstName: 'Admin', lastName: 'Two' },
			{ firstName: 'Admin', lastName: 'Three' },
			{ firstName: 'Admin', lastName: 'Four' },
			{ firstName: 'Admin', lastName: 'Five' }
		];

		console.log('Inserting admin accounts...');
		
		for (const admin of admins) {
			console.log(admin);
			
			const [userResult] = await connection.query(
				`INSERT INTO Users (email, password, role) VALUES (?, ?, ?)`,
				[`${admin.firstName.toLowerCase()}.${admin.lastName.toLowerCase()}@admin.edu`, hashedPassword, '2']
			);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const userId = (userResult as any).insertId;
			
			await connection.query(
				`INSERT INTO AdminProfile (userId, firstName, middleName, lastName) VALUES (?, ?, ?, ?)`,
				[userId, admin.firstName, null, admin.lastName] // position 2 for admin
			);
		}
		console.log('Admin accounts inserted successfully.');
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