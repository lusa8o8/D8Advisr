export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="h-48 bg-gray-200 rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  )
}