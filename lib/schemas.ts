import { z } from 'zod';

export const addressSchema = z.object({
  address1: z.string().min(1, "Address Line 1 is required").max(255),
  address2: z.string().max(255).optional(),
  city: z.string().min(1, "City is required").max(100),
  postcode: z.string().min(1, "Postcode is required").max(20),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
});

export const guestSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export const checkoutSchema = z.object({
  guest: guestSchema.optional(),
  address: addressSchema,
  user: z.object({ id: z.string() }).optional(),
}).refine((data) => !!data.user || !!data.guest, {
  message: "Guest details are required if not logged in",
  path: ["guest"],
});

export type CheckoutValidationData = z.infer<typeof checkoutSchema>;