"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import RoleBadge from "@/components/role-badge";
import UserAvatar from "@/components/user-avatar";
import ConfirmationDialog from "@/components/confirmation-dialog";
import EmptyState from "@/components/empty-state";
import { formatDate } from "@/lib/format-date";
import { Trash2, Users, Shield } from "lucide-react";

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  _count: { project_memberships: number };
}

interface MembersListProps {
  members: MemberItem[];
  currentUserId: string;
  adminId: string;
}

export default function MembersList({
  members,
  currentUserId,
  adminId,
}: MembersListProps) {
  const router = useRouter();
  const [removingUser, setRemovingUser] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState<string | null>(null);

  async function handleRoleChange(userId: string, newRole: string) {
    setRoleLoading(userId);
    try {
      await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      router.refresh();
    } catch { /* ignore */ }
    finally { setRoleLoading(null); }
  }

  async function handleRemoveUser() {
    if (!removingUser) return;
    setRemoveLoading(true);
    try {
      await fetch(`/api/users/${removingUser}`, { method: "DELETE" });
      setRemovingUser(null);
      router.refresh();
    } catch { /* ignore */ }
    finally { setRemoveLoading(false); }
  }

  const removingMemberName = members.find((m) => m.id === removingUser)?.name;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Members</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            {members.length} team member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <Shield className="w-4 h-4" />
          Admin only
        </div>
      </div>

      {members.length > 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA]">
                <th className="text-left text-xs font-medium text-[#64748B] px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-[#64748B] px-4 py-3 hidden sm:table-cell">Email</th>
                <th className="text-left text-xs font-medium text-[#64748B] px-4 py-3">Role</th>
                <th className="text-left text-xs font-medium text-[#64748B] px-4 py-3 hidden md:table-cell">Projects</th>
                <th className="text-left text-xs font-medium text-[#64748B] px-4 py-3 hidden md:table-cell">Joined</th>
                <th className="w-16 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isOriginalAdmin = member.id === adminId;
                const isSelf = member.id === currentUserId;
                const canChangeRole = !isOriginalAdmin && !isSelf;
                const canRemove = !isOriginalAdmin && !isSelf;

                return (
                  <tr key={member.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFBFC]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={member.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-[#0F172A]">
                            {member.name}
                            {isSelf && <span className="text-xs text-[#94A3B8] ml-1">(you)</span>}
                          </p>
                          <p className="text-xs text-[#94A3B8] sm:hidden">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B] hidden sm:table-cell">{member.email}</td>
                    <td className="px-4 py-3">
                      {canChangeRole ? (
                        <Select
                          value={member.role}
                          onValueChange={(val) => { if (val) handleRoleChange(member.id, val); }}
                          disabled={roleLoading === member.id}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="EMPLOYEE">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <RoleBadge role={member.role} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B] hidden md:table-cell">
                      {member._count.project_memberships}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#94A3B8] hidden md:table-cell">
                      {formatDate(member.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {canRemove && (
                        <button
                          onClick={() => setRemovingUser(member.id)}
                          className="text-[#94A3B8] hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No members"
          description="Share your company code to invite team members."
        />
      )}

      <ConfirmationDialog
        open={!!removingUser}
        onOpenChange={() => setRemovingUser(null)}
        title="Remove Member"
        description={`Are you sure you want to remove ${removingMemberName || "this member"} from the workspace? This will also remove them from all projects.`}
        confirmLabel="Remove Member"
        onConfirm={handleRemoveUser}
        loading={removeLoading}
        variant="danger"
      />
    </>
  );
}
