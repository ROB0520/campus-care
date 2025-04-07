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
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchDataFromDB } from "../fetchData";

const healthAssessmentSchema = healthSurveySchema.pick({
  hasFeverChills: true,
  hasFatigue: true,
  hasCough: true,
  coughType: true,
  hasSoreThroat: true,
  hasShortnessOfBreath: true,
  hasHeadache: true,
  hasNauseaVomiting: true,
  hasStomachPain: true,
  hasBodyAches: true,
  hasSkinRash: true,
  hasDifficultySleeping: true,
  hasOtherSymptoms: true,
  otherSymptoms: true,
}).superRefine((data, ctx) => {
  if (data.hasCough && data.coughType === undefined) {
    ctx.addIssue({
      message: "Please specify the type of cough",
      code: z.ZodIssueCode.custom,
      path: ["coughType"],
    });
  }

  if (data.hasOtherSymptoms && data.otherSymptoms?.trim().length === 0) {
    ctx.addIssue({
      message: "Please specify other symptoms",
      code: z.ZodIssueCode.custom,
      path: ["otherSymptoms"],
    });
  }
});

type HealthAssessmentSchema = z.infer<typeof healthAssessmentSchema>;

export default function Home() {
  const router = useRouter();
  const session = useSession();

  const data = useHealthSurveyStore((state) => state.data);
  const setData = useHealthSurveyStore((state) => state.setData);
  const step = useHealthSurveyStore((state) => state.step);
  const setStep = useHealthSurveyStore((state) => state.setStep);

  const form = useForm<HealthAssessmentSchema>({
    resolver: zodResolver(healthAssessmentSchema),
    reValidateMode: 'onSubmit',
    defaultValues: data ?? {
      hasFeverChills: false,
      hasFatigue: false,
      hasCough: false,
      coughType: undefined,
      hasSoreThroat: false,
      hasShortnessOfBreath: false,
      hasHeadache: false,
      hasNauseaVomiting: false,
      hasStomachPain: false,
      hasBodyAches: false,
      hasSkinRash: false,
      hasDifficultySleeping: false,
      hasOtherSymptoms: false,
      otherSymptoms: undefined,
      wasHospitalized: false,
      hospitalizedReason: undefined,
      hasMedication: false,
      hasAllergies: false,
      allergies: undefined,
      hasHereditaryDisease: false,
      hereditaryDisease: undefined,
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
            'hasFeverChills',
            'hasFatigue',
            'hasCough',
            'hasSoreThroat',
            'hasShortnessOfBreath',
            'hasHeadache',
            'hasNauseaVomiting',
            'hasStomachPain',
            'hasBodyAches',
            'hasSkinRash',
            'hasDifficultySleeping',
            'hasOtherSymptoms',
          ].includes(key)) {
            dbData[key] = Boolean(dbData[key]);
          }
        }
        for (const key in dbData) {
          if (dbData[key] === undefined) continue;

          form.setValue(key as keyof HealthAssessmentSchema, dbData[key]);
        }
      }
    })
  }, [form, session?.data?.user?.id]);

  const handleTabChange = async (tab: string) => {
    const result = await form.trigger()
    if (!result) return;
    const formData = form.getValues();
    const processedData = { ...data, ...formData };
    if (!processedData.hasOtherSymptoms) {
      processedData.otherSymptoms = undefined;
    }
    setData(processedData);
    switch (tab) {
      case "health-assessment":
        return router.push("/student/health-survey/health-assessment");
      case "medical-history":
        if (step === 0) setStep(1);
        return router.push("/student/health-survey/medical-history");
      case "vaccination-records":
        return router.push("/student/health-survey/vaccination-records");
    }
  }

  return (
    <div className="py-8">
      <Form {...form}>
        <form className="space-y-8">
          <Tabs defaultValue="health-assessment" className="items-center">
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
              <div className="p-4 rounded-md shadow bg-card border border-border">
                <TabsContent value="health-assessment">
                  <div className="grid grid-cols-1 gap-4">
                    <p className="italic">Note: Please check any symptoms you are currently experiencing</p>
                    <FormField
                      control={form.control}
                      name="hasFeverChills"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Fever or Chills</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasFatigue"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Fatigue or Unexplained Weakness</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-row gap-6 items-center">
                      <FormField
                        control={form.control}
                        name="hasCough"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-4">
                            <FormControl>
                              <Checkbox
                                className="border-zinc-500"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Cough</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="coughType"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                disabled={!form.watch("hasCough")}
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-row items-center gap-4 group"
                                {...field}
                              >
                                <FormItem className="flex items-center flex-row gap-2">
                                  <FormControl className="peer">
                                    <RadioGroupItem
                                      className="border-zinc-500 disabled:border-zinc-300"
                                      value="dry" />
                                  </FormControl>
                                  <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                    Dry
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center flex-row gap-2">
                                  <FormControl className="peer">
                                    <RadioGroupItem
                                      className="border-zinc-500 disabled:border-zinc-300"
                                      value="phlegm" />
                                  </FormControl>
                                  <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                    With phlegm
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
                      name="hasSoreThroat"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Sore throat</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasShortnessOfBreath"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Shortness of breath or difficulty breathing</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasHeadache"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Headache or migraine</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasNauseaVomiting"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Nausea or vomiting</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasStomachPain"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Stomach pain or cramps</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasBodyAches"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Body aches or muscle pain</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasSkinRash"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Skin rashes, irritation, or itching</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasDifficultySleeping"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Difficulty sleeping (insomia or excessive sleep)</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasOtherSymptoms"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Others:</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="otherSymptoms"
                      disabled={!form.watch("hasOtherSymptoms")}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Please specify"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="medical-history">
                  <p className="text-muted-foreground p-4 text-center text-xs">Content for Tab 2</p>
                </TabsContent>
                <TabsContent value="vaccination-records">
                  <p className="text-muted-foreground p-4 text-center text-xs">Content for Tab 3</p>
                </TabsContent>
              </div>
              <div className="flex justify-end gap-4 w-full">
                <Button
                  variant='default'
                  className="mt-4"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabChange('medical-history');
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
