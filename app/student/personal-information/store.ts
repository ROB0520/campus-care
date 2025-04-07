import { PersonalInformationSchema } from "@/lib/schema/personal-information";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type BasicInfoState = Partial<PersonalInformationSchema> & {
  setData: (data: Partial<PersonalInformationSchema>) => void;
  step: number;
  setStep: (step: number) => void;
  data: Partial<PersonalInformationSchema> & { userId?: string };
};

export const useBasicInfoStore = create<BasicInfoState>()(
  persist(
    (set) => ({
      data: {},
      setData: (data) => set({ data: data }),
      step: 0,
      setStep: (step) => set({ step }),
    }),
    {
      name: "basic_information-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
