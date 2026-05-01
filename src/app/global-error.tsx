"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4 font-sans">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-[#DC2626]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-[#64748B] max-w-[360px] mx-auto mb-6">
            An unexpected error occurred. Please try again or contact support if
            the problem persists.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
