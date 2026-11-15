export default function CategoriesLoading() {
  return (
    <div className="mx-auto w-full max-w-lg md:max-w-6xl px-4 md:px-8 py-6 md:py-8 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-10 w-10 rounded-full border border-white/10 bg-card shrink-0" />
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-xl border border-white/10 bg-card" />
          <div className="h-4 w-36 rounded-lg bg-card/70" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 h-96 rounded-2xl border border-white/10 bg-card" />
        <div className="md:col-span-7 space-y-4">
          <div className="h-6 w-40 rounded-lg bg-card/80" />
          <div className="h-24 rounded-2xl border border-white/10 bg-card" />
          <div className="h-24 rounded-2xl border border-white/10 bg-card" />
          <div className="h-24 rounded-2xl border border-white/10 bg-card" />
          <div className="h-24 rounded-2xl border border-white/10 bg-card" />
        </div>
      </div>
    </div>
  );
}
