export default function SettingsLoading() {
  return (
    <div className="mx-auto w-full max-w-lg md:max-w-6xl px-4 md:px-8 py-6 md:py-8 space-y-6 animate-pulse">
      <div className="h-8 w-36 rounded-xl border border-border dark:border-white/10 bg-card" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-40 rounded-xl border border-border dark:border-white/10 bg-card" />
        <div className="h-40 rounded-xl border border-border dark:border-white/10 bg-card" />
        <div className="h-40 rounded-xl border border-border dark:border-white/10 bg-card" />
        <div className="h-40 rounded-xl border border-border dark:border-white/10 bg-card" />
      </div>

      <div className="h-16 rounded-xl border border-border dark:border-white/10 bg-card" />
    </div>
  );
}
