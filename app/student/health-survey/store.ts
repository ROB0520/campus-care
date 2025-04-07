import { HealthSurveySchema } from "@/lib/schema/health-survey";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type HealthSurveyState = Partial<HealthSurveySchema> & {
  setData: (data: Partial<HealthSurveySchema>) => void;
  step: number;
  setStep: (step: number) => void;
  data: Partial<HealthSurveySchema>;
};

export const useHealthSurveyStore = create<HealthSurveyState>()(
  persist(
    (set) => ({
      data: {},
      setData: (data) => set({ data: data }),
      step: 0,
      setStep: (step) => set({ step }),
    }),
    {
      name: "health_survey-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
