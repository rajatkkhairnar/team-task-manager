import { cn } from "@/lib/utils";

type TaskStatusType = "TODO" | "IN_PROGRESS" | "DONE" | "OVERDUE";

const statusConfig: Record<TaskStatusType, { label: string; className: string }> = {
  TODO: {
    label: "To Do",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  DONE: {
    label: "Done",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  OVERDUE: {
    label: "Overdue",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

interface StatusBadgeProps {
  status: string;
  isOverdue?: boolean;
  className?: string;
}

export default function StatusBadge({ status, isOverdue, className }: StatusBadgeProps) {
  const effectiveStatus = isOverdue && status !== "DONE" ? "OVERDUE" : status;
  const config = statusConfig[effectiveStatus as TaskStatusType] || statusConfig.TODO;

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
