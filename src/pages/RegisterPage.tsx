import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register as registerAccount } from "../api/client";
import { registrationSchema, type RegistrationFormValues } from "../schemas/authSchema";
import { useAuthStore } from "../store/authStore";
import { UserRole } from "../types";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
const fieldErrorClass = "mt-1 text-sm text-red-700 dark:text-red-300";

export function RegisterPage() {
  const [requestError, setRequestError] = useState<string | null>(null);
  const saveSession = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: UserRole.RESPONDER,
    },
  });

  const onSubmit = async (values: RegistrationFormValues): Promise<void> => {
    setRequestError(null);
    try {
      const session = await registerAccount(values);
      saveSession(session.token, session.user);
      navigate("/", { replace: true });
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Could not register the account.");
    }
  };

  return (
    <section className="mx-auto max-w-sm">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Register</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Create a fictional account for the CIRS training room.
      </p>
      {requestError && (
        <p className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300" role="alert">
          {requestError}
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
        <div className="grid gap-1.5">
          <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Display name</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            {...register("name")}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "register-name-error" : undefined}
          />
          {errors.name && <p id="register-name-error" className={fieldErrorClass} role="alert">{errors.name.message}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "register-email-error" : undefined}
          />
          {errors.email && <p id="register-email-error" className={fieldErrorClass} role="alert">{errors.email.message}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "register-password-error" : undefined}
          />
          {errors.password && <p id="register-password-error" className={fieldErrorClass} role="alert">{errors.password.message}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="role" className="text-slate-700 dark:text-slate-300">CIRS role</Label>
          <select
            id="role"
            {...register("role")}
            aria-invalid={errors.role ? true : undefined}
            aria-describedby={errors.role ? "register-role-error" : undefined}
            className={inputClass}
          >
            <option value={UserRole.RESPONDER}>Responder</option>
            <option value={UserRole.INCIDENT_COMMANDER}>Incident commander</option>
          </select>
          {errors.role && <p id="register-role-error" className={fieldErrorClass} role="alert">{errors.role.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        Already registered? <Link className="text-cyan-700 underline dark:text-cyan-300" to="/login">Log in</Link>
      </p>
    </section>
  );
}
