export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent" />
        <p className="text-sm text-ink-500">Loading article...</p>
      </div>
    </div>
  );
}
