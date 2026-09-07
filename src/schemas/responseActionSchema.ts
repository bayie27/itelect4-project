import { z } from "zod";

export const responseActionSchema = z
  .object({
    incidentId: z.string().min(1, "Choose an incident."),
    title: z
      .string()
      .trim()
      .min(3, "Action title must be at least 3 characters."),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters."),
    priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  })
  .refine(({ title, description }) => title.toLowerCase() !== description.toLowerCase(), {
    message: "Description must add detail beyond the action title.",
    path: ["description"],
  });

export type ResponseActionFormValues = z.infer<typeof responseActionSchema>;
