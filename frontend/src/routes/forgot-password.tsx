import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, GraduationCap, ArrowLeft, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPage });

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setLoading(false);
      if (!response.ok) {
        return toast.error(data.error || "Something went wrong");
      }
      setSent(true);
      toast.success("Password reset request received (mocked)");
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
          <h1 className="text-2xl font-bold text-white mb-1.5">Reset your password</h1>
          <p className="text-zinc-400 text-sm mb-6">
            {sent
              ? "We've sent a mock reset link to your email address."
              : "Enter your email address and we'll send you a link to reset your credentials."}
          </p>

          {sent ? (
            <div className="space-y-4 pt-2">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-4 rounded-xl flex items-start gap-3">
                <Sparkles className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Mock Email Dispatched</p>
                  <p className="text-xs text-emerald-400/80 mt-1">In development mode, you can directly set a new password by going to the reset page.</p>
                </div>
              </div>
              <Link to="/reset-password" className="block">
                <Button className="w-full h-11 rounded-xl bg-gradient-primary text-white hover:opacity-90 shadow-glow font-semibold transition-all">
                  Go to password reset page
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300 text-xs font-semibold">Email Address</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="h-11 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:ring-violet-500/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-primary text-white hover:opacity-90 shadow-glow font-semibold transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send reset link
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
