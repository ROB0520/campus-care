import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth(({ auth, nextUrl }) => {
	const pathName = nextUrl.pathname;

	if (auth?.user) {
		if (pathName === '/' || pathName === "/login") {
			switch (Number(auth.user.role)) {
				case 0:
					return NextResponse.redirect(new URL("/student/appointment", nextUrl))
				case 1:
					return NextResponse.redirect(new URL("/clinic/appointment", nextUrl))
			}
		}
	} else {
		if (pathName !== "/login") {
			return NextResponse.redirect(new URL("/login", nextUrl))
		}
	}
})

export const config = {
	runtime: 'nodejs',
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}