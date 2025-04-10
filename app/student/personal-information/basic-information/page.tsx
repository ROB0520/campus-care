"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useBasicInfoStore } from "../store";
import { personalInformationSchema } from "@/lib/schema/personal-information";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DateInput from '@/components/comp-504'
import { z } from "zod";
import { useEffect } from "react";
import { fetchDataFromDB } from "../fetchData";
import { useSession } from "next-auth/react";

const basicInfoSchema = personalInformationSchema.pick({
  firstName: true,
  middleName: true,
  lastName: true,
  sex: true,
  dateOfBirth: true,
  address: true,
  contactNumber: true,
  email: true,
  height: true,
  weight: true,
  bloodType: true,
  isPWD: true,
  pwdCategory: true,
  pwdID: true,
})

type BasicInfoSchema = z.infer<typeof basicInfoSchema>;

export default function BasicInformation() {
  const router = useRouter();
  const data = useBasicInfoStore((state) => state.data);
  const setData = useBasicInfoStore((state) => state.setData);
  const session = useSession();
  const step = useBasicInfoStore((state) => state.step);
  const setStep = useBasicInfoStore((state) => state.setStep);

  const form = useForm<BasicInfoSchema>({
    resolver: zodResolver(basicInfoSchema),
    reValidateMode: 'onSubmit',
    defaultValues: data ?? {
      firstName: "",
      middleName: undefined,
      lastName: "",
      sex: undefined,
      dateOfBirth: undefined,
      address: "",
      contactNumber: "",
      email: "",
      height: undefined,
      weight: undefined,
      bloodType: undefined,
      isPWD: false,
      pwdCategory: undefined,
      pwdID: undefined,
    }
  });

  useEffect(() => {
    if (session.data?.user?.id === undefined) return;
    const userId = session.data.user.id;
    fetchDataFromDB(Number(userId)).then((dbData) => {
      if (dbData) {
        dbData.dateOfBirth = dbData.dateOfBirth ? new Date(dbData.dateOfBirth) : null;
        dbData.height = dbData.height ? Number(dbData.height) : null;
        dbData.weight = dbData.weight ? Number(dbData.weight) : null;
        dbData.isPWD = Boolean(dbData.isPWD);
        for (const key in dbData) {
          if (dbData[key] === null) {
            dbData[key] = undefined;
          }
        }
        // Ensure we're only processing fields that exist in the schema
        const schemaFields = Object.keys(basicInfoSchema.shape);
        const filteredData = Object.fromEntries(
          Object.entries(dbData).filter(([key]) => schemaFields.includes(key))
        );
        for (const key in filteredData) {
          if (dbData[key] === undefined) continue;

          form.setValue(key as keyof BasicInfoSchema, dbData[key]);
        }
      }
      setData(dbData as Partial<BasicInfoSchema>);
    })

  }, [form, session?.data?.user?.id, setData]);


  const handleTabChange = async (tab: string) => {
    const result = await form.trigger()
    if (!result) return;
    const formData = form.getValues();
    const processedData = { ...data, ...formData };
    if (!processedData.isPWD) {
      delete processedData.pwdCategory;
      delete processedData.pwdID;
    }
    setData(processedData);

    switch (tab) {
      case "school-information":
        if (step === 0) setStep(1);
        return router.push("/student/personal-information/school-information");
      case "emergency-contact":
        if (step === 1) setStep(2);
        return router.push("/student/personal-information/emergency-contact");
    }
  }

  return (
    <div className="py-8">
      <Form {...form}>
        <form className="space-y-8">
          <Tabs defaultValue="basic-information" className="items-center">
            <TabsList className="text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1">
              <TabsTrigger
                value="basic-information"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Basic Information
              </TabsTrigger>
              <TabsTrigger
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleTabChange('school-information')
                }}
                onKeyDown={(e) => {
                  e.preventDefault();
                  if ([' ', 'Enter'].includes(e.key)) handleTabChange("school-information");
                }}
                value="school-information"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                School Information
              </TabsTrigger>
              <TabsTrigger
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleTabChange('emergency-contact')
                }}
                onKeyDown={(e) => {
                  e.preventDefault();
                  if ([' ', 'Enter'].includes(e.key)) handleTabChange("emergency-contact");
                }}
                value="emergency-contact"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Emergency Contact
              </TabsTrigger>
            </TabsList>
            <div>
              <div className="p-4 rounded-md shadow bg-card border border-border min-w-lg">
                <TabsContent value="basic-information">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/5">
                              First Name:
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/4">
                              Middle Name:
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Optional" />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/5">
                              Last Name:
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sex"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel>Sex:</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-row items-center gap-4 group"
                                {...field}
                              >
                                <FormItem className="flex items-center flex-row gap-2">
                                  <FormControl className="peer">
                                    <RadioGroupItem
                                      className="border-zinc-500 disabled:border-zinc-300"
                                      value="male" />
                                  </FormControl>
                                  <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                    Male
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center flex-row gap-2">
                                  <FormControl className="peer">
                                    <RadioGroupItem
                                      className="border-zinc-500 disabled:border-zinc-300"
                                      value="female" />
                                  </FormControl>
                                  <FormLabel className="font-normal peer-disabled:text-zinc-400">
                                    Female
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/4">Date of Birth:</FormLabel>
                            <FormControl>
                              <DateInput
                                endDate={new Date()}
                                selected={field.value}
                                onSelect={field.onChange}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel>Address:</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/3">Contact Number:</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/3">Email Address:</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/4">Height (cm):</FormLabel>
                            <FormControl>
                              <Input value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/4">Weight (kg):</FormLabel>
                            <FormControl>
                              <Input value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bloodType"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormLabel className="flex-1/5">Blood Type:</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              {...field}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isPWD"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormControl>
                            <Checkbox
                              className="border-zinc-500"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>PWD</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch("isPWD") && (
                      <>
                        <FormField
                          control={form.control}
                          name="pwdCategory"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                              <FormLabel className="flex-1/3">PWD Category:</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="physical">Physical</SelectItem>
                                    <SelectItem value="visual">Visual</SelectItem>
                                    <SelectItem value="hearing">Hearing</SelectItem>
                                    <SelectItem value="mental">Mental</SelectItem>
                                    <SelectItem value="intellectual">Intellectual</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="pwdID"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                              <FormLabel className="flex-1/4">PWD ID:</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="school-information">
                  <p className="text-muted-foreground p-4 text-center text-xs">Content for Tab 2</p>
                </TabsContent>
                <TabsContent value="emergency-contact">
                  <p className="text-muted-foreground p-4 text-center text-xs">Content for Tab 3</p>
                </TabsContent>
              </div>
              <div className="flex justify-end gap-4 w-full">
                <Button
                  variant='default'
                  className="mt-4"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabChange('school-information');
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
  )
}