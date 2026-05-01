"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import StatusBadge from "@/components/status-badge";
import RoleBadge from "@/components/role-badge";
import UserAvatar from "@/components/user-avatar";
import ConfirmationDialog from "@/components/confirmation-dialog";
import EmptyState from "@/components/empty-state";
import { formatDate } from "@/lib/format-date";
import { Plus, Loader2, Trash2, ClipboardList, Users, ArrowLeft, Calendar } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  assignee: { id: string; name: string; email: string } | null;
  creator: { id: string; name: string };
  _count: { comments: number };
}

interface Member {
  id: string;
  user_id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    _count: { project_memberships: number };
  };
  joined_at: string;
}

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ProjectDetailProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    owner_id: string;
    owner: { id: string; name: string; email: string };
  };
  tasks: Task[];
  members: Member[];
  companyUsers: CompanyUser[];
  currentUserId: string;
  currentUserRole: string;
  canManage: boolean;
}

function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate || status === "DONE") return false;
  return new Date(dueDate) < new Date();
}

export default function ProjectDetail({
  project, tasks, members, companyUsers, currentUserId, currentUserRole, canManage,
}: ProjectDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("tasks");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create task state
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState("");

  // Add member state
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState("");

  // Remove member state
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  // Delete project state
  const [showDeleteProject, setShowDeleteProject] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const memberIds = new Set(members.map((m) => m.user_id));
  const availableUsers = companyUsers.filter((u) => !memberIds.has(u.id));

  const filteredTasks = statusFilter === "ALL"
    ? tasks
    : statusFilter === "OVERDUE"
    ? tasks.filter((t) => isOverdue(t.due_date, t.status))
    : tasks.filter((t) => t.status === statusFilter);

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    setTaskError("");
    setTaskLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc || undefined,
          assignee_id: taskAssignee || undefined,
          due_date: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setTaskError(data.error); return; }
      setShowCreateTask(false);
      setTaskTitle(""); setTaskDesc(""); setTaskAssignee(""); setTaskDueDate("");
      router.refresh();
    } catch { setTaskError("Network error"); }
    finally { setTaskLoading(false); }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setMemberError("");
    setMemberLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: selectedUserId }),
      });
      const data = await res.json();
      if (!res.ok) { setMemberError(data.error); return; }
      setShowAddMember(false);
      setSelectedUserId("");
      router.refresh();
    } catch { setMemberError("Network error"); }
    finally { setMemberLoading(false); }
  }

  async function handleRemoveMember() {
    if (!removingMember) return;
    setRemoveLoading(true);
    try {
      await fetch(`/api/projects/${project.id}/members/${removingMember}`, { method: "DELETE" });
      setRemovingMember(null);
      router.refresh();
    } catch { /* ignore */ }
    finally { setRemoveLoading(false); }
  }

  async function handleDeleteProject() {
    setDeleteLoading(true);
    try {
      await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      router.push("/projects");
      router.refresh();
    } catch { /* ignore */ }
    finally { setDeleteLoading(false); }
  }

  const canDelete = currentUserRole === "ADMIN" || project.owner_id === currentUserId;

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#0F172A] mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Projects
          </Link>
          <h1 className="text-2xl font-semibold text-[#0F172A]">{project.name}</h1>
          {project.description && <p className="text-sm text-[#64748B] mt-1">{project.description}</p>}
          <p className="text-xs text-[#94A3B8] mt-1">Owner: {project.owner.name}</p>
        </div>
        <div className="flex gap-2">
          {canDelete && (
            <Button variant="outline" size="sm" onClick={() => setShowDeleteProject(true)} className="text-red-600 border-red-200 hover:bg-red-50 cursor-pointer">
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="tasks" className="cursor-pointer">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="members" className="cursor-pointer">Members ({members.length})</TabsTrigger>
        </TabsList>

        {/* ── Tasks Tab ───────────────────────────────── */}
        <TabsContent value="tasks">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {["ALL", "TODO", "IN_PROGRESS", "DONE", "OVERDUE"].map((f) => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === f ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                  }`}
                >
                  {f === "ALL" ? "All" : f === "IN_PROGRESS" ? "In Progress" : f === "TODO" ? "To Do" : f === "OVERDUE" ? "Overdue" : "Done"}
                </button>
              ))}
            </div>
            {canManage && (
              <Button size="sm" onClick={() => setShowCreateTask(true)} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer">
                <Plus className="w-4 h-4 mr-1" /> New Task
              </Button>
            )}
          </div>

          {filteredTasks.length > 0 ? (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}
                  className={`block bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
                    isOverdue(task.due_date, task.status) ? "border-red-300" : "border-[#E2E8F0] hover:border-[#2563EB]/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {task.assignee && <UserAvatar name={task.assignee.name} size="sm" />}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#0F172A] truncate">{task.title}</p>
                        <p className="text-xs text-[#94A3B8]">{task.assignee?.name || "Unassigned"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={task.status} isOverdue={isOverdue(task.due_date, task.status)} />
                      {task.due_date && (
                        <span className={`text-xs flex items-center gap-1 ${isOverdue(task.due_date, task.status) ? "text-red-600" : "text-[#94A3B8]"}`}>
                          <Calendar className="w-3 h-3" /> {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={ClipboardList} title="No tasks" description={statusFilter !== "ALL" ? "No tasks match this filter." : "Create a task to get started."} />
          )}
        </TabsContent>

        {/* ── Members Tab ─────────────────────────────── */}
        <TabsContent value="members">
          {canManage && (
            <div className="mb-4">
              <Button size="sm" onClick={() => setShowAddMember(true)} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer">
                <Plus className="w-4 h-4 mr-1" /> Add Member
              </Button>
            </div>
          )}
          {members.length > 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA]">
                    <th className="text-left text-xs font-medium text-[#64748B] px-4 py-3">Member</th>
                    <th className="text-left text-xs font-medium text-[#64748B] px-4 py-3 hidden sm:table-cell">Role</th>
                    <th className="text-left text-xs font-medium text-[#64748B] px-4 py-3 hidden md:table-cell">Projects</th>
                    <th className="text-left text-xs font-medium text-[#64748B] px-4 py-3 hidden md:table-cell">Joined</th>
                    {canManage && <th className="w-16 px-4 py-3"></th>}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFBFC]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={member.user.name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-[#0F172A]">{member.user.name}</p>
                            <p className="text-xs text-[#94A3B8]">{member.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell"><RoleBadge role={member.user.role} /></td>
                      <td className="px-4 py-3 text-sm text-[#64748B] hidden md:table-cell">{member.user._count.project_memberships}</td>
                      <td className="px-4 py-3 text-xs text-[#94A3B8] hidden md:table-cell">{formatDate(member.joined_at)}</td>
                      {canManage && (
                        <td className="px-4 py-3">
                          {member.user_id !== project.owner_id && (
                            <button onClick={() => setRemovingMember(member.user_id)} className="text-[#94A3B8] hover:text-red-600 transition-colors cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Users} title="No members" description="Add members to start collaborating." />
          )}
        </TabsContent>
      </Tabs>

      {/* Create Task Dialog */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            {taskError && <div className="bg-red-50 border border-red-200 text-[#DC2626] text-sm rounded-md px-3 py-2">{taskError}</div>}
            <div className="space-y-1.5"><Label>Title</Label><Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required maxLength={200} /></div>
            <div className="space-y-1.5"><Label>Description (optional)</Label><Textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} rows={3} maxLength={2000} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Assignee</Label>
                <Select value={taskAssignee} onValueChange={(val) => setTaskAssignee(val || "")}>
                  <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{members.map((m) => (<SelectItem key={m.user_id} value={m.user_id}>{m.user.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateTask(false)} className="cursor-pointer">Cancel</Button>
              <Button type="submit" disabled={taskLoading} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer">
                {taskLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Add Member</DialogTitle></DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4">
            {memberError && <div className="bg-red-50 border border-red-200 text-[#DC2626] text-sm rounded-md px-3 py-2">{memberError}</div>}
            {availableUsers.length > 0 ? (
              <div className="space-y-1.5">
                <Label>Select a team member</Label>
                <Select value={selectedUserId} onValueChange={(val) => setSelectedUserId(val || "")}>
                  <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Choose..." /></SelectTrigger>
                  <SelectContent>{availableUsers.map((u) => (<SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>))}</SelectContent>
                </Select>
              </div>
            ) : (
              <p className="text-sm text-[#64748B] text-center py-4">All workspace members are already in this project.</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddMember(false)} className="cursor-pointer">Cancel</Button>
              <Button type="submit" disabled={memberLoading || !selectedUserId} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer">
                {memberLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : "Add Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <ConfirmationDialog open={!!removingMember} onOpenChange={() => setRemovingMember(null)} title="Remove Member" description="Are you sure you want to remove this member from the project?" confirmLabel="Remove" onConfirm={handleRemoveMember} loading={removeLoading} variant="danger" />

      {/* Delete Project Confirmation */}
      <ConfirmationDialog open={showDeleteProject} onOpenChange={setShowDeleteProject} title="Delete Project" description="This will permanently delete the project, all tasks, and comments. This action cannot be undone." confirmLabel="Delete Project" onConfirm={handleDeleteProject} loading={deleteLoading} variant="danger" />
    </>
  );
}
