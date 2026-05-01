import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Task Manager — Authentication",
  description: "Sign in or create your workspace",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4">
      {children}
    </div>
  );
}
