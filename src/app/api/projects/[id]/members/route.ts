import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-utils";
import { addMemberSchema } from "@/lib/validators";

/**
 * GET /api/projects/[id]/members
 * List project members — accessible by project members and admins.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id: projectId } = await params;

    // Verify the project exists and belongs to the same company
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

    // Check access: Admin or project member/owner
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

    const members = await prisma.projectMember.findMany({
      where: { project_id: projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            _count: {
              select: { project_memberships: true },
            },
          },
        },
      },
      orderBy: { joined_at: "asc" },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("List members error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/members
 * Add a member to the project — project owner (Manager) or Admin.
 * The target user must belong to the same company.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id: projectId } = await params;

    // Only Manager/Admin can add members
    if (user.role === "EMPLOYEE") {
      return NextResponse.json(
        { error: "You do not have permission to add members" },
        { status: 403 }
      );
    }

    // Verify the project exists and belongs to the same company
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

    // Managers can only add to their own projects; Admins can add to any
    if (user.role === "MANAGER" && project.owner_id !== user.id) {
      return NextResponse.json(
        { error: "You can only manage members of your own projects" },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verify the target user is in the same company
    const targetUser = await prisma.user.findFirst({
      where: {
        id: parsed.data.user_id,
        company_id: user.company_id,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found in your workspace" },
        { status: 404 }
      );
    }

    // Check for existing membership
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: parsed.data.user_id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this project" },
        { status: 409 }
      );
    }

    // Add the member
    const member = await prisma.projectMember.create({
      data: {
        project_id: projectId,
        user_id: parsed.data.user_id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            _count: {
              select: { project_memberships: true },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Member added successfully",
        member,
        active_project_count: member.user._count.project_memberships,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add member error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
