export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-7 animate-pulse">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <div className="h-3 w-24 bg-gray-200 rounded mb-3"></div>
          <div className="h-10 w-20 bg-gray-200 rounded mb-4"></div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
      </div>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
      <div className="border-b border-gray-100 p-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      <div className="p-6">
        <div className="h-[340px] bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  )
}
