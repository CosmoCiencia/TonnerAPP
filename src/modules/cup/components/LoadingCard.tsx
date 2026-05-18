function LoadingCard() {
  return (
    <div className="cup-card animate-pulse space-y-4">
      <div className="h-4 w-32 rounded-full bg-slate-200" />
      <div className="h-12 rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-12 rounded-2xl bg-slate-200" />
        <div className="h-12 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

export default LoadingCard;
