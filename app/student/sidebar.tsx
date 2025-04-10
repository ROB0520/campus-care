"use client"

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { LogOut, CalendarDays, CircleUserRound, Contact, ClipboardList, FileClock, Pencil } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useBasicInfoStore } from "@/app/student/personal-information/store"
import { useHealthSurveyStore } from "@/app/student/health-survey/store"

export function AppSidebar({ name }: { name: string }) {
	const pathname = usePathname()
	const resetBasicInfo = useBasicInfoStore((state) => state.setData)
	const resetHealthSurvey = useHealthSurveyStore((state) => state.setData)

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center gap-2 w-full bg-accent p-2 rounded-md">
					<CircleUserRound className="size-6" />
					<p className="flex-1">
						{name || "Name not found"}
					</p>
					<Button
						variant='ghost'
						size='icon'
						asChild
					>
						<Link
							href='/student/profile'
						>
							<Pencil className="size-4" />
						</Link>
					</Button>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild isActive={pathname?.startsWith('/student/personal-information')}>
									<Link href='/student/personal-information/basic-information'>
										<Contact />
										<span>Personal Information</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild isActive={pathname?.startsWith('/student/health-survey')}>
									<Link href='/student/health-survey/health-assessment'>
										<ClipboardList />
										<span>Health Survey</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild isActive={pathname?.startsWith('/student/appointment')}>
									<Link href='/student/appointment'>
										<CalendarDays />
										<span>Appointment</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild isActive={pathname?.startsWith('/student/consultation-records')}>
									<Link href='/student/consultation-records'>
										<FileClock />
										<span>Consultation Records</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<Button
					size='lg'
					variant='default'
					className="flex items-center gap-2"
					onClick={() => {
						// Reset the stores to their initial state
						resetBasicInfo({})
						resetHealthSurvey({})
						
						signOut({ redirectTo: '/login', redirect: true })
					}}
				>
					Log Out
					<LogOut className="size-5" />
				</Button>
			</SidebarFooter>
		</Sidebar>
	)
}
