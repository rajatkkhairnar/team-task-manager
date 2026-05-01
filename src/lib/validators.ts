import { z } from "zod";

// ─── Auth Schemas ───────────────────────────────────────────

export const registerAdminSchema = z.object({
  type: z.literal("admin"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  company_name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
});

export const registerMemberSchema = z.object({
  type: z.literal("member"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
  company_code: z
    .string()
    .length(8, "Company code must be exactly 8 characters")
    .toUpperCase(),
});

export const registerSchema = z.discriminatedUnion("type", [
  registerAdminSchema,
  registerMemberSchema,
]);

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Project Schemas ────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

// ─── Task Schemas ───────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(200, "Task title must be less than 200 characters"),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .optional(),
  assignee_id: z.string().optional(),
  due_date: z.string().datetime().optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(200, "Task title must be less than 200 characters")
    .optional(),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .nullable(),
  assignee_id: z.string().optional().nullable(),
  due_date: z.string().datetime().optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
});

// Employee can only update task status
export const updateTaskStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
});

// ─── Comment Schemas ────────────────────────────────────────

export const createCommentSchema = z.object({
  body: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be less than 2000 characters"),
});

// ─── User Role Schema ───────────────────────────────────────

export const updateRoleSchema = z.object({
  role: z.enum(["MANAGER", "EMPLOYEE"]),
});

// ─── Project Member Schema ──────────────────────────────────

export const addMemberSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
});

// ─── Type Exports ───────────────────────────────────────────

export type RegisterAdminInput = z.infer<typeof registerAdminSchema>;
export type RegisterMemberInput = z.infer<typeof registerMemberSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
