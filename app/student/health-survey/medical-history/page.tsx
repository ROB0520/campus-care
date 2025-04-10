"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button";
import { useHealthSurveyStore } from "../store";
import { healthSurveySchema } from "@/lib/schema/health-survey";
import { useRouter } from "next/navigation";
import { fetchDataFromDB } from "../fetchData";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

const medicalHistorySchema = healthSurveySchema.pick({
  hasChronicIllness: true,
  hasAsthma: true,
  hasHypertension: true,
  hasDiabetes: true,
  diabetesType: true,
  hasHeartDisease: true,
  hasSeizures: true,
  hasTuberculosis: true,
  hasKidneyDisease: true,
  hasDigestiveIssues: true,
  hasMigrains: true,
  hasCancer: true,
  hasOtherConditions: true,
  otherConditions: true,
  wasHospitalized: true,
  hospitalizedReason: true,
  hasMedication: true,
  hasAllergies: true,
  allergies: true,
  hasHereditaryDisease: true,
  hereditaryDisease: true,
}).superRefine((data, ctx) => {
  if (data.hasChronicIllness) {
    if (data.hasDiabetes && data.diabetesType === undefined) {
      ctx.addIssue({
        message: "Please specify the type of diabetes",
        code: z.ZodIssueCode.custom,
        path: ["diabetesType"]
      });
    }

    if (data.hasOtherConditions && data.otherConditions?.trim() === "") {
      ctx.addIssue({
        message: "Please specify other conditions",
        code: z.ZodIssueCode.custom,
        path: ["otherConditions"]
      });
    }
  }
});

type MedicalHistorySchema = z.infer<typeof medicalHistorySchema>;

export default function Home() {
  const router = useRouter();
  const session = useSession();

  const data = useHealthSurveyStore((state) => state.data);
  const setData = useHealthSurveyStore((state) => state.setData);
  const step = useHealthSurveyStore((state) => state.step);
  const setStep = useHealthSurveyStore((state) => state.setStep);

  const form = useForm<MedicalHistorySchema>({
    resolver: zodResolver(medicalHistorySchema),
    reValidateMode: 'onSubmit',
    defaultValues: data ?? {
      hasChronicIllness: false,
      hasAsthma: false,
      hasHypertension: false,
      hasDiabetes: false,
      diabetesType: undefined,
      hasHeartDisease: false,
      hasSeizures: false,
      hasTuberculosis: false,
      hasKidneyDisease: false,
      hasDigestiveIssues: false,
      hasMigrains: false,
      hasCancer: false,
      hasOtherConditions: false,
      otherConditions: '',
      wasHospitalized: undefined,
      hospitalizedReason: '',
      hasMedication: undefined,
      hasAllergies: undefined,
      allergies: '',
      hasHereditaryDisease: undefined,
      hereditaryDisease: '',
    },
  });

  useEffect(() => {
    if (session.data?.user?.id === undefined) return;
    const userId = session.data.user.id;
    fetchDataFromDB(Number(userId)).then((dbData) => {
      if (dbData) {
        for (const key in dbData) {
          if (dbData[key] === null) {
            dbData[key] = undefined;
          }
          if ([
            'hasChronicIllness',
            'hasAsthma',
            'hasHypertension',
            'hasDiabetes',
            'hasHeartDisease',
            'hasSeizures',
            'hasTuberculosis',
            'hasKidneyDisease',
            'hasDigestiveIssues',
            'hasMigrains',
            'hasCancer',
            'hasOtherConditions',
            'wasHospitalized',
            'hasMedication',
            'hasAllergies',
            'hasHereditaryDisease',
          ].includes(key)) {
            dbData[key] = Boolean(dbData[key]);
          }
        }
        const schemaFields = Object.keys(medicalHistorySchema.innerType().shape);
        const filteredData = Object.fromEntries(
          Object.entries(dbData).filter(([key]) => schemaFields.includes(key))
        );
        for (const key in filteredData) {
          if (dbData[key] === undefined) continue;

          form.setValue(key as keyof MedicalHistorySchema, dbData[key]);
        }
      }
    })
  }, [form, session?.data?.user?.id]);

  const handleTabChange = async (tab: string) => {
    const result = await form.trigger()
    if (!result) return;
    const formData = form.getValues();
    const processedData = { ...data, ...formData };
    if (!processedData.hasChronicIllness) {
      processedData['hasAsthma'] = false;
      processedData['hasHypertension'] = false;
      processedData['hasDiabetes'] = false;
      processedData['diabetesType'] = undefined;
      processedData['hasHeartDisease'] = false;
      processedData['hasSeizures'] = false;
      processedData['hasTuberculosis'] = false;
      processedData['hasKidneyDisease'] = false;
      processedData['hasDigestiveIssues'] = false;
      processedData['hasMigrains'] = false;
      processedData['hasCancer'] = false;
      processedData['hasOtherConditions'] = false;
      processedData['otherConditions'] = undefined;
    } else {
      if (!processedData.hasDiabetes) processedData['diabetesType'] = undefined;
      if (!processedData.hasOtherConditions) processedData['otherConditions'] = undefined;
    }

    if (!processedData.wasHospitalized) processedData['hospitalizedReason'] = undefined;
    if (!processedData.hasAllergies) processedData['allergies'] = undefined;
    if (!processedData.hasHereditaryDisease) processedData['hereditaryDisease'] = undefined;

    setData(processedData);
    switch (tab) {
      case "health-assessment":
        return router.push("/student/health-survey/health-assessment");
      case "medical-history":
        return router.push("/student/health-survey/medical-history");
      case "vaccination-records":
        if (step === 1) setStep(2);
        return router.push("/student/health-survey/vaccination-records");
    }
  }

  return (
    <div className="py-8">
      <Form {...form}>
        <form className="space-y-8">
          <Tabs defaultValue="medical-history" className="h-full items-center">
            <TabsList className="text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1">
              <TabsTrigger
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleTabChange('health-assessment')
                }}
                onKeyDown={(e) => {
                  e.preventDefault();
                  if ([' ', 'Enter'].includes(e.key)) handleTabChange("health-assessment");
                }}
                value="health-assessment"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Health Assessment
              </TabsTrigger>
              <TabsTrigger
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleTabChange("medical-history");
                }}
                onKeyDown={(e) => {
                  e.preventDefault();
                  if ([' ', 'Enter'].includes(e.key)) handleTabChange("medical-history");
                }}
                value="medical-history"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Medical History
              </TabsTrigger>
              <TabsTrigger
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleTabChange("vaccination-records");
                }}
                onKeyDown={(e) => {
                  e.preventDefault();
                  if ([' ', 'Enter'].includes(e.key)) handleTabChange("vaccination-records");
                }}
                disabled={step < 1}
                value="vaccination-records"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Vaccination Records
              </TabsTrigger>
            </TabsList>
            <div>
              <div className="p-4 rounded-md shadow bg-card border border-border max-h-[70dvh] overflow-y-auto">
                <TabsContent value="medical-history">
                  <div className="grid grid-cols-1 gap-4">
                    <p className="italic">Note: Please check any symptoms you are currently experiencing</p>
                    <FormField
                      control={form.control}
                      name="hasChronicIllness"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Do you have any chronic illnesses or medical conditions?</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="italic">If yes, check the following medical conditions:</p>
                    <FormField
                      control={form.control}
                      name="hasAsthma"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              disabled={!form.watch('hasChronicIllness')}
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Asthma or other lung conditions</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasHypertension"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              disabled={!form.watch('hasChronicIllness')}
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>High blood pressure (Hyperension)</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-row gap-6 items-center">
                      <FormField
                        control={form.control}
                        name="hasDiabetes"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-4">
                            <FormControl>
                              <Checkbox
                                disabled={!form.watch('hasChronicIllness')}
                                className="border-zinc-500"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Diabetes</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="diabetesType"
                        disabled={!form.watch('hasDiabetes')}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={!form.watch('hasDiabetes') || !form.watch('hasChronicIllness')}
                                className="flex flex-row items-center gap-4 group"
                                {...field}
                              >
                                <FormItem className="flex items-center flex-row gap-2">
                                  <FormControl className="peer">
                                    <RadioGroupItem
                                      className="border-zinc-500 disabled:border-zinc-300"
                                      value="type1" />
                                  </FormControl>
                                  <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                    Type 1
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center flex-row gap-2">
                                  <FormControl className="peer">
                                    <RadioGroupItem
                                      className="border-zinc-500 disabled:border-zinc-300"
                                      value="type2" />
                                  </FormControl>
                                  <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                    Type 2
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="hasHeartDisease"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              disabled={!form.watch('hasChronicIllness')}
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Heart disease or heart conditions</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasSeizures"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              disabled={!form.watch('hasChronicIllness')}
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Epilepsy or Seizures</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasTuberculosis"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              disabled={!form.watch('hasChronicIllness')}
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Tuberculosis (TB) or other infectious diseases</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasKidneyDisease"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              disabled={!form.watch('hasChronicIllness')}
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Kidney disease or urinary tract disorders</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasDigestiveIssues"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              disabled={!form.watch('hasChronicIllness')}
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Stomach or digestive issues (Ulcers, Acid Reflux, IBS)</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasMigrains"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              disabled={!form.watch('hasChronicIllness')}
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Migraines or chronic headaches</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasCancer"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              disabled={!form.watch('hasChronicIllness')}
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Cancer (Current or past diagnosis)</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasOtherConditions"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              disabled={!form.watch('hasChronicIllness')}
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Other Conditions</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="otherConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              disabled={!form.watch('hasOtherConditions') || !form.watch('hasChronicIllness')}
                              placeholder="Please specify other conditions"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p>Have you been hospitalized in the past 5 years?</p>
                    <FormField
                      control={form.control}
                      name="wasHospitalized"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === 'true')}
                              value={String(field.value)}
                              className="flex flex-row items-center gap-4"
                            >
                              <FormItem className="flex items-center flex-row gap-2">
                                <FormControl className="peer">
                                  <RadioGroupItem
                                    className="border-zinc-500"
                                    value="true"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                  Yes
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center flex-row gap-2">
                                <FormControl className="peer">
                                  <RadioGroupItem
                                    className="border-zinc-500"
                                    value="false"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                  No
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hospitalizedReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              disabled={form.watch('wasHospitalized') !== true}
                              placeholder="If yes, Please specify the reason for hospitalization"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p>Are you currently taking any medications?</p>
                    <FormField
                      control={form.control}
                      name="hasMedication"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === 'true')}
                              value={String(field.value)}
                              className="flex flex-row items-center gap-4"
                            >
                              <FormItem className="flex items-center flex-row gap-2">
                                <FormControl className="peer">
                                  <RadioGroupItem
                                    className="border-zinc-500"
                                    value="true"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                  Yes
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center flex-row gap-2">
                                <FormControl className="peer">
                                  <RadioGroupItem
                                    className="border-zinc-500"
                                    value="false"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                  No
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p>Do you have any known allergies?</p>
                    <FormField
                      control={form.control}
                      name="hasAllergies"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === 'true')}
                              value={String(field.value)}
                              className="flex flex-row items-center gap-4"
                            >
                              <FormItem className="flex items-center flex-row gap-2">
                                <FormControl className="peer">
                                  <RadioGroupItem
                                    className="border-zinc-500"
                                    value="true"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                  Yes
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center flex-row gap-2">
                                <FormControl className="peer">
                                  <RadioGroupItem
                                    className="border-zinc-500"
                                    value="false"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                  No
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              disabled={form.watch('hasAllergies') !== true}
                              placeholder="If yes, Please specify the allergies"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p>Do you have a family history of any hereditary diseases?</p>
                    <FormField
                      control={form.control}
                      name="hasHereditaryDisease"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === 'true')}
                              value={String(field.value)}
                              className="flex flex-row items-center gap-4"
                            >
                              <FormItem className="flex items-center flex-row gap-2">
                                <FormControl className="peer">
                                  <RadioGroupItem
                                    className="border-zinc-500"
                                    value="true"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                  Yes
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center flex-row gap-2">
                                <FormControl className="peer">
                                  <RadioGroupItem
                                    className="border-zinc-500"
                                    value="false"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                  No
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hereditaryDisease"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              disabled={form.watch('hasHereditaryDisease') !== true}
                              placeholder="If yes, Please specify the hereditary diseases"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="vaccination-records">
                  <p className="text-muted-foreground p-4 text-center text-xs">Content for Tab 3</p>
                </TabsContent>
              </div>
              <div className="flex justify-end gap-4 w-full">
                <Button
                  variant='secondary'
                  className="mt-4"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabChange('health-assessment')
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant='default'
                  className="mt-4"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabChange('vaccination-records')
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
