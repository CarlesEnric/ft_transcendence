/**
 * Input validation utilities with Zod
 */

import { z } from 'zod';

// Zod schemas for validation
export const registrationSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .email('Invalid email format'),
  password: z
    .string()
    .min(9, 'Password must be at least 9 characters')
});

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username or email is required')
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .optional(),
  password: z
    .string()
    .min(1, 'Password is required')
}).refine(data => data.username || data.email, {
  message: "Either username or email is required",
  path: ["username"]
});

// Type exports from schemas
export type RegistrationData = z.infer<typeof registrationSchema>;
export type LoginData = z.infer<typeof loginSchema>;

// Legacy validation functions (for backward compatibility)
export function validateRegistrationInput(username: string, email: string, password: string) {
  try {
    registrationSchema.parse({ username, email, password });
    return null; // No validation errors
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0].message; // Return first error message
    }
    return 'Validation error';
  }
}

export function validateLoginInput(username: string, password: string) {
  try {
    loginSchema.parse({ username, password });
    return null; // No validation errors
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0].message; // Return first error message
    }
    return 'Validation error';
  }
}

// Enhanced validation functions that return parsed data
export function parseRegistrationData(data: unknown): { success: true; data: RegistrationData } | { success: false; error: string } {
  try {
    const parsed = registrationSchema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Validation error' };
  }
}

export function parseLoginData(data: unknown): { success: true; data: LoginData } | { success: false; error: string } {
  try {
    const parsed = loginSchema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Validation error' };
  }
}
