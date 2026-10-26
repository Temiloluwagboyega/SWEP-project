import { z } from "zod";
import { categories, channels, statuses } from "./constants";
export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(100),
    email: z
      .email("Enter a valid email address.")
      .trim()
      .toLowerCase()
      .max(254),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(72, "This password is too long. Use a shorter password.")
      .refine(
        (value) => new TextEncoder().encode(value).length <= 72,
        "This password is too long. Use a shorter password.",
      ),
  })
  .strict();
export const loginSchema = registerSchema.pick({ email: true, password: true });
const editable = {
  category: z.enum(categories, { error: "Choose an incident category." }),
  locationId: z.string().min(1, "Choose a campus location."),
  locationNote: z
    .string()
    .trim()
    .max(200, "Use at most 200 characters.")
    .default(""),
  description: z
    .string()
    .trim()
    .min(20, "Add at least 20 characters to describe the incident.")
    .max(2000, "Use at most 2,000 characters."),
  urgent: z.boolean().default(false),
  confidential: z.boolean().default(false),
};
export const reportSchema = z
  .object({
    ...editable,
    occurredAt: z.iso
      .datetime({ offset: true })
      .refine(
        (v) => new Date(v).getTime() <= Date.now(),
        "Incident time cannot be in the future.",
      ),
    channel: z.enum(channels, { error: "Choose who receives your report." }),
  })
  .strict();
export const editSchema = z.object(editable).strict();
export const statusSchema = z
  .object({
    toStatus: z.enum(statuses),
    publicNote: z.string().trim().max(500).optional(),
    internalNote: z.string().trim().max(1000).optional(),
  })
  .strict();
export const assignSchema = z
  .object({ assigneeId: z.string().min(1) })
  .strict();
export const referSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(5, "Give a referral reason (at least 5 characters).")
      .max(500),
  })
  .strict();
