"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import StatusBadge from "@/components/status-badge";
import UserAvatar from "@/components/user-avatar";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { formatDate, formatDateLong, formatDateTime } from "@/lib/format-date";
import {
  ArrowLeft, Calendar, User, FolderKanban, Trash2, Loader2, Send, MessageSquare,
} from "lucide-react";

interface Comment {
  id: string;
  body: string;
  author: { id: string; name: string; email: string };
  created_at: string;
}

interface TaskDetailProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    due_date: string | null;
    project: { id: string; name: string; owner_id: string };
    assignee: { id: string; name: string; email: string } | null;
    creator: { id: string; name: string };
    created_at: string;
  };
  comments: Comment[];
  currentUserId: string;
  currentUserRole: string;
  canEdit: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;
}

function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate || status === "DONE") return false;
  return new Date(dueDate) < new Date();
}

export default function TaskDetail({
  task, comments, currentUserId, currentUserRole, canEdit, canDelete, canChangeStatus,
}: TaskDetailProps) {
  const router = useRouter();
  const [status, setStatus] = useState(task.status);
  const [statusLoading, setStatusLoading] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState(false);
  const [showDeleteTask, setShowDeleteTask] = useState(false);
  const [deleteTaskLoading, setDeleteTaskLoading] = useState(false);

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    setStatusLoading(true);
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch { setStatus(task.status); }
    finally { setStatusLoading(false); }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setCommentLoading(true);
    try {
      await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentBody }),
      });
      setCommentBody("");
      router.refresh();
    } catch { /* ignore */ }
    finally { setCommentLoading(false); }
  }

  async function handleDeleteComment() {
    if (!deletingComment) return;
    setDeleteCommentLoading(true);
    try {
      await fetch(`/api/comments/${deletingComment}`, { method: "DELETE" });
      setDeletingComment(null);
      router.refresh();
    } catch { /* ignore */ }
    finally { setDeleteCommentLoading(false); }
  }

  async function handleDeleteTask() {
    setDeleteTaskLoading(true);
    try {
      await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      router.push(`/projects/${task.project.id}`);
      router.refresh();
    } catch { /* ignore */ }
    finally { setDeleteTaskLoading(false); }
  }

  const overdue = isOverdue(task.due_date, status);

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#64748B] mb-4">
        <Link href="/projects" className="hover:text-[#0F172A] transition-colors">Projects</Link>
        <span>/</span>
        <Link href={`/projects/${task.project.id}`} className="hover:text-[#0F172A] transition-colors">{task.project.name}</Link>
        <span>/</span>
        <span className="text-[#0F172A] font-medium truncate max-w-[200px]">{task.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* ── Left Column: Details + Comments ─────── */}
        <div className="space-y-6">
          {/* Title & description */}
          <div className={`bg-white border rounded-xl p-6 shadow-sm ${overdue ? "border-red-300" : "border-[#E2E8F0]"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-[#0F172A]">{task.title}</h1>
                {overdue && <StatusBadge status="TODO" isOverdue className="mt-2" />}
              </div>
              {canDelete && (
                <Button variant="outline" size="sm" onClick={() => setShowDeleteTask(true)}
                  className="text-red-600 border-red-200 hover:bg-red-50 cursor-pointer flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            {task.description && (
              <p className="text-sm text-[#64748B] mt-4 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            )}
            {!task.description && (
              <p className="text-sm text-[#94A3B8] mt-4 italic">No description provided.</p>
            )}
          </div>

          {/* Comments section */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#64748B]" />
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  Comments ({comments.length})
                </h2>
              </div>
            </div>

            {/* Comment thread */}
            <div className="divide-y divide-[#F1F5F9]">
              {comments.length === 0 && (
                <p className="text-sm text-[#94A3B8] text-center py-8">
                  No comments yet. Start the conversation.
                </p>
              )}
              {comments.map((comment) => (
                <div key={comment.id} className="px-6 py-4 group hover:bg-[#FAFBFC]">
                  <div className="flex items-start gap-3">
                    <UserAvatar name={comment.author.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#0F172A]">{comment.author.name}</span>
                          <span className="text-xs text-[#94A3B8]">{formatDateTime(comment.created_at)}</span>
                        </div>
                        {(comment.author.id === currentUserId || currentUserRole === "ADMIN") && (
                          <button onClick={() => setDeletingComment(comment.id)}
                            className="opacity-0 group-hover:opacity-100 text-[#94A3B8] hover:text-red-600 transition-all cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-[#374151] mt-1 whitespace-pre-wrap">{comment.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment input */}
            <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#FAFBFC] rounded-b-xl">
              <form onSubmit={handleAddComment} className="flex gap-3">
                <Textarea value={commentBody} onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Write a comment..." rows={2} className="flex-1 resize-none text-sm" maxLength={2000} />
                <Button type="submit" disabled={commentLoading || !commentBody.trim()} size="sm"
                  className="self-end bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer">
                  {commentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Right Column: Metadata Sidebar ─────── */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
            <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Status</label>
            {canChangeStatus ? (
              <Select value={status} onValueChange={(val) => { if (val) handleStatusChange(val); }} disabled={statusLoading}>
                <SelectTrigger className="mt-2 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-2"><StatusBadge status={task.status} /></div>
            )}
          </div>

          {/* Assignee */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
            <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3" /> Assignee
            </label>
            {task.assignee ? (
              <div className="flex items-center gap-2 mt-2">
                <UserAvatar name={task.assignee.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{task.assignee.name}</p>
                  <p className="text-xs text-[#94A3B8]">{task.assignee.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#94A3B8] mt-2">Unassigned</p>
            )}
          </div>

          {/* Due date */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
            <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Due Date
            </label>
            {task.due_date ? (
              <p className={`text-sm mt-2 font-medium ${overdue ? "text-red-600" : "text-[#0F172A]"}`}>
                {formatDateLong(task.due_date)}
                {overdue && <span className="text-xs ml-1">(overdue)</span>}
              </p>
            ) : (
              <p className="text-sm text-[#94A3B8] mt-2">No due date</p>
            )}
          </div>

          {/* Project */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
            <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider flex items-center gap-1">
              <FolderKanban className="w-3 h-3" /> Project
            </label>
            <Link href={`/projects/${task.project.id}`} className="text-sm text-[#2563EB] hover:text-[#1D4ED8] mt-2 block font-medium">
              {task.project.name}
            </Link>
          </div>

          {/* Created by */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
            <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Created By</label>
            <p className="text-sm text-[#0F172A] mt-2">{task.creator.name}</p>
            <p className="text-xs text-[#94A3B8]">
              {formatDate(task.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Task Confirmation */}
      <ConfirmationDialog open={showDeleteTask} onOpenChange={setShowDeleteTask} title="Delete Task"
        description="This will permanently delete this task and all its comments." confirmLabel="Delete Task"
        onConfirm={handleDeleteTask} loading={deleteTaskLoading} variant="danger" />

      {/* Delete Comment Confirmation */}
      <ConfirmationDialog open={!!deletingComment} onOpenChange={() => setDeletingComment(null)} title="Delete Comment"
        description="Are you sure you want to delete this comment?" confirmLabel="Delete"
        onConfirm={handleDeleteComment} loading={deleteCommentLoading} variant="danger" />
    </>
  );
}
