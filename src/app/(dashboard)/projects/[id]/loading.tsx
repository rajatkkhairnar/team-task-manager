export default function ProjectDetailLoading() {
  return (
    <div className="max-w-[1100px] mx-auto p-6 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-3.5 w-16 bg-[#F1F5F9] rounded" />
        <div className="h-3.5 w-3 bg-[#F1F5F9] rounded" />
        <div className="h-3.5 w-28 bg-[#F1F5F9] rounded" />
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="h-7 w-64 bg-[#E2E8F0] rounded-lg" />
        <div className="h-4 w-96 bg-[#F1F5F9] rounded mt-2" />
        <div className="h-3 w-28 bg-[#F8F9FA] rounded mt-2" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-8 w-24 bg-[#E2E8F0] rounded-lg" />
        <div className="h-8 w-28 bg-[#F1F5F9] rounded-lg" />
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-7 w-20 bg-[#F1F5F9] rounded-full" />
        ))}
      </div>

      {/* Task list skeleton */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#F1F5F9] rounded-full" />
                <div>
                  <div className="h-4 w-48 bg-[#E2E8F0] rounded" />
                  <div className="h-3 w-24 bg-[#F8F9FA] rounded mt-1" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-[#F1F5F9] rounded-full" />
                <div className="h-5 w-20 bg-[#F8F9FA] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
