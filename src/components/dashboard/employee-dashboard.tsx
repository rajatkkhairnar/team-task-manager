"use client";

import StatusBadge from "@/components/status-badge";
import EmptyState from "@/components/empty-state";
import { formatDate } from "@/lib/format-date";
import { ClipboardList, FolderKanban, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface TaskItem {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  project: { id: string; name: string };
}

interface ProjectItem {
  id: string;
  name: string;
  _count: { members: number; tasks: number };
}

interface EmployeeDashboardProps {
  tasks: TaskItem[];
  projects: ProjectItem[];
}

function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate || status === "DONE") return false;
  return new Date(dueDate) < new Date();
}

export default function EmployeeDashboard({
  tasks,
  projects,
}: EmployeeDashboardProps) {
  const todoTasks = tasks.filter((t) => t.status === "TODO");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((t) => t.status === "DONE");
  const overdueTasks = tasks.filter((t) => isOverdue(t.due_date, t.status));

  const sections = [
    { title: "To Do", tasks: todoTasks, emptyMsg: "No pending tasks" },
    { title: "In Progress", tasks: inProgressTasks, emptyMsg: "No active tasks" },
    { title: "Completed", tasks: doneTasks, emptyMsg: "No completed tasks yet" },
  ];

  return (
    <div className="space-y-6">
      {/* Overdue alert */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
            <span className="text-sm font-semibold text-red-800">
              {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2">
            {overdueTasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/70 hover:bg-white transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{task.title}</p>
                  <p className="text-xs text-[#64748B]">{task.project.name}</p>
                </div>
                <span className="text-xs text-red-600">
                  Due {formatDate(task.due_date!)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tasks grouped by status */}
      {tasks.length > 0 ? (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-[#0F172A]">
                  {section.title}
                </h3>
                <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] rounded-full px-2 py-0.5">
                  {section.tasks.length}
                </span>
              </div>
              {section.tasks.length > 0 ? (
                <div className="space-y-2">
                  {section.tasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className={`block bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
                        isOverdue(task.due_date, task.status)
                          ? "border-red-300"
                          : "border-[#E2E8F0] hover:border-[#2563EB]/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#0F172A]">
                            {task.title}
                          </p>
                          <p className="text-xs text-[#64748B] mt-0.5">
                            {task.project.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge
                            status={task.status}
                            isOverdue={isOverdue(task.due_date, task.status)}
                          />
                          {task.due_date && (
                            <span
                              className={`text-xs ${
                                isOverdue(task.due_date, task.status)
                                  ? "text-red-600"
                                  : "text-[#94A3B8]"
                              }`}
                            >
                              {formatDate(task.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#94A3B8] py-4 text-center bg-white rounded-lg border border-dashed border-[#E2E8F0]">
                  {section.emptyMsg}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No tasks assigned"
          description="You don't have any tasks yet. Tasks will appear here when a manager assigns them to you."
        />
      )}

      {/* Projects list */}
      {projects.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#0F172A] mb-3">
            Your Projects
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm hover:shadow-md hover:border-[#2563EB]/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
                    <FolderKanban className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">
                      {project.name}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {project._count.tasks} tasks · {project._count.members} members
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
