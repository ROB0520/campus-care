"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form 
      className={cn("flex flex-col gap-6", className)}
      onSubmit={async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        await fetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            first_name: formData.get("first_name"),
            last_name: formData.get("last_name"),
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirm-password"),
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })

      }}    
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Register an account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Fill in the details below to create a new account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" type="text" placeholder="John" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" type="text" placeholder="Doe" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="john.doe@example.com" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Enter your password" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input id="confirm-password" type="password" placeholder="Re-enter your password" required />
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
