import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { loginSchema, type LoginFormValues } from "../schemas/authSchema";

const fieldErrorClass = "mt-1 text-sm text-red-700 dark:text-red-300";

export function LoginPage() {
  const [requestError, setRequestError] = useState<string | null>(null);
  const saveSession = useAuthStore((state) => state.login);
  const sessionMessage = useAuthStore((state) => state.sessionMessage);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setRequestError(null);
    try {
      const session = await login(values);
      saveSession(session.token, session.user);
      navigate("/", { replace: true });
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Could not log in.");
    }
  };

  return (
    <section className="mx-auto max-w-sm">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Log in</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Sign in to the fictional CIRS training room.
      </p>
      {sessionMessage && (
        <p className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200" role="status">
          {sessionMessage} Please log in again.
        </p>
      )}
      {requestError && (
        <p className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300" role="alert">
          {requestError}
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
        <div className="grid gap-1.5">
          <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "login-email-error" : undefined}
          />
          {errors.email && <p id="login-email-error" className={fieldErrorClass} role="alert">{errors.email.message}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "login-password-error" : undefined}
          />
          {errors.password && <p id="login-password-error" className={fieldErrorClass} role="alert">{errors.password.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Log in"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        Need a fictional training account? <Link className="text-cyan-700 underline dark:text-cyan-300" to="/register">Register</Link>
      </p>
    </section>
  );
}
