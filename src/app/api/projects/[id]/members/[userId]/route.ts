import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-utils";

/**
 * DELETE /api/projects/[id]/members/[userId]
 * Remove a member from the project — project owner (Manager) or Admin.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const [user, errorResponse] = requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id: projectId, userId: targetUserId } = await params;

    if (user.role === "EMPLOYEE") {
      return NextResponse.json(
        { error: "You do not have permission to remove members" },
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
        { error: "You can only manage members of your own projects" },
        { status: 403 }
      );
    }

    if (targetUserId === project.owner_id) {
      return NextResponse.json(
        { error: "Cannot remove the project owner" },
        { status: 400 }
      );
    }

    const membership = await prisma.projectMember.findUnique({
      where: {
        project_id_user_id: { project_id: projectId, user_id: targetUserId },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "User is not a member of this project" },
        { status: 404 }
      );
    }

    await prisma.projectMember.delete({ where: { id: membership.id } });

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
