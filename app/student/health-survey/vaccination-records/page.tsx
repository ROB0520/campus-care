"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { saveData } from "../saveData";

import { Button } from "@/components/ui/button";
import { useHealthSurveyStore } from "../store";
import { healthSurveySchema } from "@/lib/schema/health-survey";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { getUserId } from "../getUserId";
import { fetchDataFromDB } from "../fetchData";
import { useSession } from "next-auth/react";


const vaccinationRecordsSchema = healthSurveySchema.pick({
  hasChildhoodVaccines: true,
  hasVaccineAllergies: true,
  withCovidCommurbidity: true,
  covidVaccineStatus: true,
})

type MedicalHistorySchema = z.infer<typeof vaccinationRecordsSchema>;

export default function Home() {
  const router = useRouter();
  const session = useSession();

  const data = useHealthSurveyStore((state) => state.data);
  const setData = useHealthSurveyStore((state) => state.setData);
  const step = useHealthSurveyStore((state) => state.step);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MedicalHistorySchema>({
    resolver: zodResolver(vaccinationRecordsSchema),
    reValidateMode: 'onSubmit',
    defaultValues: data ?? {
      hasChildhoodVaccines: undefined,
      hasVaccineAllergies: undefined,
      withCovidCommurbidity: undefined,
      covidVaccineStatus: undefined
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
              'hasVaccineAllergies',
              'withCovidCommurbidity',
            ].includes(key)) {
              dbData[key] = Boolean(dbData[key]);
            }
          }
          for (const key in dbData) {
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
    setData(processedData);
    switch (tab) {
      case "health-assessment":
        return router.push("/student/health-survey/health-assessment");
      case "medical-history":
        return router.push("/student/health-survey/medical-history");
      case "vaccination-records":
        return router.push("/student/health-survey/vaccination-records");
    }
  }

  const onSubmit = async () => {
    const result = await form.trigger()
    if (!result) return;
    const userId = await getUserId()
    const formData = form.getValues();
    const processedData = { userId: userId, ...data, ...formData };
    setData(processedData);
    setIsSubmitting(true);
  }

  const saveResponse = async () => await saveData(data);

  return (
    <div className="py-8">
      <Form {...form}>
        <form className="space-y-8">
          <Tabs defaultValue="vaccination-records" className="h-full items-center">
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
                <TabsContent value="vaccination-records">
                  <div className="grid grid-cols-1 gap-4">
                    <p className="italic">Note: Please check any symptoms you are currently experiencing</p>
                    <FormField
                      control={form.control}
                      name="hasChildhoodVaccines"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Have you received all the required childhood vaccinations?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="group"
                              {...field}
                            >
                              <FormItem className="flex items-center flex-row gap-2">
                                <FormControl className="peer">
                                  <RadioGroupItem
                                    className="border-zinc-500 disabled:border-zinc-300"
                                    value="yes" />
                                </FormControl>
                                <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                  Yes
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center flex-row gap-2">
                                <FormControl className="peer">
                                  <RadioGroupItem
                                    className="border-zinc-500 disabled:border-zinc-300"
                                    value="no" />
                                </FormControl>
                                <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                  No
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center flex-row gap-2">
                                <FormControl className="peer">
                                  <RadioGroupItem
                                    className="border-zinc-500 disabled:border-zinc-300"
                                    value="not_sure" />
                                </FormControl>
                                <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                  Not sure
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
                      name="hasVaccineAllergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Have you had any allergic reactions to vaccines in the past?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(Boolean(value))}
                              value={String(field.value)}
                              className="group"
                            >
                              <FormItem className="flex items-center flex-row gap-2">
                                <FormControl className="peer">
                                  <RadioGroupItem
                                    className="border-zinc-500 disabled:border-zinc-300"
                                    value="true" />
                                </FormControl>
                                <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                  Yes
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center flex-row gap-2">
                                <FormControl className="peer">
                                  <RadioGroupItem
                                    className="border-zinc-500 disabled:border-zinc-300"
                                    value="false" />
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
                    <p className="font-semibold text-xl">COVID-19 Vaccination Survey</p>
                    <FormField
                      control={form.control}
                      name="withCovidCommurbidity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>With Comoribidty</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(Boolean(value))}
                              value={String(field.value)}
                              className="group"
                            >
                              <FormItem className="flex items-center flex-row gap-2">
                                <FormControl className="peer">
                                  <RadioGroupItem
                                    className="border-zinc-500 disabled:border-zinc-300"
                                    value="true" />
                                </FormControl>
                                <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                  Yes
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center flex-row gap-2">
                                <FormControl className="peer">
                                  <RadioGroupItem
                                    className="border-zinc-500 disabled:border-zinc-300"
                                    value="false" />
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
                      name="covidVaccineStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vaccination Status</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              {...field}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Current Vaccination Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no_vaccine">No Vaccine</SelectItem>
                                <SelectItem value="first_dose">First Dose</SelectItem>
                                <SelectItem value="fully_vaccinated">Fully Vaccinated</SelectItem>
                                <SelectItem value="first_booster">First Booster</SelectItem>
                                <SelectItem value="fully_boosted">Fully Boosted</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </div>
              <div className="flex justify-end gap-4 w-full">
                <Button
                  variant='secondary'
                  className="mt-4"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabChange('medical-history')
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant='default'
                  className="mt-4"
                  onClick={(e) => {
                    e.preventDefault();
                    onSubmit();
                  }}
                >
                  Submit
                </Button>
              </div>
            </div>
          </Tabs>
        </form>
      </Form>
      <AlertDialog onOpenChange={setIsSubmitting} open={isSubmitting}>
        <AlertDialogContent >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex gap-2 items-center"><Info />Health Survey</AlertDialogTitle>
            <AlertDialogDescription>
              Have you carefully checked your responses to the health survey?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => await saveResponse()}>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
