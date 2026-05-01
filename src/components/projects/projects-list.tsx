"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import EmptyState from "@/components/empty-state";
import { FolderKanban, Plus, Users, ClipboardList, Loader2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  owner: { id: string; name: string; email: string };
  _count: { members: number; tasks: number };
  created_at: string;
}

interface ProjectsListProps {
  projects: Project[];
  canCreate: boolean;
}

export default function ProjectsList({ projects, canCreate }: ProjectsListProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create project");
        return;
      }
      setShowCreate(false);
      setName("");
      setDescription("");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Projects</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#2563EB]/30 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center ml-3 flex-shrink-0">
                  <FolderKanban className="w-4 h-4 text-violet-600" />
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-[#64748B]">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {project._count.members} member{project._count.members !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <ClipboardList className="w-3.5 h-3.5" />
                  {project._count.tasks} task{project._count.tasks !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-[#F1F5F9]">
                <p className="text-[10px] text-[#94A3B8]">
                  Owner: {project.owner.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description={
            canCreate
              ? "Create your first project to get started."
              : "You haven't been added to any projects yet."
          }
          actionLabel={canCreate ? "Create Project" : undefined}
          onAction={canCreate ? () => setShowCreate(true) : undefined}
        />
      )}

      {/* Create project dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-[#DC2626] text-sm rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Website Redesign"
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-desc">Description (optional)</Label>
              <Textarea
                id="project-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
                rows={3}
                maxLength={500}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="cursor-pointer">Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
