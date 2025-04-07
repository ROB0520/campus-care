import { handlers, auth as middleware } from "@/lib/auth" // Referring to the auth.ts we just created
export const { GET, POST } = handlers

export { middleware }