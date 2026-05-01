export default function MembersLoading() {
  return (
    <div className="max-w-[1100px] mx-auto p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 w-28 bg-[#E2E8F0] rounded-lg" />
          <div className="h-4 w-36 bg-[#F1F5F9] rounded mt-2" />
        </div>
        <div className="h-4 w-20 bg-[#F8F9FA] rounded" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="border-b border-[#E2E8F0] bg-[#F8F9FA] px-4 py-3 flex gap-4">
          <div className="h-3 w-20 bg-[#E2E8F0] rounded" />
          <div className="h-3 w-24 bg-[#E2E8F0] rounded hidden sm:block" />
          <div className="h-3 w-12 bg-[#E2E8F0] rounded" />
          <div className="h-3 w-16 bg-[#E2E8F0] rounded hidden md:block" />
          <div className="h-3 w-16 bg-[#E2E8F0] rounded hidden md:block" />
        </div>

        {/* Table rows */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="border-b border-[#F1F5F9] last:border-0 px-4 py-3 flex items-center gap-4"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-7 h-7 bg-[#F1F5F9] rounded-full flex-shrink-0" />
              <div>
                <div className="h-4 w-32 bg-[#E2E8F0] rounded" />
                <div className="h-3 w-40 bg-[#F8F9FA] rounded mt-1" />
              </div>
            </div>
            <div className="h-5 w-20 bg-[#F1F5F9] rounded-full hidden sm:block" />
            <div className="h-4 w-6 bg-[#F8F9FA] rounded hidden md:block" />
            <div className="h-3 w-20 bg-[#F8F9FA] rounded hidden md:block" />
            <div className="h-4 w-4 bg-[#F8F9FA] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
