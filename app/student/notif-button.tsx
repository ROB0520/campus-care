'use client'

import { Button } from "@/components/ui/button";
import { Bell, BellDot, BellRing, CalendarCheck2, CalendarDays, MessageSquareOff } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import moment from "moment-timezone";

export default function NotifButton({
	hasUnread,
	notifications,
}: {
	hasUnread: boolean;
	notifications: {
		id: number;
		type: 'cancelled' | 'approved' | 'rescheduled' | 'reminder';
		date: string;
	}[]
}) {
	return (
		<Popover>
			<PopoverTrigger 
				asChild
			>
				<Button
					variant="ghost"
					size='icon'
				>
					{
						hasUnread ?
							<BellDot className="size-6" /> :
							<Bell className="size-6" />
					}
				</Button>
			</PopoverTrigger>
			<PopoverContent collisionPadding={20} align="end" className="w-sm p-2 max-h-80 overflow-y-auto">
				{
					notifications.length > 0 ?
						notifications.map((notification) => (
							<div key={notification.id} className="bg-background w-full p-4 not-last:border-b border-muted">
								<div className="flex items-center gap-2">
									<div
										className="flex size-9 shrink-0 items-center justify-center rounded-full border"
										aria-hidden="true"
									>
										{
											notification.type === 'cancelled' ?
												<MessageSquareOff className="opacity-60" size={16} /> :
												null
										}
										{
											notification.type === 'approved' ?
												<CalendarCheck2 className="opacity-60" size={16} /> :
												null
										}
										{
											notification.type === 'rescheduled' ?
												<CalendarDays className="opacity-60" size={16} /> :
												null
										}
										{
											notification.type === 'reminder' ?
												<BellRing className="opacity-60" size={16} /> :
												null
										}
									</div>
									<div className="flex grow items-center gap-12">
										<div className="space-y-1">
											<p className="text-sm font-medium">
												Appointment {
													notification.type === 'cancelled' ?
														'Cancelled' :
														notification.type === 'approved' ?
															'Approved' :
															notification.type === 'rescheduled' ?
																'Rescheduled' :
																'Reminder'
												}
											</p>
											<p className="text-muted-foreground text-xs">
												{
													notification.type === 'cancelled' ?
														`Cancelled on ${moment(notification.date).format("MMMM Do YYYY, h:mm A")}` :
														notification.type === 'approved' ?
															`Approved on ${moment(notification.date).format("MMMM Do YYYY, h:mm A")}` :
															notification.type === 'rescheduled' ?
																`Rescheduled to ${moment(notification.date).format("MMMM Do YYYY, h:mm A")}` :
																`Reminder on ${moment(notification.date).format("MMMM Do YYYY, h:mm A")}`
												}
											</p>
										</div>
									</div>
								</div>
							</div>
						)) :
						<p className="text-sm text-center text-muted-foreground">
							No notifications
						</p>
				}
			</PopoverContent>
		</Popover>
	)
}