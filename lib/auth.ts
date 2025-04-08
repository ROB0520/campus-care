import NextAuth, { User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { hashPassword } from "@/lib/utils"
import mysql from "mysql2/promise"
import { CredentialsSignin } from "@auth/core/errors" 
import { createConnection } from "@/lib/db"

declare module "next-auth" {
	interface User {
		role: number;
	}
}

class InvalidCredentials extends CredentialsSignin {
	code = "invalid_credentials"
}
  

export const { handlers, signIn, signOut, auth } = NextAuth({
	callbacks: {
		authorized: async ({ auth }) => {
			return !!auth
		},
		jwt({ token, user }) {
			if (user) { // User is available during sign-in
			  token.role = user.role as number
			  token.email = user.email as string
			  token.id = user.id as string
			}
			return token
		  },
		session({ session, token }) {
			session.user.role = token.role as number
			session.user.email = token.email as string
			session.user.id = token.id as string
			return session
		},
	},
	pages: {
		signIn: "/login",
		error: "/login",
	},
	providers: [
		Credentials({
			// You can specify which fields should be submitted, by adding keys to the `credentials` object.
			// e.g. domain, username, password, 2FA token, etc.
			credentials: {
				email: {},
				password: {},
			},
			authorize: async (credentials) => {				
				let user = null

				if (!credentials?.email || !credentials?.password) {
					throw new InvalidCredentials()
				}

				// logic to salt and hash password
				const pwHash = hashPassword(credentials.password as string)				

				// logic to verify if the user exists
				const connection = await createConnection()

				const [rows] = await connection.execute<mysql.RowDataPacket[]>(
					'SELECT * FROM Users WHERE email = ? AND password = ?',
					[credentials.email, pwHash]
				);

				user = rows[0] as mysql.RowDataPacket;

				await connection.end();

				if (!user) {
					// No user found, so this is their first attempt to login
					// Optionally, this is also the place you could do a user registration
					throw new InvalidCredentials()
				}
				
				return {
					email: user.email,
					role: user.role,
					id: user.id,
				} as User
			},
		}),
	],
})