import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MembersList from "@/components/members/members-list";

export const metadata: Metadata = {
  title: "Members — Team Task Manager",
  description: "Manage your team members and their roles.",
};

export default async function MembersPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  // Admin only
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [members, company] = await Promise.all([
    prisma.user.findMany({
      where: { company_id: user.company_id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        _count: { select: { project_memberships: true } },
      },
      orderBy: { created_at: "asc" },
    }),
    prisma.company.findUnique({
      where: { id: user.company_id },
      select: { admin_id: true },
    }),
  ]);

  return (
    <div className="max-w-[1100px] mx-auto p-6">
      <MembersList
        members={members.map((m) => ({
          ...m,
          created_at: m.created_at.toISOString(),
        }))}
        currentUserId={user.id}
        adminId={company?.admin_id || ""}
      />
    </div>
  );
}
