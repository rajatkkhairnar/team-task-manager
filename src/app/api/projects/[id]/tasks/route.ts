import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-utils";
import { createTaskSchema } from "@/lib/validators";

/**
 * GET /api/projects/[id]/tasks
 * List all tasks in a project — accessible by project members and admins.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id: projectId } = await params;

    const project = await prisma.project.findFirst({
      where: { id: projectId, company_id: user.company_id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check access
    if (user.role !== "ADMIN") {
      const isMember = await prisma.projectMember.findFirst({
        where: { project_id: projectId, user_id: user.id },
      });
      if (!isMember && project.owner_id !== user.id) {
        return NextResponse.json(
          { error: "You do not have access to this project" },
          { status: 403 }
        );
      }
    }

    const tasks = await prisma.task.findMany({
      where: { project_id: projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("List tasks error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/tasks
 * Create a task in a project — Manager (own project) / Admin.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id: projectId } = await params;

    if (user.role === "EMPLOYEE") {
      return NextResponse.json(
        { error: "You do not have permission to create tasks" },
        { status: 403 }
      );
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, company_id: user.company_id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (user.role === "MANAGER" && project.owner_id !== user.id) {
      return NextResponse.json(
        { error: "You can only create tasks in your own projects" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // If an assignee is specified, verify they are a project member
    if (parsed.data.assignee_id) {
      const isMember = await prisma.projectMember.findFirst({
        where: {
          project_id: projectId,
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

    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        status: parsed.data.status || "TODO",
        project_id: projectId,
        assignee_id: parsed.data.assignee_id || null,
        created_by: user.id,
        due_date: parsed.data.due_date ? new Date(parsed.data.due_date) : null,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json(
      { message: "Task created successfully", task },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
