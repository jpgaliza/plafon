export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-lg md:max-w-6xl px-4 md:px-8 py-6 md:py-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-44 rounded-xl bg-card border border-white/10" />
        <div className="h-4 w-56 rounded-lg bg-card/70" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 rounded-2xl border border-white/10 bg-card" />
        <div className="h-32 rounded-2xl border border-white/10 bg-card" />
        <div className="h-32 rounded-2xl border border-white/10 bg-card" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <div className="h-16 rounded-xl border border-white/10 bg-card" />
          <div className="h-16 rounded-xl border border-white/10 bg-card" />
          <div className="h-16 rounded-xl border border-white/10 bg-card" />
        </div>
        <div className="h-64 rounded-2xl border border-white/10 bg-card" />
      </div>
    </div>
  );
}
