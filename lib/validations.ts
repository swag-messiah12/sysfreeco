import { z } from "zod";

export const submissionSchema = z.object({
  name: z
    .string({ message: "Restaurant name is required" })
    .min(2, "Restaurant name must be at least 2 characters")
    .max(100, "Name is too long")
    .trim(),

  address: z
    .string({ message: "Address is required" })
    .min(5, "Please enter a full street address")
    .max(200, "Address is too long")
    .trim(),

  city: z.enum(
    ["Toronto", "Hamilton", "Cambridge", "Mississauga", "Brampton", "Other"] as const,
    { message: "Please select a city" }
  ),

  website: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || v === "" || /^https?:\/\/.+\..+/.test(v),
      { message: "Please enter a valid URL (include https://)" }
    ),

  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .trim()
    .max(500, "Notes must be under 500 characters")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      { message: "Please enter a valid email address" }
    ),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
