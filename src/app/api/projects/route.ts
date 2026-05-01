import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/api-utils";
import { createProjectSchema } from "@/lib/validators";

/**
 * GET /api/projects
 * List projects scoped by role:
 * - Admin: all projects in the company
 * - Manager: projects they own
 * - Employee: projects they are a member of
 */
export async function GET(request: NextRequest) {
  try {
    const [user, errorResponse] = requireAuth(request);
    if (errorResponse) return errorResponse;

    let projects;

    if (user.role === "ADMIN") {
      // Admin sees all projects in the company
      projects = await prisma.project.findMany({
        where: { company_id: user.company_id },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { members: true, tasks: true },
          },
        },
        orderBy: { created_at: "desc" },
      });
    } else if (user.role === "MANAGER") {
      // Manager sees projects they own
      projects = await prisma.project.findMany({
        where: {
          company_id: user.company_id,
          owner_id: user.id,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { members: true, tasks: true },
          },
        },
        orderBy: { created_at: "desc" },
      });
    } else {
      // Employee sees projects they are a member of
      projects = await prisma.project.findMany({
        where: {
          company_id: user.company_id,
          members: {
            some: { user_id: user.id },
          },
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { members: true, tasks: true },
          },
        },
        orderBy: { created_at: "desc" },
      });
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("List projects error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project — Manager/Admin only.
 * The creator becomes the project owner and is automatically added as a member.
 */
export async function POST(request: NextRequest) {
  try {
    const [user, errorResponse] = requireRole(request, "ADMIN", "MANAGER");
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Create the project and add the creator as a member in a transaction
    const project = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description || null,
          owner_id: user.id,
          company_id: user.company_id,
        },
      });

      // Auto-add the creator as a project member
      await tx.projectMember.create({
        data: {
          project_id: newProject.id,
          user_id: user.id,
        },
      });

      return newProject;
    });

    const fullProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { members: true, tasks: true },
        },
      },
    });

    return NextResponse.json(
      { message: "Project created successfully", project: fullProject },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
