import { cn } from "@/lib/utils";

const roleConfig: Record<string, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  MANAGER: {
    label: "Manager",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  EMPLOYEE: {
    label: "Employee",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export default function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role] || roleConfig.EMPLOYEE;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
