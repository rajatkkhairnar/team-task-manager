"use client";

import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import UserAvatar from "@/components/user-avatar";
import EmptyState from "@/components/empty-state";
import { formatDate } from "@/lib/format-date";
import { Users, FolderKanban, ListTodo, AlertTriangle, ClipboardList, Clock } from "lucide-react";
import Link from "next/link";

interface AdminDashboardProps {
  stats: {
    totalMembers: number;
    totalProjects: number;
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
  companyCode: string;
  companyName: string;
}

export default function AdminDashboard({
  stats,
  overdueTasks,
  companyCode,
  companyName,
}: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Company code banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">
              {companyName}
            </h2>
            <p className="text-sm text-[#64748B] mt-0.5">
              Share this code with your team to invite them
            </p>
          </div>
          <div className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg px-6 py-3">
            <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider mb-0.5">
              Company Code
            </p>
            <p className="text-xl font-mono font-bold text-[#2563EB] tracking-[0.25em]">
              {companyCode}
            </p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Members"
          value={stats.totalMembers}
          icon={Users}
          accentColor="#2563EB"
        />
        <StatCard
          label="Total Projects"
          value={stats.totalProjects}
          icon={FolderKanban}
          accentColor="#8B5CF6"
        />
        <StatCard
          label="Overdue Tasks"
          value={stats.overdueCount}
          icon={AlertTriangle}
          accentColor={stats.overdueCount > 0 ? "#DC2626" : "#64748B"}
        />
      </div>

      {/* Task breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="To Do"
          value={stats.todoCount}
          icon={ListTodo}
          accentColor="#64748B"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgressCount}
          icon={Clock}
          accentColor="#D97706"
        />
        <StatCard
          label="Completed"
          value={stats.doneCount}
          icon={ClipboardList}
          accentColor="#16A34A"
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/members"
          className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#2563EB]/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Users className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">
                Manage Members
              </p>
              <p className="text-xs text-[#64748B]">
                View and manage team roles
              </p>
            </div>
          </div>
        </Link>
        <Link
          href="/projects"
          className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#2563EB]/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center group-hover:bg-violet-100 transition-colors">
              <FolderKanban className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">
                View All Projects
              </p>
              <p className="text-xs text-[#64748B]">
                Browse all company projects
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Overdue tasks */}
      {overdueTasks.length > 0 && (
        <div className="bg-white border-2 border-red-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
            <h3 className="text-base font-semibold text-[#0F172A]">
              Overdue Tasks ({overdueTasks.length})
            </h3>
          </div>
          <div className="space-y-3">
            {overdueTasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {task.assignee && (
                    <UserAvatar name={task.assignee.name} size="sm" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">
                      {task.title}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {task.project.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status="TODO" isOverdue />
                  <span className="text-xs text-red-600">
                    Due {formatDate(task.due_date)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {overdueTasks.length === 0 && stats.totalProjects === 0 && (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start managing tasks with your team."
          actionLabel="Go to Projects"
          actionHref="/projects"
        />
      )}
    </div>
  );
}
