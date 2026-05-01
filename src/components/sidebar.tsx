"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  LogOut,
  Menu,
  X,
  CheckSquare,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  company_id: string;
}

interface SidebarProps {
  user: AuthUser;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
  },
  {
    href: "/projects",
    label: "Projects",
    icon: FolderKanban,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
  },
  {
    href: "/members",
    label: "Members",
    icon: Users,
    roles: ["ADMIN"],
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  return colors[Math.abs(hash) % colors.length];
}

function getRoleBadgeClass(role: string) {
  switch (role) {
    case "ADMIN":
      return "bg-blue-500/20 text-blue-300";
    case "MANAGER":
      return "bg-emerald-500/20 text-emerald-300";
    default:
      return "bg-slate-500/20 text-slate-300";
  }
}

function NavContent({ user, pathname }: { user: AuthUser; pathname: string }) {
  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <CheckSquare className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-white tracking-tight">
            TaskManager
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                  : "text-[#CBD5E1] hover:text-white hover:bg-white/8"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(
              user.name
            )}`}
          >
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.name}
            </p>
            <span
              className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5 ${getRoleBadgeClass(
                user.role
              )}`}
            >
              {user.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 mt-1 rounded-lg text-sm text-[#CBD5E1] hover:text-white hover:bg-white/8 transition-all cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-[250px] md:flex-shrink-0 bg-[#0F172A] h-screen sticky top-0">
        <div className="w-full">
          <NavContent user={user} pathname={pathname} />
        </div>
      </aside>

      {/* Mobile header + sheet */}
      <div className="md:hidden sticky top-0 z-40 bg-[#0F172A] flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <CheckSquare className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">TaskManager</span>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] p-0 bg-[#0F172A] border-r-white/10">
            <NavContent user={user} pathname={pathname} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
