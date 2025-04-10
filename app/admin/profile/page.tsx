'use client'

import { z } from "zod"
import { clinicProfileSchema } from "@/lib/schema/clinic-profile"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useId, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { fetchAdminProfile } from "./fetch"
import { toast } from "sonner"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { updatePassword, updateProfile } from "./update"
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useUIState } from "@/app/admin/store"

const profileFormSchema = clinicProfileSchema.extend({
	password: z.string().min(1, "Password is required"),
	email: z.string().email(),
})

// Password requirements configuration
const passwordRequirements = [
	{ regex: /.{8,}/, text: "At least 8 characters" },
	{ regex: /[0-9]/, text: "At least 1 number" },
	{ regex: /[a-z]/, text: "At least 1 lowercase letter" },
	{ regex: /[A-Z]/, text: "At least 1 uppercase letter" },
]

export default function Profile() {
	const session = useSession().data
	const setUsername = useUIState((state) => state.setUsername)

	const form = useForm<z.infer<typeof profileFormSchema>>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			middleName: "",
			email: "",
			password: "",
		},
	})

	useEffect(() => {
		if (!session?.user?.id) return;

		fetchAdminProfile(session.user.id).then((data) => {
			if (data) {
				// Ensure data is a plain object
				const plainData = JSON.parse(JSON.stringify(data));
				for (const key in plainData) {
					if (key in form.getValues() && plainData[key] !== null) {
						form.setValue(key as keyof z.infer<typeof profileFormSchema>, plainData[key]);
					}
				}
			}
		});
	}, [form, session])

	const profileSubmit = async (data: z.infer<typeof profileFormSchema>) => {
		if (!session?.user?.id) return;

		try {
			await updateProfile(data, Number(session.user.id), data.password);
			toast.success("Profile updated successfully");
			setUsername(data.firstName + " " + data.lastName);
		} catch (error) {
			console.error("Error saving data", error);
			toast.error("Error saving data");
		} finally {
			form.setValue("password", "");
		}
	}

	// Password reset state and functions
	const [passwordState, setPasswordState] = useState({
		current: "",
		new: "",
		confirm: "",
	});

	const [passwordVisibility, setPasswordVisibility] = useState({
		profilePassword: false,
		current: false,
		new: false,
		confirm: false,
	});

	const toggleVisibility = (field: keyof typeof passwordVisibility) => {
		setPasswordVisibility(prev => ({
			...prev,
			[field]: !prev[field]
		}));
	};

	const handlePasswordChange = (field: keyof typeof passwordState) => (e: React.ChangeEvent<HTMLInputElement>) => {
		setPasswordState(prev => ({
			...prev,
			[field]: e.target.value
		}));
	};

	const passwordSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (passwordState.new !== passwordState.confirm) {
			toast.error("Passwords do not match");
			return;
		}

		if (passwordState.new.length < 8) {
			toast.error("Password must be at least 8 characters long");
			return;
		}

		if (passwordState.new === passwordState.current) {
			toast.error("New password cannot be the same as the current password");
			return;
		}

		if (!session?.user?.id) return;

		updatePassword(session.user.id, passwordState.current, passwordState.new)
			.then(() => {
				toast.success("Password updated successfully");
				setPasswordState({
					current: "",
					new: "",
					confirm: "",
				});
			})
			.catch((error) => {
				toast.error(error.message);
			});
	};

	const checkStrength = (pass: string) => {
		return passwordRequirements.map((req) => ({
			met: req.regex.test(pass),
			text: req.text,
		}));
	};

	const strength = checkStrength(passwordState.new);
	const strengthScore = useMemo(() =>
		strength.filter((req) => req.met).length,
		[strength]);

	const getStrengthColor = (score: number) => {
		if (score === 0) return "bg-border";
		if (score <= 1) return "bg-red-500";
		if (score <= 2) return "bg-orange-500";
		if (score === 3) return "bg-amber-500";
		return "bg-emerald-500";
	};

	const getStrengthText = (score: number) => {
		if (score === 0) return "Enter a password";
		if (score <= 2) return "Weak password";
		if (score === 3) return "Medium password";
		return "Strong password";
	};

	// Generate unique IDs for accessibility
	const profilePswId = useId();
	const currentPswId = useId();
	const newPswId = useId();
	const confirmPswId = useId();

	return <div className="flex flex-col gap-3">
		<h1 className="text-2xl font-bold">Profile</h1>
		<Form {...form}>
			<form onSubmit={form.handleSubmit(profileSubmit)} className="space-y-4 md:w-md lg:w-lg">
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
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Current Password</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										id={profilePswId}
										className="pe-9"
										type={passwordVisibility.profilePassword ? "text" : "password"}
										{...field}
									/>
									<button
										className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
										type="button"
										onClick={() => toggleVisibility('profilePassword')}
										aria-label={passwordVisibility.profilePassword ? "Hide password" : "Show password"}
										aria-pressed={passwordVisibility.profilePassword}
									>
										{passwordVisibility.profilePassword ? (
											<EyeOffIcon size={16} aria-hidden="true" />
										) : (
											<EyeIcon size={16} aria-hidden="true" />
										)}
									</button>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">Update Profile</Button>
			</form>
		</Form>

		<Separator className="my-4" />

		<h1 className="text-2xl font-bold text-left">Reset Password</h1>
		<form onSubmit={passwordSubmit} className="space-y-4 md:w-md lg:w-lg">
			<div>
				<Label htmlFor={currentPswId} className="mb-2">Current Password</Label>
				<div className="relative">
					<Input
						id={currentPswId}
						className="pe-9"
						type={passwordVisibility.current ? "text" : "password"}
						value={passwordState.current}
						onChange={handlePasswordChange('current')}
					/>
					<button
						className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
						type="button"
						onClick={() => toggleVisibility('current')}
						aria-label={passwordVisibility.current ? "Hide password" : "Show password"}
						aria-pressed={passwordVisibility.current}
					>
						{passwordVisibility.current ? (
							<EyeOffIcon size={16} aria-hidden="true" />
						) : (
							<EyeIcon size={16} aria-hidden="true" />
						)}
					</button>
				</div>
			</div>
			<div>
				<Label htmlFor={newPswId} className="mb-2">New Password</Label>
				<div className="relative">
					<Input
						id={newPswId}
						className="pe-9"
						type={passwordVisibility.new ? "text" : "password"}
						value={passwordState.new}
						onChange={handlePasswordChange('new')}
					/>
					<button
						className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
						type="button"
						onClick={() => toggleVisibility('new')}
						aria-label={passwordVisibility.new ? "Hide password" : "Show password"}
						aria-pressed={passwordVisibility.new}
					>
						{passwordVisibility.new ? (
							<EyeOffIcon size={16} aria-hidden="true" />
						) : (
							<EyeIcon size={16} aria-hidden="true" />
						)}
					</button>
				</div>
				{/* Password strength indicator */}
				<div
					className="bg-border mt-3 mb-4 h-1 w-full overflow-hidden rounded-full"
					role="progressbar"
					aria-valuenow={strengthScore}
					aria-valuemin={0}
					aria-valuemax={4}
					aria-label="Password strength"
				>
					<div
						className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
						style={{ width: `${(strengthScore / 4) * 100}%` }}
					></div>
				</div>

				{/* Password strength description */}
				<p className="text-foreground mb-2 text-sm font-medium">
					{getStrengthText(strengthScore)}. Must contain:
				</p>

				{/* Password requirements list */}
				<ul className="space-y-1.5" aria-label="Password requirements">
					{strength.map((req, index) => (
						<li key={index} className="flex items-center gap-2">
							{req.met ? (
								<CheckIcon
									size={16}
									className="text-emerald-500"
									aria-hidden="true"
								/>
							) : (
								<XIcon
									size={16}
									className="text-muted-foreground/80"
									aria-hidden="true"
								/>
							)}
							<span
								className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}
							>
								{req.text}
								<span className="sr-only">
									{req.met ? " - Requirement met" : " - Requirement not met"}
								</span>
							</span>
						</li>
					))}
				</ul>
			</div>
			<div>
				<Label htmlFor={confirmPswId} className="mb-2">Confirm New Password</Label>
				<div className="relative">
					<Input
						id={confirmPswId}
						className="pe-9"
						type={passwordVisibility.confirm ? "text" : "password"}
						value={passwordState.confirm}
						onChange={handlePasswordChange('confirm')}
					/>
					<button
						className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
						type="button"
						onClick={() => toggleVisibility('confirm')}
						aria-label={passwordVisibility.confirm ? "Hide password" : "Show password"}
						aria-pressed={passwordVisibility.confirm}
					>
						{passwordVisibility.confirm ? (
							<EyeOffIcon size={16} aria-hidden="true" />
						) : (
							<EyeIcon size={16} aria-hidden="true" />
						)}
					</button>
				</div>
			</div>
			<Button type="submit">Reset Password</Button>
		</form>
	</div>
}