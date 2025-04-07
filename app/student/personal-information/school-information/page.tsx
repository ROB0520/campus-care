"use client"

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
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchDataFromDB } from "../fetchData";

const schoolInfoSchema = personalInformationSchema.pick({
  student_id: true,
  course_year: true,
  designation: true,
});

type SchoolInfoSchema = z.infer<typeof schoolInfoSchema>;

export default function SchoolInformation() {
  const router = useRouter();
  const session = useSession();

  const data = useBasicInfoStore((state) => state.data);
  const setData = useBasicInfoStore((state) => state.setData);
  const step = useBasicInfoStore((state) => state.step);
  const setStep = useBasicInfoStore((state) => state.setStep);

  const form = useForm<SchoolInfoSchema>({
    resolver: zodResolver(schoolInfoSchema),
    reValidateMode: "onSubmit",
    defaultValues: data ?? {
        student_id: undefined,
        course_year: undefined,
        designation: undefined,
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
          for (const key in dbData) {
            if (dbData[key] === undefined) continue;
            
            form.setValue(key as keyof SchoolInfoSchema, dbData[key]);
          }
        }
      })
    }, [form, session?.data?.user?.id]);

  const handleTabChange = async (tab: string) => {
    const result = await form.trigger();
    if (!result) return;
    const formData = form.getValues();
    const processedData = { ...data, ...formData };
    setData(processedData);

    switch (tab) {
      case "basic-information":
        if (step === 1) setStep(0);
        return router.push("/student/personal-information/basic-information");
      case "emergency-contact":
        if (step === 1) setStep(2);
        return router.push("/student/personal-information/emergency-contact");
    }
  };

  return (
    <div className="py-8">
      <Form {...form}>
        <form className="space-y-8">
          <Tabs defaultValue="school-information" className="items-center">
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
                value="school-information"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                School Information
              </TabsTrigger>
              <TabsTrigger
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleTabChange("emergency-contact");
                }}
                onKeyDown={(e) => {
                  e.preventDefault();
                  if ([" ", "Enter"].includes(e.key)) handleTabChange("emergency-contact");
                }}
                value="emergency-contact"
                className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Emergency Contact
              </TabsTrigger>
            </TabsList>
            <div>
              <div className="p-4 rounded-md shadow bg-card border border-border min-w-lg">
                <TabsContent value="school-information">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="student_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/4">Student ID:</FormLabel>
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
                      name="course_year"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/4">Course, Year & Section:</FormLabel>
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
                      name="designation"
                      render={({ field }) => (
                        <FormItem className="flex flex-col *:w-full gap-2">
                          <div className="flex flex-row gap-4 items-center">
                            <FormLabel className="flex-1/4">College/Department:</FormLabel>
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
                    handleTabChange("basic-information");
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="default"
                  className="mt-4"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabChange("emergency-contact");
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
