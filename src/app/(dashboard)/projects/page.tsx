import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProjectsList from "@/components/projects/projects-list";

export const metadata: Metadata = {
  title: "Projects — Team Task Manager",
  description: "Browse and manage your team projects.",
};

export default async function ProjectsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  let projects;
  if (user.role === "ADMIN") {
    projects = await prisma.project.findMany({
      where: { company_id: user.company_id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } },
      },
      orderBy: { created_at: "desc" },
    });
  } else if (user.role === "MANAGER") {
    projects = await prisma.project.findMany({
      where: { company_id: user.company_id, owner_id: user.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } },
      },
      orderBy: { created_at: "desc" },
    });
  } else {
    projects = await prisma.project.findMany({
      where: {
        company_id: user.company_id,
        members: { some: { user_id: user.id } },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }

  return (
    <div className="max-w-[1100px] mx-auto p-6">
      <ProjectsList
        projects={projects.map((p) => ({
          ...p,
          created_at: p.created_at.toISOString(),
        }))}
        canCreate={user.role === "ADMIN" || user.role === "MANAGER"}
      />
    </div>
  );
}
