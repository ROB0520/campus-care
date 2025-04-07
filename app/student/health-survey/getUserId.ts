"use server"

import { auth } from "@/lib/auth"

export async function getUserId(): Promise<string> {
	const session = await auth()
	
	const userId = session?.user?.id
	if (!userId) {
		throw new Error("User ID not found")
	}
	return userId
}