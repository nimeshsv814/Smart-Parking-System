const statusStyles = {
  available: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
  reserved: "border-amber-400/40 bg-amber-500/15 text-amber-100",
  occupied: "border-rose-400/40 bg-rose-500/15 text-rose-100",
  blocked: "border-slate-400/40 bg-slate-500/15 text-slate-100"
};

export default function SlotCard({ slot, canManage, onManage, onBook }) {
  return (
    <div className={`rounded-3xl border p-5 transition hover:-translate-y-1 ${statusStyles[slot.status]}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xl font-semibold">{slot.code}</p>
          <p className="mt-1 text-sm opacity-80">{slot.level}</p>
        </div>
        <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.2em]">
          {slot.vehicleType}
        </span>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          {slot.status}
        </span>
        {slot.status === "available" && onBook ? (
          <button
            onClick={() => onBook(slot)}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:scale-105"
          >
            Book Now
          </button>
        ) : null}
      </div>
      {canManage ? (
        <select
          value={slot.status}
          onChange={(event) => onManage(slot._id, event.target.value)}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="occupied">Occupied</option>
          <option value="blocked">Blocked</option>
        </select>
      ) : null}
    </div>
  );
}
