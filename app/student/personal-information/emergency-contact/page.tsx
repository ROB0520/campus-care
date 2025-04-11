"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBasicInfoStore } from "../store";
import { personalInformationSchema } from "@/lib/schema/personal-information";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Info } from "lucide-react";
import { saveData } from "../saveData";
import { getUserId } from "../getUserId";
import { fetchDataFromDB } from "../fetchData";
import { useSession } from "next-auth/react";
import { useUIState } from "@/app/student/store";
import { toast } from 'sonner';

const emergencyContactSchema = personalInformationSchema.pick({
  emFirstName: true,
  emLastName: true,
  emAddress: true,
  emPhoneNumber: true,
  emEmail: true,
});

type EmergencyContactSchema = z.infer<typeof emergencyContactSchema>;

export default function EmergencyContact() {
  const router = useRouter();
  const session = useSession();

  const data = useBasicInfoStore((state) => state.data);
  const setData = useBasicInfoStore((state) => state.setData);
  const step = useBasicInfoStore((state) => state.step);
  const setStep = useBasicInfoStore((state) => state.setStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setUsername = useUIState((state) => state.setUsername);

  const form = useForm<EmergencyContactSchema>({
    resolver: zodResolver(emergencyContactSchema),
    reValidateMode: "onSubmit",
    defaultValues: data ?? {
      emFirstName: undefined,
      emLastName: undefined,
      emAddress: undefined,
      emPhoneNumber: undefined,
      emEmail: undefined,
    },
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
        const schemaFields = Object.keys(emergencyContactSchema.shape);
        const filteredData = Object.fromEntries(
          Object.entries(dbData).filter(([key]) => schemaFields.includes(key))
        );
        for (const key in filteredData) {
          if (dbData[key] === undefined) continue;

          form.setValue(key as keyof EmergencyContactSchema, dbData[key]);
        }
      }
      setData(dbData as Partial<EmergencyContactSchema>);
    })
  }, [form, session?.data?.user?.id, setData]);

  const handleTabChange = async (tab: string) => {
    const result = await form.trigger();
    if (!result) return;
    const formData = form.getValues();
    const processedData = { ...data, ...formData };
    setData(processedData);

    switch (tab) {
      case "school-information":
        if (step === 2) setStep(1);
        return router.push("/student/personal-information/school-information");
      case "basic-information":
        if (step === 2) setStep(0);
        return router.push("/student/personal-information/basic-information");
    }
  };

  const saveResponse = async () => await saveData(data).then(() => {
    toast.success('Your Personal Information is now saved.')
    setUsername(data.firstName + " " + data.lastName);
    setIsSubmitting(false);
  });

  return (
    <div className="py-8">
      <Form {...form}>
        <form className="space-y-8">
          <Tabs defaultValue="emergency-contact" className="items-center">
            <TabsList className="text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1">
              <TabsTrigger
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleTabChange("basic-information");
                }}
                onKeyDown={(e) => {
                  e.preventDefault();
                  if ([" ", "Enter"].includes(e.key)) handleTabChange("basic-information");
                }}
                value="basic-information"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Basic Information
              </TabsTrigger>
              <TabsTrigger
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleTabChange("school-information");
                }}
                onKeyDown={(e) => {
                  e.preventDefault();
                  if ([" ", "Enter"].includes(e.key)) handleTabChange("school-information");
                }}
                value="school-information"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                School Information
              </TabsTrigger>
              <TabsTrigger
                value="emergency-contact"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Emergency Contact
              </TabsTrigger>
            </TabsList>
            <div>
              <div className="p-4 rounded-md shadow bg-card border border-border min-w-lg max-h-[70dvh] overflow-y-auto">
                <TabsContent value="emergency-contact">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="emFirstName"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/4">First Name:</FormLabel>
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
                      name="emLastName"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/4">Last Name:</FormLabel>
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
                      name="emAddress"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/4">Address:</FormLabel>
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
                      name="emPhoneNumber"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/3">Phone Number:</FormLabel>
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
                      name="emEmail"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/4">Email:</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </div>
              <div className="flex justify-end gap-4 w-full">
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabChange("school-information");
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="default"
                  className="mt-4"
                  onClick={(e) => {
                    e.preventDefault();
                    form.handleSubmit(async () => {
                      const formData = form.getValues();
                      const userId = await getUserId()
                      setData({ userId: userId, ...data, ...formData });
                      setIsSubmitting(true);
                    })();
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
            <AlertDialogTitle className="flex gap-2 items-center"><Info />Personal Information</AlertDialogTitle>
            <AlertDialogDescription>
              Have you carefully checked your responses to the personal information form?
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
