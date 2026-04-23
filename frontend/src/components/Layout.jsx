import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-medium transition ${
          isActive ? "bg-brand-500 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-lg font-bold text-white shadow-glow">
              P
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-white">Smart Parking</p>
              <p className="text-xs text-slate-400">Microservices dashboard</p>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            <NavItem to="/" label="Dashboard" />
            <NavItem to="/slots" label="Parking Slots" />
            <NavItem to="/bookings" label="Bookings" />
            {user?.role === "admin" ? <NavItem to="/admin" label="Admin Panel" /> : null}
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-brand-300">{user?.role}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/auth");
              }}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-brand-400 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
