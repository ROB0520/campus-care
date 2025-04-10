'use client'

import { z } from "zod"
import { adminProfileSchema } from "@/lib/schema/admin-profile"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { fetchAdminProfile } from "./fetch"
import { saveAdminProfile } from "./saveData"
import { toast } from "sonner"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"

export default function Profile() {
	const session = useSession().data

	const form = useForm<z.infer<typeof adminProfileSchema>>({
		resolver: zodResolver(adminProfileSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			middleName: "",
		},
	})

	useEffect(() => {
		if (!session) return;
		if (session.user?.id) {
			fetchAdminProfile(session.user.id).then((data) => {
				if (data) {
					// Ensure data is a plain object
					const plainData = JSON.parse(JSON.stringify(data));
					for (const key in plainData) {
						if (key in form.getValues() && plainData[key] !== null) {
							form.setValue(key as keyof z.infer<typeof adminProfileSchema>, plainData[key]);
						}
					}
				}
			});
		}
	}, [form, session])

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onSubmit = async (data: any) => {
		if (!session || !session.user) return
		
		try {
			await saveAdminProfile(data, Number(session.user.id))
			toast.success("Profile updated successfully")
		} catch (error) {
			console.error("Error saving data", error)
			toast.error("Error saving data")
		}
	}

	return <div>
		<div className="flex flex-col gap-3">
			<h1 className="text-2xl font-bold">Profile</h1>
			<p className="text-sm text-muted-foreground">Update your profile information.</p>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 md:w-md lg:w-lg">
					<FormField
						control={form.control}
						name="firstName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>First Name</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="lastName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Last Name</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="middleName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Middle Name</FormLabel>
								<FormControl>
									<Input placeholder="Optional" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Submit</Button>
				</form>
			</Form>
		</div>
	</div>
}