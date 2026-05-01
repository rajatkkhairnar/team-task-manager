import { redirect, notFound } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TaskDetail from "@/components/tasks/task-detail";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true, company_id: true, owner_id: true } },
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true } },
      comments: {
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!task || task.project.company_id !== user.company_id) notFound();

  // Access check
  if (user.role !== "ADMIN") {
    const isMember = await prisma.projectMember.findFirst({
      where: { project_id: task.project_id, user_id: user.id },
    });
    if (!isMember && task.project.owner_id !== user.id) notFound();
  }

  const canEdit = user.role === "ADMIN" || task.project.owner_id === user.id;
  const canDelete = user.role === "ADMIN" || task.project.owner_id === user.id;
  const canChangeStatus = canEdit || (user.role === "EMPLOYEE" && task.assignee_id === user.id);

  return (
    <div className="max-w-[1100px] mx-auto p-6">
      <TaskDetail
        task={{
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          due_date: task.due_date?.toISOString() || null,
          project: task.project,
          assignee: task.assignee,
          creator: task.creator,
          created_at: task.created_at.toISOString(),
        }}
        comments={task.comments.map((c) => ({
          id: c.id,
          body: c.body,
          author: c.author,
          created_at: c.created_at.toISOString(),
        }))}
        currentUserId={user.id}
        currentUserRole={user.role}
        canEdit={canEdit}
        canDelete={canDelete}
        canChangeStatus={canChangeStatus}
      />
    </div>
  );
}
