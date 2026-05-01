"use client";

import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import UserAvatar from "@/components/user-avatar";
import EmptyState from "@/components/empty-state";
import { formatDate } from "@/lib/format-date";
import { FolderKanban, ListTodo, AlertTriangle, Clock, ClipboardList, Users } from "lucide-react";
import Link from "next/link";

interface ProjectSummary {
  id: string;
  name: string;
  _count: { members: number; tasks: number };
  tasks: Array<{ status: string; due_date: string | null }>;
}

interface ManagerDashboardProps {
  projects: ProjectSummary[];
  stats: {
    todoCount: number;
    inProgressCount: number;
    doneCount: number;
    overdueCount: number;
  };
  overdueTasks: Array<{
    id: string;
    title: string;
    due_date: string;
    project: { id: string; name: string };
    assignee: { id: string; name: string } | null;
  }>;
}

export default function ManagerDashboard({
  projects,
  stats,
  overdueTasks,
}: ManagerDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Projects" value={projects.length} icon={FolderKanban} accentColor="#8B5CF6" />
        <StatCard label="To Do" value={stats.todoCount} icon={ListTodo} accentColor="#64748B" />
        <StatCard label="In Progress" value={stats.inProgressCount} icon={Clock} accentColor="#D97706" />
        <StatCard label="Overdue" value={stats.overdueCount} icon={AlertTriangle} accentColor={stats.overdueCount > 0 ? "#DC2626" : "#64748B"} />
      </div>

      {/* Project cards */}
      {projects.length > 0 ? (
        <div>
          <h3 className="text-base font-semibold text-[#0F172A] mb-3">Your Projects</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const todo = project.tasks.filter((t) => t.status === "TODO").length;
              const inProgress = project.tasks.filter((t) => t.status === "IN_PROGRESS").length;
              const done = project.tasks.filter((t) => t.status === "DONE").length;
              const total = project.tasks.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <Link key={project.id} href={`/projects/${project.id}`} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#2563EB]/30 transition-all">
                  <h4 className="text-sm font-semibold text-[#0F172A] truncate">{project.name}</h4>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{project._count.members}</span>
                    <span className="flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5" />{total} tasks</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-[#94A3B8] mb-1"><span>{pct}% complete</span><span>{done}/{total}</span></div>
                    <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden"><div className="h-full bg-[#16A34A] rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                  </div>
                  <div className="flex gap-3 mt-3 text-[10px]">
                    <span className="text-[#64748B]">{todo} todo</span>
                    <span className="text-[#D97706]">{inProgress} active</span>
                    <span className="text-[#16A34A]">{done} done</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Create your first project to start assigning tasks." actionLabel="Create Project" actionHref="/projects" />
      )}

      {/* Overdue tasks */}
      {overdueTasks.length > 0 && (
        <div className="bg-white border-2 border-red-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
            <h3 className="text-base font-semibold text-[#0F172A]">Overdue Tasks ({overdueTasks.length})</h3>
          </div>
          <div className="space-y-3">
            {overdueTasks.map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`} className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 hover:bg-red-50 transition-colors">
                <div className="flex items-center gap-3">
                  {task.assignee && <UserAvatar name={task.assignee.name} size="sm" />}
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">{task.title}</p>
                    <p className="text-xs text-[#64748B]">{task.project.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status="TODO" isOverdue />
                  <span className="text-xs text-red-600">Due {formatDate(task.due_date)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
