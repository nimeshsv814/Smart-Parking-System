import { useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "user"
};

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              role: form.role
            };

      const { data } = await api.post(endpoint, payload);
      login(data);
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-panel rounded-[2rem] p-8 lg:p-12">
          <p className="inline-block rounded-full bg-brand-500/20 px-4 py-2 text-sm text-brand-100">
            Fully working smart parking platform
          </p>
          <h1 className="mt-6 font-display text-5xl font-bold text-white">
            Reserve, pay, and manage parking without losing sight of availability.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            Gateway-routed microservices, real-time slot visibility, seeded admin access, and automatic release for unpaid bookings.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["10 seeded slots", "Ready on first startup"],
              ["JWT login", "Persistent role-based access"],
              ["Auto-expiry", "Scheduler releases unpaid bookings"]
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="font-display text-lg font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5 text-sm text-emerald-100">
            Admin login: <span className="font-semibold">admin@test.com</span> / <span className="font-semibold">admin123</span>
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-8">
          <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                mode === "login" ? "bg-white text-slate-900" : "text-slate-300"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                mode === "register" ? "bg-white text-slate-900" : "text-slate-300"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === "register" ? (
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Full name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
                  placeholder="Alex Parker"
                />
              </label>
            ) : null}
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
                placeholder="Enter password"
              />
            </label>
            {mode === "register" ? (
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Role</span>
                <select
                  value={form.role}
                  onChange={(event) => setForm({ ...form, role: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white shadow-glow transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
