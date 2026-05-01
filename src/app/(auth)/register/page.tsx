"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, CheckSquare, Building2, Users } from "lucide-react";

type RegistrationType = "admin" | "member" | null;

export default function RegisterPage() {
  const router = useRouter();
  const [type, setType] = useState<RegistrationType>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body =
        type === "admin"
          ? { type: "admin", name, email, password, company_name: companyName }
          : { type: "member", name, email, password, company_code: companyCode };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-[400px] shadow-lg rounded-xl border-[#E2E8F0]">
      <CardHeader className="text-center pb-2 pt-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#0F172A]">Team Task Manager</h1>
        </div>
        <p className="text-sm text-[#64748B]">
          {type === null
            ? "How would you like to get started?"
            : type === "admin"
            ? "Create your workspace"
            : "Join your team"}
        </p>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        {type === null ? (
          // ─── Registration Type Selection ─────────────────────
          <div className="space-y-3">
            <button
              onClick={() => setType("admin")}
              className="w-full p-4 border-2 border-[#E2E8F0] rounded-lg hover:border-[#2563EB] transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Building2 className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A] text-sm">
                    Create a new workspace
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Set up your company and invite your team
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setType("member")}
              className="w-full p-4 border-2 border-[#E2E8F0] rounded-lg hover:border-[#2563EB] transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Users className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A] text-sm">
                    Join an existing workspace
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Enter your company code to join your team
                  </p>
                </div>
              </div>
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#64748B]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#2563EB] hover:text-[#1D4ED8] font-medium"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        ) : (
          // ─── Registration Form ──────────────────────────────
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-[#DC2626] text-sm rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-[#0F172A]">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-[#E2E8F0] focus-visible:ring-[#2563EB]"
              />
            </div>

            {type === "admin" && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="company-name"
                  className="text-sm font-medium text-[#0F172A]"
                >
                  Company Name
                </Label>
                <Input
                  id="company-name"
                  type="text"
                  placeholder="Acme Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="border-[#E2E8F0] focus-visible:ring-[#2563EB]"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-[#0F172A]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[#E2E8F0] focus-visible:ring-[#2563EB]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-[#0F172A]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="border-[#E2E8F0] focus-visible:ring-[#2563EB]"
              />
            </div>

            {type === "member" && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="company-code"
                  className="text-sm font-medium text-[#0F172A]"
                >
                  Company Code
                </Label>
                <Input
                  id="company-code"
                  type="text"
                  placeholder="e.g. ABCD1234"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                  required
                  maxLength={8}
                  className="border-[#E2E8F0] focus-visible:ring-[#2563EB] uppercase tracking-widest font-mono"
                />
                <p className="text-xs text-[#94A3B8]">
                  Ask your workspace admin for this code
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {type === "admin" ? "Creating workspace..." : "Joining workspace..."}
                </>
              ) : type === "admin" ? (
                "Create Workspace"
              ) : (
                "Join Workspace"
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                setType(null);
                setError("");
              }}
              className="w-full text-sm text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              ← Back to options
            </button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
