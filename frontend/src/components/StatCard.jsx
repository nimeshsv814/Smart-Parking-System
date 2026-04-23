export default function StatCard({ label, value, accent }) {
  return (
    <div className="glass-panel rounded-3xl p-5 shadow-glow">
      <p className="text-sm text-slate-400">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="font-display text-3xl font-bold text-white">{value}</p>
        <div className={`h-3 w-16 rounded-full ${accent}`} />
      </div>
    </div>
  );
}
