/**
 * Input validation utilities with Zod
 */

import { z } from 'zod';

// Dominis d'email permesos per registre regular
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'protonmail.com',
  'mailcat.cat',
  'gencat.cat',
];

// Function to check if email domain is allowed
export const isEmailDomainAllowed = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
};

// Zod schemas for validation
export const registrationSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  firstName: z
    .string()
    .min(3, 'First name must be at least 3 characters')
    .max(30, 'First name must be at most 30 characters'),
  lastName: z
    .string()
    .min(3, 'Last name must be at least 3 characters')
    .max(30, 'Last name must be at most 30 characters'),
  email: z
    .string()
    .email('Invalid email format')
    .refine(isEmailDomainAllowed, {
      message: 'Email domain not allowed. Please use (Gmail, Hotmail, Outlook, Yahoo, etc.)'
    }),
  password: z
    .string()
    .min(9, 'Password must be at least 9 characters')
});

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username or email is required')
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .optional(),
  password: z
    .string()
    .min(9, 'Password must be at least 9 characters')
}).refine(data => data.username || data.email, {
  message: "Either username or email is required",
  path: ["username"]
});

// Profile update schema (campos opcionales pero con validación)
export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .refine(isEmailDomainAllowed, {
      message: 'Email domain not allowed. Please use (Gmail, Hotmail, Outlook, Yahoo, etc.)'
    })
    .optional(),
  firstName: z
    .string()
    .min(3, 'First name must be at least 3 characters')
    .max(30, 'First name must be at most 30 characters')
    .optional(),
  lastName: z
    .string()
    .min(3, 'Last name must be at least 3 characters')
    .max(30, 'Last name must be at most 30 characters')
    .optional(),
  password: z
    .string()
    .min(9, 'Password must be at least 9 characters')
    .optional()
}).refine(data => {
  // Al menos un campo debe estar presente para la actualización
  return data.username || data.email || data.firstName || data.lastName || data.password;
}, {
  message: "At least one field must be provided for update",
  path: ["username"]
});

// Type exports from schemas
export type RegistrationData = z.infer<typeof registrationSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

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

export function parseProfileUpdateData(data: unknown): { success: true; data: ProfileUpdateData } | { success: false; error: string } {
  try {
    const parsed = profileUpdateSchema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Validation error' };
  }
}
