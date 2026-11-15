export default function GroupDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-lg md:max-w-6xl px-4 md:px-8 py-6 md:py-8 space-y-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-5 w-32 rounded-lg bg-card/70" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl border border-white/10 bg-card shrink-0" />
            <div className="space-y-2">
              <div className="h-7 w-48 rounded-xl border border-white/10 bg-card" />
              <div className="h-4 w-24 rounded-lg bg-card/70" />
            </div>
          </div>
          <div className="h-11 w-44 rounded-xl border border-white/10 bg-card shrink-0" />
        </div>
      </div>

      <div className="h-24 rounded-2xl border border-white/10 bg-card" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 h-80 rounded-2xl border border-white/10 bg-card" />
        <div className="md:col-span-2 space-y-3">
          <div className="h-6 w-44 rounded-lg bg-card/80" />
          <div className="h-16 rounded-xl border border-white/10 bg-card" />
          <div className="h-16 rounded-xl border border-white/10 bg-card" />
          <div className="h-16 rounded-xl border border-white/10 bg-card" />
        </div>
      </div>
    </div>
  );
}
