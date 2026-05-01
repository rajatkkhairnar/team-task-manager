export default function ProjectsLoading() {
  return (
    <div className="max-w-[1100px] mx-auto p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 w-32 bg-[#E2E8F0] rounded-lg" />
          <div className="h-4 w-24 bg-[#F1F5F9] rounded mt-2" />
        </div>
        <div className="h-8 w-32 bg-[#E2E8F0] rounded-lg" />
      </div>

      {/* Project card grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-[#E2E8F0] rounded" />
                <div className="h-3 w-full bg-[#F1F5F9] rounded mt-2" />
              </div>
              <div className="w-9 h-9 bg-[#F1F5F9] rounded-lg ml-3" />
            </div>
            <div className="flex gap-4 mt-4">
              <div className="h-3 w-16 bg-[#F1F5F9] rounded" />
              <div className="h-3 w-16 bg-[#F1F5F9] rounded" />
            </div>
            <div className="mt-3 pt-3 border-t border-[#F1F5F9]">
              <div className="h-2.5 w-24 bg-[#F8F9FA] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
