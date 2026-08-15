import { NavLink, Outlet } from "react-router";
import { useAuthStore } from "../store/authStore";
import { useToggle } from "../hooks/useToggle";

const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
      : "text-slate-600 hover:text-cyan-700 dark:text-slate-400 dark:hover:text-cyan-300"
  }`;

const secondaryButtonClass =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-cyan-400 hover:text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-cyan-300";

export function Layout() {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [isDarkMode, toggleDarkMode] = useToggle(false);

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        <header className="border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-mono text-lg font-bold tracking-tight text-slate-900 dark:text-cyan-300">
                Incident command room
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Typed mock incident-response components.
              </p>
            </div>
            <nav className="flex flex-wrap items-center gap-1">
              <NavLink to="/" end className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/evidence" className={navLinkClass}>
                Evidence
              </NavLink>
              <NavLink to="/actions" className={navLinkClass}>
                Actions
              </NavLink>
              {token === null ? (
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
              ) : (
                <button type="button" onClick={logout} className={secondaryButtonClass}>
                  Logout
                </button>
              )}
              <button type="button" onClick={toggleDarkMode} className={secondaryButtonClass}>
                {isDarkMode ? "Light mode" : "Dark mode"}
              </button>
            </nav>
          </div>
        </header>
        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
