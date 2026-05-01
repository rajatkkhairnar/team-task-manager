import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-utils";

/**
 * DELETE /api/users/[id]
 * Remove a user from the workspace — Admin only.
 * Cannot delete yourself or the workspace creator.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = requireRole(request, "ADMIN");
    if (errorResponse) return errorResponse;

    const { id: targetUserId } = await params;

    // Prevent admin from deleting themselves
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself from the workspace" },
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

    // Prevent deleting the workspace creator
    const company = await prisma.company.findUnique({
      where: { id: user.company_id },
    });

    if (company && company.admin_id === targetUserId) {
      return NextResponse.json(
        { error: "Cannot remove the workspace creator" },
        { status: 403 }
      );
    }

    // Delete the user (cascades will handle project memberships and comments)
    await prisma.user.delete({
      where: { id: targetUserId },
    });

    return NextResponse.json({
      message: "User removed from workspace successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
