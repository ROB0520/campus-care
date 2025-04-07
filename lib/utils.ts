import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hashPassword(password: string): string {
  const hashedPassword = crypto.createHmac("sha256", 'AleczFrancoisVReyes').update(password).digest("hex");

  return hashedPassword;
}