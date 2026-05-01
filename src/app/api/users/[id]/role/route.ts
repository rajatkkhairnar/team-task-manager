import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-utils";
import { updateRoleSchema } from "@/lib/validators";

/**
 * PATCH /api/users/[id]/role
 * Change a user's role — Admin only.
 * Cannot change own role or the original workspace admin's role.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = requireRole(request, "ADMIN");
    if (errorResponse) return errorResponse;

    const { id: targetUserId } = await params;

    // Prevent admin from changing their own role
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await request.json();
    const parsed = updateRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Find the target user — must be in the same company
    const targetUser = await prisma.user.findFirst({
      where: {
        id: targetUserId,
        company_id: user.company_id,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found in your workspace" },
        { status: 404 }
      );
    }

    // Prevent changing the original workspace admin's role
    const company = await prisma.company.findUnique({
      where: { id: user.company_id },
    });

    if (company && company.admin_id === targetUserId) {
      return NextResponse.json(
        { error: "Cannot change the role of the workspace creator" },
        { status: 403 }
      );
    }

    // Update the role
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: parsed.data.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
