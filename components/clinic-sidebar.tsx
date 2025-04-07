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
import { LogOut, CalendarDays, FileClock, Archive, CircleUserRound, Pencil } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

export function AppSidebar({ name }: { name: string }) {
	const pathname = usePathname()

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center gap-2 w-full bg-accent p-2 rounded-md">
					<CircleUserRound className="size-6" />
					<p className="flex-1">
						{name}
					</p>
					<Button
						variant='ghost'
						size='icon'
						asChild
					>
						<Link
							href='/clinic/profile'
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
								<SidebarMenuButton asChild isActive={pathname?.startsWith('/clinic/appointment')}>
									<Link href='/clinic/appointment'>
										<CalendarDays />
										<span>Appointment Schedule</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild isActive={pathname?.startsWith('/clinic/consultation-history')}>
									<Link href='/clinic/consultation-history'>
										<FileClock />
										<span>Consultation History</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild isActive={pathname?.startsWith('/clinic/student-records')}>
									<Link href='/clinic/student-records'>
										<Archive />
										<span>Student Records</span>
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
