import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({ component: ResetPage });

function ResetPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });
      const data = await response.json();
      setLoading(false);
      if (!response.ok) {
        return toast.error(data.error || "Reset failed");
      }
      toast.success("Password updated successfully!");
      navigate({ to: "/login" });
    } catch (err: any) {
      setLoading(false);
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[oklch(0.08_0.02_270)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Aurora Mesh Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-violet-600/30 to-purple-600/0 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-fuchsia-600/25 to-pink-600/0 blur-[120px] pointer-events-none" />

      {/* Constellations Background */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link to="/login" className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-6 transition-colors group">
          <ArrowLeft className="h-4 w-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Back to login
        </Link>

        {/* Logo */}
        <div className="flex flex-col items-center justify-center gap-2 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-white">
            Acad<span className="text-gradient">Vault</span>
          </span>
        </div>

        {/* Glass Box */}
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(139,92,246,0.2)]">
          <h1 className="text-2xl font-bold text-white mb-1.5">Set new password</h1>
          <p className="text-zinc-400 text-sm mb-6">Choose a secure password for your account.</p>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300 text-xs font-semibold">Verify Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="h-11 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:ring-violet-500/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 text-xs font-semibold">New Password</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 pr-10 focus:border-violet-500/50 focus:ring-violet-500/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-primary text-white hover:opacity-90 shadow-glow font-semibold transition-all mt-4 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Update Password</>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
