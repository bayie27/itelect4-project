import { z } from "zod";

export const incidentReportContentSchema = z
  .object({
    executiveSummary: z.string(),
    incidentOverview: z.string(),
    evidenceReviewed: z.array(z.string()).min(1).max(8),
    responseTimeline: z.array(z.string()).min(1).max(12),
    containmentAndResolution: z.string(),
    lessonsLearned: z.array(z.string()).min(1).max(4),
    recommendations: z.array(z.string()).min(1).max(4),
    dataCoverage: z.enum(["sufficient", "partial", "insufficient"]),
  })
  .strict();

export type IncidentReportContent = z.infer<typeof incidentReportContentSchema>;

export const reviewFormSchema = z
  .object({
    incidentId: z.string().regex(/^[a-f\d]{24}$/i, "Select a resolved incident."),
    prompt: z
      .string()
      .trim()
      .min(20, "Describe the report focus in at least 20 characters.")
      .max(2000, "Keep the report focus under 2000 characters."),
  })
  .strict();

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
