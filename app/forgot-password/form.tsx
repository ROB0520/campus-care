"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { sendResetEmail } from "./reset-password"
import Link from "next/link"

export function ResetForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resetAction = (formData: any) => {
    sendResetEmail(formData.get("email"))
      .then(() => {
        toast.success("Reset email sent successfully, if account exists")
      })
      .catch((error) => {
        toast.error(error.message)
      })
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      action={resetAction}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset the password to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to reset your password
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required />
        </div>
        <Button type="submit" className="w-full">
          Send Reset Link
        </Button>
        <Button type="button" className="w-full" variant='secondary' asChild>
          <Link
            href="/login"
            className="text-center text-muted-foreground text-sm"
          >
            Return to Login
          </Link>
        </Button>
      </div>
    </form>
  )
}
