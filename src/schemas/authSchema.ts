import { z } from "zod";
import { UserRole } from "../types";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const registrationSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100, "Name must be 100 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum([UserRole.RESPONDER, UserRole.INCIDENT_COMMANDER]),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegistrationFormValues = z.infer<typeof registrationSchema>;
