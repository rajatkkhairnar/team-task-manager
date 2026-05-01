import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-utils";

/**
 * GET /api/projects/[id]
 * Get project details — accessible by project members and admins.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id: projectId } = await params;

    // Find the project scoped to the company
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        company_id: user.company_id,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { joined_at: "asc" },
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true },
            },
            creator: {
              select: { id: true, name: true },
            },
            _count: {
              select: { comments: true },
            },
          },
          orderBy: { created_at: "desc" },
        },
        _count: {
          select: { members: true, tasks: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check access: Admin can access any project in the company,
    // others must be a member of the project
    if (user.role !== "ADMIN") {
      const isMember = project.members.some((m) => m.user_id === user.id);
      const isOwner = project.owner_id === user.id;
      if (!isMember && !isOwner) {
        return NextResponse.json(
          { error: "You do not have access to this project" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project — only the project owner or an admin can delete.
 * Cascades to project members, tasks, and comments.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id: projectId } = await params;

    // Find the project scoped to the company
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        company_id: user.company_id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Only the owner or admin can delete
    if (user.role !== "ADMIN" && project.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Only the project owner or an admin can delete this project" },
        { status: 403 }
      );
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
