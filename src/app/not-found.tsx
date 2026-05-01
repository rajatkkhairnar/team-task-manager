import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-8 h-8 text-[#94A3B8]" />
        </div>
        <h1 className="text-4xl font-bold text-[#0F172A] mb-2">404</h1>
        <p className="text-lg text-[#64748B] mb-1">Page not found</p>
        <p className="text-sm text-[#94A3B8] max-w-[360px] mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or you don&apos;t
          have permission to access it.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center mt-6 h-9 px-4 rounded-lg text-sm font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
