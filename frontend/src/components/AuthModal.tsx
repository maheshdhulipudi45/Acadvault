import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authModal, useAuthModal } from "@/lib/auth-modal";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL } from "@/lib/api";

export function AuthModal() {
  const { open, mode, message } = useAuthModal();
  const { signIn, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", college_name: "" });

  useEffect(() => {
    if (!open) {
      setForm({ email: "", password: "", full_name: "", college_name: "" });
      setShowPw(false);
    }
  }, [open]);

  // Monitor auth changes to execute a cached download flow automatically
  useEffect(() => {
    if (user) {
      const pending = sessionStorage.getItem("pending_download");
      if (pending) {
        sessionStorage.removeItem("pending_download");
        try {
          const r = JSON.parse(pending);
          // Auto-repair legacy URLs missing '/public/' segment to prevent Supabase 400 Bad Request
          let fileUrl = r.file_url;
          if (fileUrl && fileUrl.includes("/storage/v1/object/resources/")) {
            fileUrl = fileUrl.replace("/storage/v1/object/resources/", "/storage/v1/object/public/resources/");
          }
          window.open(fileUrl, "_blank");
          // Trigger backend increment asynchronously
          fetch(`${API_BASE_URL}/resources/${r.id}/download`, { method: "POST" })
            .catch(err => console.error("Increment downloads from pending failed:", err));
          toast.success(`Download started for "${r.title}"`);
        } catch (e) {
          console.error("Execute pending download failed:", e);
        }
      }
    }
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Signup failed");
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
      } else {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        // ALSO log in to Supabase Auth to enable authenticated Storage uploads
        try {
          await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password
          });
        } catch (sbErr) {
          console.warn("Supabase Auth session bypass:", sbErr);
        }

        signIn(data.token, data.user);
        toast.success("Welcome back!");
      }
      authModal.hide();
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && authModal.hide()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-white/[0.08] bg-[oklch(0.08_0.02_270)]/95 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(139,92,246,0.2)]">
        <div className="p-8 relative">
          {/* Subtle Ambient Orb inside modal */}
          <div className="absolute top-[-20%] right-[-20%] w-[150px] h-[150px] rounded-full bg-violet-600/20 blur-[50px] pointer-events-none" />

          <DialogHeader className="mb-6 text-left">
            <DialogTitle className="text-2xl font-bold tracking-tight text-white">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm">
              {message ?? (mode === "signup"
                ? "Join thousands of students sharing knowledge."
                : "Log in to access and download resources.")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4 relative z-10">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-zinc-300 text-xs font-semibold">Full Name</Label>
                  <Input
                    id="full_name"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="John Doe"
                    className="h-11 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:ring-violet-500/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college_name" className="text-zinc-300 text-xs font-semibold">College Name</Label>
                  <Input
                    id="college_name"
                    required
                    value={form.college_name}
                    onChange={(e) => setForm({ ...form, college_name: e.target.value })}
                    placeholder="e.g. Stanford University"
                    className="h-11 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:ring-violet-500/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 text-xs font-semibold">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@college.edu"
                className="h-11 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:ring-violet-500/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300 text-xs font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? "Create Account" : "Log In"}
            </Button>

            <p className="text-center text-xs text-zinc-400 mt-4">
              {mode === "signup" ? "Already have an account? " : "New to AcadVault? "}
              <button
                type="button"
                onClick={() => authModal.setMode(mode === "signup" ? "login" : "signup")}
                className="text-violet-400 font-bold hover:text-violet-300 hover:underline transition-colors ml-1"
              >
                {mode === "signup" ? "Log in" : "Sign up"}
              </button>
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
