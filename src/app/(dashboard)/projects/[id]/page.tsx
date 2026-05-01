import { redirect, notFound } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProjectDetail from "@/components/projects/project-detail";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, company_id: user.company_id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: {
          user: {
            select: {
              id: true, name: true, email: true, role: true,
              _count: { select: { project_memberships: true } },
            },
          },
        },
        orderBy: { joined_at: "asc" },
      },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!project) notFound();

  // Access check
  if (user.role !== "ADMIN") {
    const isMember = project.members.some((m) => m.user_id === user.id);
    const isOwner = project.owner_id === user.id;
    if (!isMember && !isOwner) notFound();
  }

  // Fetch company users for the "Add Member" dropdown
  const companyUsers = await prisma.user.findMany({
    where: { company_id: user.company_id },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });

  const canManage = user.role === "ADMIN" || project.owner_id === user.id;

  return (
    <div className="max-w-[1100px] mx-auto p-6">
      <ProjectDetail
        project={{
          id: project.id,
          name: project.name,
          description: project.description,
          owner_id: project.owner_id,
          owner: project.owner,
        }}
        tasks={project.tasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          due_date: t.due_date?.toISOString() || null,
          assignee: t.assignee,
          creator: t.creator,
          _count: t._count,
        }))}
        members={project.members.map((m) => ({
          id: m.id,
          user_id: m.user_id,
          user: m.user,
          joined_at: m.joined_at.toISOString(),
        }))}
        companyUsers={companyUsers}
        currentUserId={user.id}
        currentUserRole={user.role}
        canManage={canManage}
      />
    </div>
  );
}
