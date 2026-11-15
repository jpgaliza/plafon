export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-lg md:max-w-6xl px-4 md:px-8 py-6 md:py-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-44 rounded-xl border border-border dark:border-white/10 bg-card" />
        <div className="h-4 w-56 rounded-lg bg-card/70" />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 rounded-2xl border border-border dark:border-white/10 bg-card" />
        <div className="grid grid-cols-2 md:col-span-2 gap-3 md:gap-4">
          <div className="h-32 rounded-xl border border-border dark:border-white/10 bg-card" />
          <div className="h-32 rounded-xl border border-border dark:border-white/10 bg-card" />
        </div>
      </div>

      <div className="mt-6 md:mt-8 flex flex-col md:grid md:grid-cols-3 md:gap-8">
        <div className="md:col-span-2 order-2 md:order-1 mt-8 md:mt-0 space-y-3">
          <div className="h-6 w-48 rounded-lg bg-card/80" />
          <div className="h-16 rounded-xl border border-border dark:border-white/10 bg-card" />
          <div className="h-16 rounded-xl border border-border dark:border-white/10 bg-card" />
          <div className="h-16 rounded-xl border border-border dark:border-white/10 bg-card" />
        </div>
        <div className="md:col-span-1 order-1 md:order-2 h-72 rounded-2xl border border-border dark:border-white/10 bg-card" />
      </div>
    </div>
  );
}
