import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-utils";
import { updateTaskSchema, updateTaskStatusSchema } from "@/lib/validators";

/**
 * GET /api/tasks/[id]
 * Get task details — accessible by project members and admins.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id: taskId } = await params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { id: true, name: true, company_id: true, owner_id: true },
        },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
          orderBy: { created_at: "asc" },
        },
        _count: { select: { comments: true } },
      },
    });

    if (!task || task.project.company_id !== user.company_id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check access
    if (user.role !== "ADMIN") {
      const isMember = await prisma.projectMember.findFirst({
        where: { project_id: task.project_id, user_id: user.id },
      });
      if (!isMember && task.project.owner_id !== user.id) {
        return NextResponse.json(
          { error: "You do not have access to this task" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks/[id]
 * Update a task:
 * - Manager/Admin: full edit (title, description, status, assignee, due_date)
 * - Employee: status only, on their own assigned tasks
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id: taskId } = await params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { id: true, company_id: true, owner_id: true },
        },
      },
    });

    if (!task || task.project.company_id !== user.company_id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await request.json();

    if (user.role === "EMPLOYEE") {
      // Employee: can only update status on tasks assigned to them
      if (task.assignee_id !== user.id) {
        return NextResponse.json(
          { error: "You can only update tasks assigned to you" },
          { status: 403 }
        );
      }

      const parsed = updateTaskStatusSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0].message },
          { status: 400 }
        );
      }

      const updated = await prisma.task.update({
        where: { id: taskId },
        data: { status: parsed.data.status },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true } },
          _count: { select: { comments: true } },
        },
      });

      return NextResponse.json({ message: "Task updated", task: updated });
    }

    // Manager/Admin: full edit
    if (user.role === "MANAGER" && task.project.owner_id !== user.id) {
      return NextResponse.json(
        { error: "You can only edit tasks in your own projects" },
        { status: 403 }
      );
    }

    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // If reassigning, verify new assignee is a project member
    if (parsed.data.assignee_id) {
      const isMember = await prisma.projectMember.findFirst({
        where: {
          project_id: task.project_id,
          user_id: parsed.data.assignee_id,
        },
      });
      if (!isMember) {
        return NextResponse.json(
          { error: "Assignee must be a project member" },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.description !== undefined)
      updateData.description = parsed.data.description;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.assignee_id !== undefined)
      updateData.assignee_id = parsed.data.assignee_id;
    if (parsed.data.due_date !== undefined)
      updateData.due_date = parsed.data.due_date
        ? new Date(parsed.data.due_date)
        : null;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json({ message: "Task updated", task: updated });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task — Manager (own project) / Admin.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id: taskId } = await params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { id: true, company_id: true, owner_id: true },
        },
      },
    });

    if (!task || task.project.company_id !== user.company_id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (user.role === "EMPLOYEE") {
      return NextResponse.json(
        { error: "You do not have permission to delete tasks" },
        { status: 403 }
      );
    }

    if (user.role === "MANAGER" && task.project.owner_id !== user.id) {
      return NextResponse.json(
        { error: "You can only delete tasks in your own projects" },
        { status: 403 }
      );
    }

    await prisma.task.delete({ where: { id: taskId } });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
