import { NextRequest, NextResponse } from "next/server";
import { AuthUser } from "@/lib/auth";

/**
 * Extract the authenticated user from middleware-injected headers.
 * This should be used in all protected API routes.
 */
export function getRequestUser(request: NextRequest): AuthUser | null {
  const id = request.headers.get("x-user-id");
  const email = request.headers.get("x-user-email");
  const name = request.headers.get("x-user-name");
  const role = request.headers.get("x-user-role") as
    | "ADMIN"
    | "MANAGER"
    | "EMPLOYEE"
    | null;
  const company_id = request.headers.get("x-user-company-id");

  if (!id || !email || !name || !role || !company_id) {
    return null;
  }

  return { id, email, name, role, company_id };
}

/**
 * Require authentication - returns the user or a 401 response.
 * Usage: const [user, errorResponse] = requireAuth(request);
 *        if (errorResponse) return errorResponse;
 */
export function requireAuth(
  request: NextRequest
): [AuthUser, null] | [null, NextResponse] {
  const user = getRequestUser(request);
  if (!user) {
    return [
      null,
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    ];
  }
  return [user, null];
}

/**
 * Require a specific role or higher.
 * Role hierarchy: ADMIN > MANAGER > EMPLOYEE
 */
export function requireRole(
  request: NextRequest,
  ...allowedRoles: ("ADMIN" | "MANAGER" | "EMPLOYEE")[]
): [AuthUser, null] | [null, NextResponse] {
  const [user, errorResponse] = requireAuth(request);
  if (errorResponse) return [null, errorResponse];

  if (!allowedRoles.includes(user.role)) {
    return [
      null,
      NextResponse.json(
        { error: "You do not have permission to perform this action" },
        { status: 403 }
      ),
    ];
  }

  return [user, null];
}
