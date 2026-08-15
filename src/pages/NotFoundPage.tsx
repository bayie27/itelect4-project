import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Page not found</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        There is no route for this URL.
      </p>
      <Link
        to="/"
        className="mt-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-cyan-400 hover:text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-cyan-300"
      >
        Back to dashboard
      </Link>
    </section>
  );
}
