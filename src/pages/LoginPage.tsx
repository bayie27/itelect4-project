import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
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
        <label className="block text-sm text-slate-700 dark:text-slate-300">
          Username
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="responder"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <button
          type="submit"
          className="inline-flex items-center rounded-md border border-cyan-500/50 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-700 transition-colors hover:border-cyan-400 hover:bg-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 dark:text-cyan-300"
        >
          Log in
        </button>
      </form>
    </section>
  );
}
