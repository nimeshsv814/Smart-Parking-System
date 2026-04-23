import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import SlotCard from "../components/SlotCard";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function SlotsPage() {
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();

  async function loadSlots() {
    const { data } = await api.get("/parking");
    setSlots(data);
  }

  useEffect(() => {
    loadSlots();
  }, []);

  async function handleBook(slot) {
    setMessage("");
    setError("");

    try {
      await api.post("/bookings", { slotId: slot._id });
      setMessage(`Slot ${slot.code} reserved. Complete payment from the bookings page.`);
      await loadSlots();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to create booking");
    }
  }

  async function handleStatusChange(slotId, status) {
    setMessage("");
    setError("");

    try {
      await api.patch(`/parking/${slotId}/status`, { status });
      setMessage(`Slot status updated to ${status}.`);
      await loadSlots();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update slot");
    }
  }

  return (
    <Layout>
      <section className="glass-panel rounded-[2rem] p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand-300">Parking Slots</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-white">Live inventory grid</h1>
            <p className="mt-3 text-slate-300">
              Green is available, yellow is reserved, and red marks occupied parking spaces.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
            Signed in as <span className="font-semibold text-white">{user.role}</span>
          </div>
        </div>

        {message ? (
          <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {slots.map((slot) => (
            <SlotCard
              key={slot._id}
              slot={slot}
              canManage={user.role === "admin"}
              onManage={handleStatusChange}
              onBook={user.role === "user" ? handleBook : undefined}
            />
          ))}
        </div>
      </section>
    </Layout>
  );
}
