export default function DashboardLoading() {
  return (
    <div className="max-w-[1100px] mx-auto p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-7 w-56 bg-[#E2E8F0] rounded-lg" />
        <div className="h-4 w-32 bg-[#F1F5F9] rounded mt-2" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="h-4 w-24 bg-[#F1F5F9] rounded" />
                <div className="h-8 w-16 bg-[#E2E8F0] rounded mt-2" />
              </div>
              <div className="w-10 h-10 bg-[#F1F5F9] rounded-lg" />
            </div>
            <div className="h-1 w-12 bg-[#F1F5F9] rounded-full mt-4" />
          </div>
        ))}
      </div>

      {/* Second row of stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="h-4 w-20 bg-[#F1F5F9] rounded" />
                <div className="h-8 w-12 bg-[#E2E8F0] rounded mt-2" />
              </div>
              <div className="w-10 h-10 bg-[#F1F5F9] rounded-lg" />
            </div>
            <div className="h-1 w-12 bg-[#F1F5F9] rounded-full mt-4" />
          </div>
        ))}
      </div>

      {/* Quick links skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F1F5F9] rounded-lg" />
              <div>
                <div className="h-4 w-32 bg-[#E2E8F0] rounded" />
                <div className="h-3 w-44 bg-[#F1F5F9] rounded mt-1.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
