import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accentColor?: string;
  subtext?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  accentColor = "#2563EB",
  subtext,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#64748B]">{label}</p>
          <p className="text-3xl font-bold text-[#0F172A] mt-1.5">{value}</p>
          {subtext && (
            <p className="text-xs text-[#94A3B8] mt-1">{subtext}</p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: accentColor }} />
        </div>
      </div>
      <div
        className="h-1 w-12 rounded-full mt-4"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  );
}
