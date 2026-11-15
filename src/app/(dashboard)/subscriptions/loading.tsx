export default function SubscriptionsLoading() {
  return (
    <div className="mx-auto w-full max-w-lg md:max-w-6xl px-4 md:px-8 py-6 md:py-8 space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-xl border border-white/10 bg-card" />
          <div className="h-4 w-64 rounded-lg bg-card/70" />
        </div>
        <div className="h-10 w-40 rounded-xl border border-white/10 bg-card shrink-0" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-28 rounded-2xl border border-white/10 bg-card" />
        <div className="h-28 rounded-2xl border border-white/10 bg-card" />
        <div className="h-28 rounded-2xl border border-white/10 bg-card" />
      </div>

      <div className="h-10 w-64 rounded-xl border border-white/10 bg-card" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="h-24 rounded-2xl border border-white/10 bg-card" />
        <div className="h-24 rounded-2xl border border-white/10 bg-card" />
        <div className="h-24 rounded-2xl border border-white/10 bg-card" />
        <div className="h-24 rounded-2xl border border-white/10 bg-card" />
      </div>
    </div>
  );
}
