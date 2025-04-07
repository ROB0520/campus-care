import { z } from "zod";

export const healthSurveySchema = z.object({
	hasFeverChills: z.boolean(),
    hasFatigue: z.boolean(),
    hasCough: z.boolean(),
    coughType: z.enum(["dry", "phlegm"]).optional(),
    hasSoreThroat: z.boolean(),
    hasShortnessOfBreath: z.boolean(),
    hasHeadache: z.boolean(),
    hasNauseaVomiting: z.boolean(),
    hasStomachPain: z.boolean(),
    hasBodyAches: z.boolean(),
    hasSkinRash: z.boolean(),
    hasDifficultySleeping: z.boolean(),
    hasOtherSymptoms: z.boolean(),
    otherSymptoms: z.string().optional(),

	hasChronicIllness: z.boolean(),
	hasAsthma: z.boolean(),
	hasHypertension: z.boolean(),
	hasDiabetes: z.boolean(),
	diabetesType: z.enum(["type1", "type2"]).optional(),
	hasHeartDisease: z.boolean(),
	hasSeizures: z.boolean(),
	hasTuberculosis: z.boolean(),
	hasKidneyDisease: z.boolean(),
	hasDigestiveIssues: z.boolean(),
	hasMigrains: z.boolean(),
	hasCancer: z.boolean(),
	hasOtherConditions: z.boolean(),
	otherConditions: z.string().optional(),
	
	wasHospitalized: z.boolean(),
	hospitalizedReason: z.string().optional(),
	hasMedication: z.boolean(),
	hasAllergies: z.boolean(),
	allergies: z.string().optional(),
	hasHereditaryDisease: z.boolean(),
	hereditaryDisease: z.string().optional(),

	hasChildhoodVaccines: z.enum(['yes', 'no', 'not_sure']),
	hasVaccineAllergies: z.boolean(),
	withCovidCommurbidity: z.boolean(),
	covidVaccineStatus: z.enum(['no_vaccine', 'first_dose', 'fully_vaccinated', 'first_booster', 'fully_boosted']),
});

export type HealthSurveySchema = z.infer<typeof healthSurveySchema>;