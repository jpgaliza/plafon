export default function TransactionsLoading() {
  return (
    <div className="mx-auto w-full max-w-lg md:max-w-6xl px-4 md:px-8 py-6 md:py-8 space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-xl border border-white/10 bg-card" />
          <div className="h-4 w-64 rounded-lg bg-card/70" />
        </div>
        <div className="h-10 w-36 rounded-xl border border-white/10 bg-card shrink-0" />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="h-11 flex-1 rounded-xl border border-white/10 bg-card" />
        <div className="h-11 w-full sm:w-56 rounded-xl border border-white/10 bg-card shrink-0" />
      </div>

      <div className="space-y-3">
        <div className="h-18 rounded-xl border border-white/10 bg-card" />
        <div className="h-18 rounded-xl border border-white/10 bg-card" />
        <div className="h-18 rounded-xl border border-white/10 bg-card" />
        <div className="h-18 rounded-xl border border-white/10 bg-card" />
        <div className="h-18 rounded-xl border border-white/10 bg-card" />
      </div>
    </div>
  );
}
