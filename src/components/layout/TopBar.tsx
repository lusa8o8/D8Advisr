export function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">
            D8Advisr
          </p>
          <p className="text-lg font-bold text-text-primary">Lusaka experience studio</p>
        </div>
        <span className="text-sm text-text-secondary">Today</span>
      </div>
    </header>
  );
}
