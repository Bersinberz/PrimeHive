import { z } from "zod";

export const LoginSchema = z.object({
  email:    z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SignupSchema = z.object({
  name:        z.string().min(3, "Name must be at least 3 characters"),
  email:       z.string().email("Please enter a valid email address"),
  phone:       z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number"),
  password:    z.string().min(8, "Password must be at least 8 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const ResetPasswordSchema = z.object({
  token:       z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const SetPasswordSchema = z.object({
  token:       z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
