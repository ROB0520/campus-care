-- Create table for users
CREATE TABLE Users (
	id INT AUTO_INCREMENT PRIMARY KEY,
	email VARCHAR(255) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	role INT NOT NULL DEFAULT 0, -- 0: Patient, 1: Clinic, 2: Admin
	isLocked BOOLEAN NOT NULL DEFAULT FALSE,
	tokenExpiry TIMESTAMP
);

-- Create table for personal information
CREATE TABLE PersonalInformation (
	id SERIAL PRIMARY KEY,
	userId INT NOT NULL,
	FOREIGN KEY (userId) REFERENCES Users(id),
	firstName VARCHAR(255) NOT NULL,
	middleName VARCHAR(255),
	lastName VARCHAR(255) NOT NULL,
	sex ENUM('male', 'female') NOT NULL,
	dateOfBirth DATE NOT NULL,
	address TEXT NOT NULL,
	contactNumber VARCHAR(50) NOT NULL,
	height DECIMAL(5, 2) NOT NULL CHECK (height > 0),
	weight DECIMAL(5, 2) NOT NULL CHECK (weight > 0),
	bloodType ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
	isPWD BOOLEAN,
	pwdCategory ENUM('physical', 'visual', 'hearing', 'mental', 'intellectual'),
	pwdID VARCHAR(255),
	studentId VARCHAR(255) NOT NULL UNIQUE,
	courseYearSection VARCHAR(255),
	designation VARCHAR(255),
	emFirstName VARCHAR(255) NOT NULL,
	emLastName VARCHAR(255) NOT NULL,
	emAddress TEXT NOT NULL,
	emPhoneNumber VARCHAR(50) NOT NULL,
	emEmail VARCHAR(255) NOT NULL
);

-- Create table for health survey
CREATE TABLE HealthSurvey (
	id SERIAL PRIMARY KEY,
	userId INT NOT NULL,
	FOREIGN KEY (userId) REFERENCES Users(id),
	hasFeverChills BOOLEAN NOT NULL,
	hasFatigue BOOLEAN NOT NULL,
	hasCough BOOLEAN NOT NULL,
	coughType ENUM('dry', 'phlegm'),
	hasSoreThroat BOOLEAN NOT NULL,
	hasShortnessOfBreath BOOLEAN NOT NULL,
	hasHeadache BOOLEAN NOT NULL,
	hasNauseaVomiting BOOLEAN NOT NULL,
	hasStomachPain BOOLEAN NOT NULL,
	hasBodyAches BOOLEAN NOT NULL,
	hasSkinRash BOOLEAN NOT NULL,
	hasDifficultySleeping BOOLEAN NOT NULL,
	hasOtherSymptoms BOOLEAN NOT NULL,
	otherSymptoms TEXT,
	hasChronicIllness BOOLEAN NOT NULL,
	hasAsthma BOOLEAN,
	hasHypertension BOOLEAN,
	hasDiabetes BOOLEAN,
	diabetesType ENUM('type1', 'type2'),
	hasHeartDisease BOOLEAN,
	hasSeizures BOOLEAN,
	hasTuberculosis BOOLEAN,
	hasKidneyDisease BOOLEAN,
	hasDigestiveIssues BOOLEAN,
	hasMigrains BOOLEAN,
	hasCancer BOOLEAN,
	hasOtherConditions BOOLEAN,
	otherConditions TEXT,
	wasHospitalized BOOLEAN NOT NULL,
	hospitalizedReason TEXT,
	hasMedication BOOLEAN NOT NULL,
	hasAllergies BOOLEAN NOT NULL,
	allergies TEXT,
	hasHereditaryDisease BOOLEAN NOT NULL,
	hereditaryDisease TEXT,
	hasChildhoodVaccines ENUM('yes', 'no', 'not_sure'),
	hasVaccineAllergies BOOLEAN NOT NULL,
	withCovidCommurbidity BOOLEAN NOT NULL,
	covidVaccineStatus ENUM('no_vaccine', 'first_dose', 'fully_vaccinated', 'first_booster', 'fully_boosted') NOT NULL
);

-- Create table for appointments
CREATE TABLE Appointments (
	id INT AUTO_INCREMENT PRIMARY KEY,
	userId INT NOT NULL,
	FOREIGN KEY (userId) REFERENCES Users(id),
	appointmentTimestamp BIGINT NOT NULL,
	status ENUM('pending', 'approved', 'cancelled', 'completed') NOT NULL DEFAULT 'pending'
);

-- Create table for consultation history
CREATE TABLE ConsultationHistory (
	id SERIAL PRIMARY KEY,
	userId INT NOT NULL,
	FOREIGN KEY (userId) REFERENCES Users(id),
	attendingPersonnel INT NOT NULL,
	FOREIGN KEY (attendingPersonnel) REFERENCES Users(id),
	reason TEXT NOT NULL,
	diagnosis TEXT NOT NULL,
	medication TEXT NOT NULL,
	remarks TEXT,
	consultationTimestamp BIGINT NOT NULL
);

-- Create table for clinic profile information
CREATE TABLE ClinicProfile (
	id SERIAL PRIMARY KEY,
	userId INT NOT NULL,
	FOREIGN KEY (userId) REFERENCES Users(id),
	firstName VARCHAR(255) NOT NULL,
	middleName VARCHAR(255),
	lastName VARCHAR(255) NOT NULL,
	position INT NOT NULL -- 0: Doctor, 1: Nurse
);

-- Create table for resetting passwords
CREATE TABLE PasswordReset (
	id SERIAL PRIMARY KEY,
	userId INT NOT NULL,
	FOREIGN KEY (userId) REFERENCES Users(id),
	resetToken VARCHAR(255) NOT NULL,
	tokenExpiry TIMESTAMP NOT NULL
);

-- Create table for appoinment notifications
CREATE TABLE AppointmentNotifications (
	id SERIAL PRIMARY KEY,
	userId INT NOT NULL,
	FOREIGN KEY (userId) REFERENCES Users(id),
	type ENUM('reminder', 'approved', 'rescheduled', 'cancelled', 'completed') NOT NULL,
	appointmentId INT NOT NULL,
	FOREIGN KEY (appointmentId) REFERENCES Appointments(id),
	notificationTimestamp BIGINT NOT NULL,
	isRead BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create table for admin profile information
CREATE TABLE AdminProfile (
	id SERIAL PRIMARY KEY,
	userId INT NOT NULL,
	FOREIGN KEY (userId) REFERENCES Users(id),
	firstName VARCHAR(255) NOT NULL,
	middleName VARCHAR(255),
	lastName VARCHAR(255) NOT NULL
);