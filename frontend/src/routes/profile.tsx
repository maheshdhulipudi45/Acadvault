import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  User,
  Loader2,
  Sparkles,
  Save,
  GraduationCap,
  FileText,
  CheckCircle2,
  UserCircle2,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { authModal } from "@/lib/auth-modal";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({ component: ProfileDashboard });

const BRANCHES = ["CSE", "ECE", "EEE", "ME", "CE", "IT", "AI/ML", "MCA"];

const PRESET_AVATARS = [
  {
    name: "Avatar 1",
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Avatar 2",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Avatar 3",
    url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Avatar 4",
    url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Avatar 5",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Avatar 6",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
];

function ProfileDashboard() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    college_name: "",
    branch: "",
    bio: "",
    profile_image: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      authModal.show("login", "Log in to view your profile dashboard.");
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        college_name: user.college_name || "",
        branch: user.branch || "",
        bio: user.bio || "",
        profile_image: user.profile_image || "",
      });
    }
  }, [user]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
          <UserCircle2 className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Please sign in to view your account settings.
          </p>
        </div>
      </SiteLayout>
    );
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.college_name) {
      toast.error("Full Name and College Name are required.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiFetch("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(form),
      });

      if (response && response.user) {
        const token = localStorage.getItem("acadvault_token") || "";
        signIn(token, response.user);
        toast.success("Profile updated successfully!");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <div className="px-4 lg:px-8 py-10">
        <div className="mx-auto max-w-3xl">
          {/* Hero Header Card */}
          <div className="rounded-[32px] bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 border border-purple-100/50 p-8 md:p-10 mb-8 text-center shadow-[0_15px_40px_rgba(139,92,246,0.02)] relative overflow-hidden">
            <div className="absolute top-6 right-8 hidden md:block opacity-10">
              <GraduationCap className="h-24 w-24 text-purple-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-slate-900">
              Edit{" "}
              <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Profile
              </span>
            </h1>
            <p className="text-muted-foreground font-semibold">
              Customize your AcadVault student profile and showcase your contributions.
            </p>
          </div>

          <form
            onSubmit={saveProfile}
            className="space-y-8 bg-white rounded-3xl border border-border/60 p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)]"
          >
            {/* Profile Picture Selection */}
            <div>
              <Label className="mb-3 block font-bold text-slate-800">Choose Profile Avatar</Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
                {PRESET_AVATARS.map((avatar) => {
                  const isSelected = form.profile_image === avatar.url;
                  return (
                    <button
                      key={avatar.name}
                      type="button"
                      onClick={() => setForm({ ...form, profile_image: avatar.url })}
                      className={`relative rounded-full aspect-square overflow-hidden border-2 transition-all p-0.5 hover:scale-105 cursor-pointer ${
                        isSelected
                          ? "border-purple-600 shadow-md"
                          : "border-slate-200 hover:border-purple-300"
                      }`}
                    >
                      <img
                        src={avatar.url}
                        className="w-full h-full object-cover rounded-full"
                        alt={avatar.name}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-purple-600/10 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-purple-600 bg-white rounded-full shadow-sm" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom_avatar" className="text-zinc-500 text-xs font-semibold">
                  Or use a custom image URL
                </Label>
                <Input
                  id="custom_avatar"
                  value={form.profile_image}
                  onChange={(e) => setForm({ ...form, profile_image: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="rounded-xl border-border/60"
                />
              </div>
            </div>

            {/* Profile Info Form Fields */}
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="font-bold text-slate-800">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="rounded-xl border-border/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch" className="font-bold text-slate-800">
                    Branch / Major
                  </Label>
                  <Select
                    value={form.branch || "none"}
                    onValueChange={(v) => setForm({ ...form, branch: v === "none" ? "" : v })}
                  >
                    <SelectTrigger className="rounded-xl border-border/60">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None specified</SelectItem>
                      {BRANCHES.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="college_name" className="font-bold text-slate-800">
                  College / University Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="college_name"
                  required
                  value={form.college_name}
                  onChange={(e) => setForm({ ...form, college_name: e.target.value })}
                  placeholder="e.g. Stanford University"
                  className="rounded-xl border-border/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="font-bold text-slate-800">
                  Short Bio
                </Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell others a bit about your study interests, academic path, or career goals..."
                  rows={4}
                  className="rounded-xl border-border/60"
                />
              </div>
            </div>

            {/* Form actions */}
            <div className="flex gap-4 pt-4 border-t border-border/60">
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow font-bold px-8 h-12 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Profile
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/" })}
                className="rounded-xl border-border/60 text-slate-600 px-6 h-12 hover:bg-slate-50 cursor-pointer font-semibold"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </SiteLayout>
  );
}
