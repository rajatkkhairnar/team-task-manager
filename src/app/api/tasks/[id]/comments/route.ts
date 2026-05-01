import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-utils";
import { createCommentSchema } from "@/lib/validators";

/**
 * GET /api/tasks/[id]/comments
 * List all comments on a task — accessible by project members and admins.
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
        project: { select: { company_id: true, owner_id: true } },
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

    const comments = await prisma.comment.findMany({
      where: { task_id: taskId },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { created_at: "asc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("List comments error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks/[id]/comments
 * Add a comment to a task — project members and admins.
 */
export async function POST(
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
        project: { select: { company_id: true, owner_id: true } },
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

    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        body: parsed.data.body,
        task_id: taskId,
        author_id: user.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(
      { message: "Comment added", comment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
