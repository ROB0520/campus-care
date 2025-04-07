-- Create table for users
CREATE TABLE Users (
	id INT AUTO_INCREMENT PRIMARY KEY,
	email VARCHAR(255) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	role INT NOT NULL DEFAULT 0, -- 0: Patient, 1: Doctor
	auth_token VARCHAR(255),
	token_expiry TIMESTAMP
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
	email VARCHAR(255) NOT NULL UNIQUE,
	height DECIMAL(5, 2) NOT NULL CHECK (height > 0),
	weight DECIMAL(5, 2) NOT NULL CHECK (weight > 0),
	bloodType ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
	isPWD BOOLEAN,
	pwdCategory ENUM('physical', 'visual', 'hearing', 'mental', 'intellectual'),
	pwdID VARCHAR(255),
	student_id VARCHAR(255) NOT NULL UNIQUE,
	course_year VARCHAR(255),
	designation VARCHAR(255),
	em_first_name VARCHAR(255) NOT NULL,
	em_last_name VARCHAR(255) NOT NULL,
	em_address TEXT NOT NULL,
	em_phone_number VARCHAR(50) NOT NULL,
	em_email VARCHAR(255) NOT NULL
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
	hasAsthma BOOLEAN NOT NULL,
	hasHypertension BOOLEAN NOT NULL,
	hasDiabetes BOOLEAN NOT NULL,
	diabetesType ENUM('type1', 'type2'),
	hasHeartDisease BOOLEAN NOT NULL,
	hasSeizures BOOLEAN NOT NULL,
	hasTuberculosis BOOLEAN NOT NULL,
	hasKidneyDisease BOOLEAN NOT NULL,
	hasDigestiveIssues BOOLEAN NOT NULL,
	hasMigrains BOOLEAN NOT NULL,
	hasCancer BOOLEAN NOT NULL,
	hasOtherConditions BOOLEAN NOT NULL,
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
	id SERIAL PRIMARY KEY,
	userId INT NOT NULL,
	FOREIGN KEY (userId) REFERENCES Users(id),
	appointment_timestamp BIGINT NOT NULL,
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
	consultation_timestamp BIGINT NOT NULL
);

-- Create table for clinic profile information
CREATE TABLE ClinicProfile (
	id SERIAL PRIMARY KEY,
	userId INT NOT NULL,
	FOREIGN KEY (userId) REFERENCES Users(id),
	firstName VARCHAR(255) NOT NULL,
	middleName VARCHAR(255),
	lastName VARCHAR(255) NOT NULL,
	position INT NOT NULL -- 0: Doctor, 1: Nurse, 2: Admin
);