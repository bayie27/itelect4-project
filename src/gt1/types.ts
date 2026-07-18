// Types used only by the original JavaScript-to-TypeScript conversion exercise.
// They are intentionally separate from the reusable CIRS domain model.
export interface GTUser {
  id: number;
  name: string;
  email: string;
  role: "student" | "admin" | "instructor";
  isActive: boolean;
  score: number;
}
