import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";

const initialSlot = {
  code: "",
  level: "",
  vehicleType: "car",
  status: "available"
};

export default function AdminPage() {
  const [slotForm, setSlotForm] = useState(initialSlot);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadBookings() {
    const { data } = await api.get("/bookings");
    setBookings(data);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/parking", slotForm);
      setSlotForm(initialSlot);
      setMessage("Parking slot created.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to add slot");
    }
  }

  return (
    <Layout>
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="glass-panel rounded-[2rem] p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-brand-300">Admin Panel</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white">Add inventory and audit bookings</h1>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Slot code</span>
              <input
                value={slotForm.code}
                onChange={(event) => setSlotForm({ ...slotForm, code: event.target.value })}
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
                placeholder="B-01"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Level</span>
              <input
                value={slotForm.level}
                onChange={(event) => setSlotForm({ ...slotForm, level: event.target.value })}
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
                placeholder="Level 1"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Vehicle type</span>
                <select
                  value={slotForm.vehicleType}
                  onChange={(event) => setSlotForm({ ...slotForm, vehicleType: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="ev">EV</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Status</span>
                <select
                  value={slotForm.status}
                  onChange={(event) => setSlotForm({ ...slotForm, status: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="occupied">Occupied</option>
                  <option value="blocked">Blocked</option>
                </select>
              </label>
            </div>
            {message ? (
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {message}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white shadow-glow transition hover:bg-brand-400"
            >
              Add Slot
            </button>
          </form>
        </section>

        <section className="glass-panel rounded-[2rem] p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-brand-300">All Bookings</p>
          <div className="mt-6 space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-display text-xl font-semibold text-white">
                      {booking.slotCode} • {booking.userName}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{booking.userEmail}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">
                    {booking.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
                  <p>Amount: <span className="font-semibold text-white">Rs. {booking.amount}</span></p>
                  <p>Payment: <span className="font-semibold text-white">{booking.paymentStatus}</span></p>
                  <p>Created: <span className="font-semibold text-white">{new Date(booking.createdAt).toLocaleString()}</span></p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
