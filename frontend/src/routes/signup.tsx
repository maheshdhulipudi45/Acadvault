import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, GraduationCap, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ full_name: "", college_name: "", email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      setLoading(false);
      if (!response.ok) {
        return toast.error(data.error || "Registration failed");
      }

      // ALSO register in Supabase Auth to enable authenticated Storage uploads
      try {
        const sbRes = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.full_name,
              college_name: form.college_name,
            }
          }
        });
        if (sbRes.error) {
          // Sign-up failed (e.g. user already registered), attempt signing in instead
          await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password
          });
        }
      } catch (sbErr) {
        // If signup raises an exception (e.g. 422), fallback to sign-in
        try {
          await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password
          });
        } catch (e) {
          console.warn("Supabase Auth registration and sign-in fallback failed:", e);
        }
      }

      signIn(data.token, data.user);
      toast.success("Welcome to AcadVault!");
      navigate({ to: "/" });
    } catch (err: any) {
      setLoading(false);
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[oklch(0.08_0.02_270)] flex flex-col items-center justify-start sm:justify-center p-4 pt-20 pb-10 sm:py-8 relative overflow-y-auto">
      {/* Premium Floating Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <Link
          to="/"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-2 text-sm text-zinc-400 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-white/20 hover:text-white px-4 py-2 rounded-xl transition-all shadow-sm group z-20"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
      </motion.div>

      {/* Aurora Mesh Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-violet-600/30 to-purple-600/0 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-fuchsia-600/25 to-pink-600/0 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[90px] animate-float-delayed pointer-events-none" />

      {/* Constellations Background */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 my-8">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
          className="flex flex-col items-center justify-center gap-2 mb-8"
        >
          <div className="h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-white">
            Acad<span className="text-gradient">Vault</span>
          </span>
          <p className="text-xs text-violet-400/80 font-medium tracking-wider uppercase inline-flex items-center gap-1.5 mt-1 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
            <Sparkles className="h-3.5 w-3.5" /> Start Sharing Knowledge
          </p>
        </motion.div>

        {/* Glass Box */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
          className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(139,92,246,0.2)]"
        >
          <h1 className="text-2xl font-bold text-white mb-1.5">Create your account</h1>
          <p className="text-zinc-400 text-sm mb-6">Join thousands of students learning smarter together.</p>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300 text-xs font-semibold">Full Name</Label>
              <Input
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="John Doe"
                className="h-11 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:ring-violet-500/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 text-xs font-semibold">College Name</Label>
              <Input
                required
                value={form.college_name}
                onChange={(e) => setForm({ ...form, college_name: e.target.value })}
                placeholder="e.g. Stanford University"
                className="h-11 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:ring-violet-500/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 text-xs font-semibold">Email Address</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@college.edu"
                className="h-11 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:ring-violet-500/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 text-xs font-semibold">Password</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
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
                <>Sign Up</>
              )}
            </Button>

            <p className="text-center text-xs text-zinc-400 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-violet-400 font-bold hover:text-violet-300 hover:underline transition-colors">
                Access your vault
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
