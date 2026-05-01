"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-[1100px] mx-auto p-6">
      <div className="bg-white border border-red-200 rounded-xl p-8 shadow-sm text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-[#DC2626]" />
        </div>
        <h2 className="text-lg font-semibold text-[#0F172A] mb-1">
          Something went wrong
        </h2>
        <p className="text-sm text-[#64748B] mb-6 max-w-[400px] mx-auto">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center h-8 px-3 rounded-lg text-sm font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center h-8 px-3 rounded-lg text-sm font-medium border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
