import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function BookingsPage() {
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

  async function handlePayment(bookingId, success) {
    setMessage("");
    setError("");

    try {
      await api.post("/payments", { bookingId, success });
      setMessage(success ? "Payment completed and booking confirmed." : "Payment failed and slot released.");
      await loadBookings();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to process payment");
    }
  }

  async function handleCancel(bookingId) {
    setMessage("");
    setError("");

    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setMessage("Booking cancelled.");
      await loadBookings();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to cancel booking");
    }
  }

  return (
    <Layout>
      <section className="glass-panel rounded-[2rem] p-8">
        <p className="text-sm uppercase tracking-[0.25em] text-brand-300">Bookings</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-white">Reservation and payment center</h1>

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

        <div className="mt-8 grid gap-5">
          {bookings.map((booking) => (
            <div key={booking._id} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-display text-2xl font-semibold text-white">{booking.slotCode}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {booking.userName} • Amount Rs. {booking.amount}
                  </p>
                  <p className="mt-3 text-sm text-slate-300">
                    Status: <span className="font-semibold text-white">{booking.status}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Payment: <span className="font-semibold text-white">{booking.paymentStatus}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Expires: {new Date(booking.expiresAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {booking.status === "pending_payment" ? (
                    <>
                      <button
                        onClick={() => handlePayment(booking._id, true)}
                        className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                      >
                        Pay Success
                      </button>
                      <button
                        onClick={() => handlePayment(booking._id, false)}
                        className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                      >
                        Pay Failure
                      </button>
                    </>
                  ) : null}
                  {(booking.status === "pending_payment" || booking.status === "confirmed") && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-rose-400 hover:text-rose-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {bookings.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
              No bookings available yet.
            </div>
          ) : null}
        </div>
      </section>
    </Layout>
  );
}
