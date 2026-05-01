import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { signToken, setAuthCookie, generateCompanyCode, AuthUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using discriminated union
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const password_hash = await bcrypt.hash(data.password, 12);

    if (data.type === "admin") {
      // ─── Admin Registration: Create Workspace ───────────────

      // Generate unique company code
      let company_code: string;
      let codeExists = true;
      do {
        company_code = generateCompanyCode();
        const existing = await prisma.company.findUnique({
          where: { company_code },
        });
        codeExists = !!existing;
      } while (codeExists);

      // Create company and admin user in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user first (we need the ID for company.admin_id)
        const user = await tx.user.create({
          data: {
            name: data.name,
            email: data.email,
            password_hash,
            role: "ADMIN",
            company: {
              create: {
                name: data.company_name,
                company_code,
                admin_id: "placeholder", // Will update after
              },
            },
          },
          include: { company: true },
        });

        // Update company with the actual admin_id
        await tx.company.update({
          where: { id: user.company_id },
          data: { admin_id: user.id },
        });

        return user;
      });

      // Sign JWT and set cookie
      const authUser: AuthUser = {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        company_id: result.company_id,
      };

      const token = await signToken(authUser);
      await setAuthCookie(token);

      return NextResponse.json(
        {
          message: "Workspace created successfully",
          user: {
            id: result.id,
            name: result.name,
            email: result.email,
            role: result.role,
            company_code: result.company.company_code,
          },
        },
        { status: 201 }
      );
    } else {
      // ─── Member Registration: Join Workspace ────────────────

      // Validate company code
      const company = await prisma.company.findUnique({
        where: { company_code: data.company_code.toUpperCase() },
      });

      if (!company) {
        return NextResponse.json(
          { error: "Invalid company code. Please check with your admin and try again." },
          { status: 404 }
        );
      }

      // Create the employee user
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password_hash,
          role: "EMPLOYEE",
          company_id: company.id,
        },
      });

      // Sign JWT and set cookie
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company_id: user.company_id,
      };

      const token = await signToken(authUser);
      await setAuthCookie(token);

      return NextResponse.json(
        {
          message: "Account created successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
