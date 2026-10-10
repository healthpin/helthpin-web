export default function HospitalLoading() {
  return <div role="status" aria-label="Loading hospital dashboard" className="animate-pulse space-y-6">
    <div className="h-9 w-60 rounded-xl bg-line/60" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((key) => <div key={key} className="h-40 rounded-2xl border border-line bg-surface" />)}</div>
    <div className="h-72 rounded-2xl border border-line bg-surface" /><span className="sr-only">Loading...</span>
  </div>;
}
