import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import api from "../api";

export default function DashboardPage() {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [slotsResponse, bookingsResponse, notificationsResponse] = await Promise.all([
          api.get("/parking"),
          api.get("/bookings"),
          api.get("/notifications")
        ]);

        setSlots(slotsResponse.data);
        setBookings(bookingsResponse.data);
        setNotifications(notificationsResponse.data);
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, []);

  const stats = useMemo(() => {
    const available = slots.filter((slot) => slot.status === "available").length;
    const reserved = slots.filter((slot) => slot.status === "reserved").length;
    const occupied = slots.filter((slot) => slot.status === "occupied").length;
    return { available, reserved, occupied };
  }, [slots]);

  return (
    <Layout>
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="glass-panel rounded-[2rem] p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-brand-300">Dashboard</p>
            <h1 className="mt-4 font-display text-4xl font-bold text-white">System snapshot</h1>
            <p className="mt-4 max-w-2xl text-slate-300">
              View slot utilization, booking state, and recent notification activity in one place.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <StatCard label="Available Slots" value={stats.available} accent="bg-emerald-400" />
              <StatCard label="Reserved Slots" value={stats.reserved} accent="bg-amber-400" />
              <StatCard label="Occupied Slots" value={stats.occupied} accent="bg-rose-400" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {bookings.slice(0, 4).map((booking) => (
              <div key={booking._id} className="glass-panel rounded-3xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-semibold text-white">{booking.slotCode}</p>
                    <p className="text-sm text-slate-400">{booking.userName}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">
                    {booking.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-300">
                  Amount: <span className="font-semibold text-white">Rs. {booking.amount}</span>
                </p>
                <p className="mt-1 text-sm text-slate-400">Payment: {booking.paymentStatus}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.25em] text-brand-300">Notifications</p>
          <div className="mt-6 space-y-4">
            {notifications.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                Notifications will appear here after system activity.
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{notification.message}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{notification.type}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
