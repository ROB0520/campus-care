"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const toggleVisibility = () => setIsVisible((prevState) => !prevState)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const credentialsAction = (formData: any) => {
    signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
      redirect: true,
    })
  }

  useEffect(() => {
    const error = searchParams?.get("code")
    if (error) {
      switch (error) {
        case "invalid_credentials":
          toast.error("Invalid email or password")
          break
      }
      const params = new URLSearchParams(searchParams?.toString())
      params.delete('error')
      router.replace(`/login?${params.toString()}`)
    }
  }, [router, searchParams])

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      action={credentialsAction}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="credentials-email">Email</Label>
          <Input id="credentials-email" name="email" type="email" placeholder="john.doe@example.com" required />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="credentials-password">Password</Label>
          </div>
          <div className="relative">
            <Input
              id="credentials-password"
              className="pe-9"
              placeholder="Password"
              type={isVisible ? "text" : "password"}
              name="password"
              required
            />
            <button
              className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
              aria-controls="password"
            >
              {isVisible ? (
                <EyeOffIcon size={16} aria-hidden="true" />
              ) : (
                <EyeIcon size={16} aria-hidden="true" />
              )}
            </button>
          </div>
          {/* <Input id="credentials-password" name="password" type="password" required /> */}
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </div>
      {/* <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="#" className="underline underline-offset-4">
          Sign up
        </a>
      </div> */}
    </form>
  )
}
