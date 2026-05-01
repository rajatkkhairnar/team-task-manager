export default function TaskDetailLoading() {
  return (
    <div className="max-w-[1100px] mx-auto p-6 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-3.5 w-16 bg-[#F1F5F9] rounded" />
        <div className="h-3.5 w-3 bg-[#F1F5F9] rounded" />
        <div className="h-3.5 w-28 bg-[#F1F5F9] rounded" />
        <div className="h-3.5 w-3 bg-[#F1F5F9] rounded" />
        <div className="h-3.5 w-36 bg-[#F1F5F9] rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Title + description card */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
            <div className="h-6 w-72 bg-[#E2E8F0] rounded-lg" />
            <div className="space-y-2 mt-4">
              <div className="h-3.5 w-full bg-[#F1F5F9] rounded" />
              <div className="h-3.5 w-4/5 bg-[#F1F5F9] rounded" />
              <div className="h-3.5 w-3/5 bg-[#F8F9FA] rounded" />
            </div>
          </div>

          {/* Comments card */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-[#E2E8F0]">
              <div className="h-4 w-28 bg-[#E2E8F0] rounded" />
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-[#F1F5F9] rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex gap-2">
                        <div className="h-3.5 w-24 bg-[#E2E8F0] rounded" />
                        <div className="h-3.5 w-28 bg-[#F8F9FA] rounded" />
                      </div>
                      <div className="h-3.5 w-full bg-[#F1F5F9] rounded mt-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#FAFBFC] rounded-b-xl">
              <div className="h-16 w-full bg-[#F1F5F9] rounded-lg" />
            </div>
          </div>
        </div>

        {/* Right column — metadata sidebar */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm"
            >
              <div className="h-3 w-16 bg-[#F8F9FA] rounded mb-2" />
              <div className="h-5 w-28 bg-[#E2E8F0] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
