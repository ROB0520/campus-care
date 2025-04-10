'use client'

import { Button } from '@/components/ui/button'
import { useUIState } from '@/app/student/store'
import { CircleUserRound, Pencil } from 'lucide-react'
import Link from 'next/link'

export default function SidebarHead({ name }: { name: string }) {
	const username = useUIState((state) => state.username)
	const displayName = username || name

	return (
		<div className="flex items-center gap-2 w-full bg-accent p-2 rounded-md">
			<CircleUserRound className="size-6" />
			<p className="flex-1">
				{displayName || "Name not found"}
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
	)
}
