import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    login(`fake-token-${username || "responder"}`);
    navigate("/");
  };

  return (
    <section className="mx-auto max-w-sm">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Log in</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Fictional login for this training simulator — no real credentials, no backend yet.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="grid gap-1.5">
          <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">
          Username
          </Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="responder"
          />
        </div>
        <Button type="submit">
          Log in
        </Button>
      </form>
    </section>
  );
}
