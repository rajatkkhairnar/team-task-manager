import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import ManagerDashboard from "@/components/dashboard/manager-dashboard";
import EmployeeDashboard from "@/components/dashboard/employee-dashboard";

export const metadata: Metadata = {
  title: "Dashboard — Team Task Manager",
  description: "View your tasks, projects, and team overview.",
};

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const now = new Date();

  if (user.role === "ADMIN") {
    const [members, projects, allTasks] = await Promise.all([
      prisma.user.count({ where: { company_id: user.company_id } }),
      prisma.project.count({ where: { company_id: user.company_id } }),
      prisma.task.findMany({
        where: { project: { company_id: user.company_id } },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
        },
      }),
    ]);

    const company = await prisma.company.findUnique({
      where: { id: user.company_id },
    });

    const todoCount = allTasks.filter((t) => t.status === "TODO").length;
    const inProgressCount = allTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const doneCount = allTasks.filter((t) => t.status === "DONE").length;
    const overdueTasks = allTasks.filter(
      (t) => t.due_date && t.due_date < now && t.status !== "DONE"
    );

    return (
      <div className="max-w-[1100px] mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#0F172A]">
            Welcome back, {user.name}
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">Admin Dashboard</p>
        </div>
        <AdminDashboard
          stats={{ totalMembers: members, totalProjects: projects, todoCount, inProgressCount, doneCount, overdueCount: overdueTasks.length }}
          overdueTasks={overdueTasks.map((t) => ({
            id: t.id,
            title: t.title,
            due_date: t.due_date!.toISOString(),
            project: t.project,
            assignee: t.assignee,
          }))}
          companyCode={company?.company_code || ""}
          companyName={company?.name || ""}
        />
      </div>
    );
  }

  if (user.role === "MANAGER") {
    const projects = await prisma.project.findMany({
      where: { company_id: user.company_id, owner_id: user.id },
      include: {
        _count: { select: { members: true, tasks: true } },
        tasks: { select: { status: true, due_date: true } },
      },
    });

    const allTasks = await prisma.task.findMany({
      where: { project: { company_id: user.company_id, owner_id: user.id } },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    const todoCount = allTasks.filter((t) => t.status === "TODO").length;
    const inProgressCount = allTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const doneCount = allTasks.filter((t) => t.status === "DONE").length;
    const overdueTasks = allTasks.filter(
      (t) => t.due_date && t.due_date < now && t.status !== "DONE"
    );

    return (
      <div className="max-w-[1100px] mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#0F172A]">
            Welcome back, {user.name}
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">Manager Dashboard</p>
        </div>
        <ManagerDashboard
          projects={projects.map((p) => ({
            id: p.id,
            name: p.name,
            _count: p._count,
            tasks: p.tasks.map((t) => ({
              status: t.status,
              due_date: t.due_date?.toISOString() || null,
            })),
          }))}
          stats={{ todoCount, inProgressCount, doneCount, overdueCount: overdueTasks.length }}
          overdueTasks={overdueTasks.map((t) => ({
            id: t.id,
            title: t.title,
            due_date: t.due_date!.toISOString(),
            project: t.project,
            assignee: t.assignee,
          }))}
        />
      </div>
    );
  }

  // EMPLOYEE
  const [tasks, projects] = await Promise.all([
    prisma.task.findMany({
      where: {
        assignee_id: user.id,
        project: { company_id: user.company_id },
      },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.project.findMany({
      where: {
        company_id: user.company_id,
        members: { some: { user_id: user.id } },
      },
      include: {
        _count: { select: { members: true, tasks: true } },
      },
    }),
  ]);

  return (
    <div className="max-w-[1100px] mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#0F172A]">
          Welcome back, {user.name}
        </h1>
        <p className="text-sm text-[#64748B] mt-0.5">My Tasks</p>
      </div>
      <EmployeeDashboard
        tasks={tasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          due_date: t.due_date?.toISOString() || null,
          project: t.project,
        }))}
        projects={projects.map((p) => ({
          id: p.id,
          name: p.name,
          _count: p._count,
        }))}
      />
    </div>
  );
}
