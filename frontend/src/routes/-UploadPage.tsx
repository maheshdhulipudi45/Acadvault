import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  UploadCloud,
  Loader2,
  X,
  FileText,
  Youtube,
  Github,
  Globe,
  Share2,
  FolderOpen,
  CheckCircle,
  AlertTriangle,
  FolderCheck,
  Star,
  ExternalLink,
  Plus,
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
import { motion, AnimatePresence } from "framer-motion";

type ResourceMode = "file" | "drive" | "youtube" | "website" | "github" | "interview" | "placement";

const CATEGORIES = [
  "BTech Notes",
  "MCA Notes",
  "Placement Prep",
  "Interview Prep",
  "Coding Resources",
  "Previous Papers",
  "Notes",
  "Websites",
  "Courses",
];

const SEMESTERS = [
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
];

const BRANCHES = ["CSE", "ECE", "EEE", "ME", "CE", "IT", "AI/ML", "MCA"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const POPULAR_TAGS = [
  "DBMS",
  "Java",
  "Interview",
  "MCA",
  "Placement",
  "DSA",
  "React",
  "Python",
  "Operating Systems",
  "Web Dev",
];

export function UploadPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<ResourceMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic state for auto-fetched GitHub repo info
  const [githubInfo, setGithubInfo] = useState<{
    name: string;
    stars: number;
    description: string;
    ownerAvatar: string;
  } | null>(null);

  // Dynamic state for auto-fetched YouTube details
  const [youtubePreview, setYoutubePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    university: "",
    college: "",
    branch: "",
    year: "",
    semester: "",
    subject: "",
    tags: [] as string[],
    tagInput: "",
    description: "",
    category: "BTech Notes",
    url_link: "",
    // Interview fields
    company_name: "",
    interview_topic: "",
    experience_level: "Entry Level",
    interview_category: "Technical Questions",
    interview_mode: "link" as "file" | "link",
    // Placement fields
    placement_mode: "link" as "file" | "link",
    company_type: "Product Based",
  });

  useEffect(() => {
    if (!loading && !user) {
      authModal.show("login", "Log in to upload resources.");
    }
  }, [user, loading]);

  // Handle live GitHub URL fetching
  useEffect(() => {
    if (mode === "github" && form.url_link) {
      const match = form.url_link.match(/github\.com\/([^/]+)\/([^/]+)/i);
      if (match && match[1] && match[2]) {
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, "");
        const timer = setTimeout(async () => {
          try {
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
            if (res.ok) {
              const data = await res.json();
              setGithubInfo({
                name: data.name,
                stars: data.stargazers_count,
                description: data.description || "No description provided.",
                ownerAvatar: data.owner?.avatar_url || "",
              });
              if (!form.title) {
                setForm((prev) => ({ ...prev, title: data.name }));
              }
              if (!form.description) {
                setForm((prev) => ({ ...prev, description: data.description || "" }));
              }
            }
          } catch (e) {
            console.warn("GitHub fetch error:", e);
          }
        }, 1200);
        return () => clearTimeout(timer);
      }
    } else {
      setGithubInfo(null);
    }
  }, [mode, form.url_link]);

  // Handle live YouTube playlist preview image extraction
  useEffect(() => {
    if (mode === "youtube" && form.url_link) {
      // Extract video ID from youtube playlist / video link to display dynamic preview thumbnail
      const playlistReg = /[?&]list=([^#&?]+)/;
      const videoReg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const playMatch = form.url_link.match(playlistReg);
      const vidMatch = form.url_link.match(videoReg);

      if (playMatch && playMatch[1]) {
        setYoutubePreview(
          `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80`,
        );
      } else if (vidMatch && vidMatch[2].length === 11) {
        setYoutubePreview(`https://i3.ytimg.com/vi/${vidMatch[2]}/0.jpg`);
      } else {
        setYoutubePreview(null);
      }
    } else {
      setYoutubePreview(null);
    }
  }, [mode, form.url_link]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="p-16 text-center">
          <Loader2 className="animate-spin mx-auto text-violet-600" />
        </div>
      </SiteLayout>
    );
  }
  if (!user) {
    return (
      <SiteLayout>
        <div className="p-16 text-center text-muted-foreground">
          Please log in to upload resources.
        </div>
      </SiteLayout>
    );
  }

  // Drag and drop event listeners
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  // Tag helper functions
  const addTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !form.tags.includes(cleanTag)) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, cleanTag],
        tagInput: "",
      }));
    }
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addTag(form.tagInput);
    }
  };

  // Submit form payload
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check basic metadata values
    const isFileUpload =
      mode === "file" ||
      (mode === "interview" && form.interview_mode === "file") ||
      (mode === "placement" && form.placement_mode === "file");

    if (isFileUpload && !file) {
      return toast.error("Please drag or select a local resource file");
    }

    if (!isFileUpload && !form.url_link) {
      return toast.error("Please provide a redirect URL link");
    }

    // Dynamic titles
    let titleToSubmit = form.title.trim();
    if (mode === "interview" && form.company_name) {
      titleToSubmit = `${form.company_name} - ${form.interview_topic || "Interview Q&As"}`;
    }

    if (!titleToSubmit) {
      return toast.error("Resource title is required");
    }

    setSubmitting(true);
    try {
      let file_data_base64: string | null = null;
      let ext_format = "link";

      if (isFileUpload && file) {
        ext_format = file.name.split(".").pop()?.toLowerCase() ?? "bin";
        if (!["pdf", "ppt", "pptx", "doc", "docx", "zip"].includes(ext_format)) {
          throw new Error("Allowed formats: PDF, PPT, DOCX, ZIP");
        }

        // Convert base64 stream
        file_data_base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
        });
      }

      // Live Duplicate Similarity Checks in Backend before sending
      // The backend /resources POST endpoint does automatic hashing, URL duplicate checking,
      // and metadata similarity validation to output custom 400 "Similar resource already exists." errors.

      const payload: any = {
        title: titleToSubmit,
        description: form.description || null,
        university: form.university || null,
        college: form.college || null,
        branch: form.branch || null,
        year: form.year || null,
        semester: form.semester || null,
        subject: form.subject || null,
        resource_type: mode === "file" ? "Notes" : mode,
        category: form.category,
        tags: form.tags,
        file_type: ext_format,
        file_data: file_data_base64,
        url_link: isFileUpload ? null : form.url_link,
      };

      // Set category fields mapping automatically
      if (mode === "drive") payload.category = "Google Drive Resources";
      else if (mode === "youtube") payload.category = "YouTube Courses";
      else if (mode === "website") payload.category = "Websites";
      else if (mode === "github") payload.category = "Coding Resources";
      else if (mode === "interview") payload.category = "Interview Prep";
      else if (mode === "placement") payload.category = "Placement Prep";

      const res = await apiFetch("/resources", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Academic resource successfully uploaded!");
      navigate({ to: "/my-uploads" });
    } catch (err: any) {
      toast.error(err.message || "Academic upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <div className="px-4 lg:px-8 py-10">
        <div className="mx-auto max-w-3xl">
          {/* Top Hero Banner */}
          <div className="rounded-[32px] bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border border-purple-100/50 p-8 md:p-10 mb-8 text-center shadow-[0_15px_40px_rgba(139,92,246,0.02)]">
            <UploadCloud
              className="h-12 w-12 mx-auto text-purple-600 mb-3 drop-shadow-sm animate-bounce"
              style={{ animationDuration: "3s" }}
            />
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-slate-900">
              Share Study{" "}
              <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Materials & Links
              </span>
            </h1>
            <p className="text-muted-foreground font-semibold text-sm">
              Reduce storage costs and build a collaborative ecosystem by sharing drive directories,
              playlist courses, or repositories.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="space-y-6 bg-white rounded-3xl border border-border/60 p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)]"
          >
            {/* Animated Tab Selector for Resource Type Dropdown */}
            <div className="space-y-2">
              <Label className="font-semibold text-slate-800 text-xs uppercase tracking-wide">
                Select Resource Sharing Format
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                {[
                  { id: "file", label: "PDF / File", icon: FileText },
                  { id: "drive", label: "Drive Link", icon: FolderOpen },
                  { id: "youtube", label: "YouTube Playlist", icon: Youtube },
                  { id: "website", label: "Website", icon: Globe },
                  { id: "github", label: "GitHub Repo", icon: Github },
                  { id: "interview", label: "Interview Material", icon: Share2 },
                  { id: "placement", label: "Placement PDF", icon: FolderCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setMode(item.id as any);
                        setFile(null);
                        setForm((prev) => ({ ...prev, url_link: "", title: "" }));
                      }}
                      className={`relative flex items-center gap-1.5 justify-center py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? "bg-slate-900 text-white shadow-md"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic fields based on active sharing mode */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* 1. PDF / FILE UPLOAD FIELDS */}
                {mode === "file" && (
                  <>
                    <div>
                      <Label className="mb-2 block font-semibold text-slate-800">
                        Upload Document <span className="text-destructive ml-0.5">*</span>
                      </Label>
                      {!file ? (
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-300 ${
                            dragActive
                              ? "border-violet-500 bg-violet-50/30 scale-[1.01] shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                              : "border-purple-100/80 bg-purple-50/10 hover:border-purple-300 hover:bg-purple-50/30"
                          }`}
                        >
                          <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                            <UploadCloud className="h-10 w-10 text-purple-500 mb-3 animate-pulse" />
                            <p className="font-bold text-slate-850">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-slate-500 font-semibold mt-1">
                              PDF, PPT, DOCX, ZIP (max 50MB)
                            </p>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.ppt,.pptx,.doc,.docx,.zip"
                              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between rounded-2xl bg-purple-50/40 border border-purple-100 p-4 shadow-sm">
                          <span className="text-sm font-bold text-slate-850 truncate">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="h-8 w-8 rounded-lg hover:bg-purple-100/50 flex items-center justify-center text-purple-600 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <Field label="Resource Title" required>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. DBMS Complete Lecture Notes"
                      />
                    </Field>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Subject Name">
                        <Input
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          placeholder="e.g. Database Management"
                        />
                      </Field>
                      <Field label="Semester">
                        <SelectInput
                          value={form.semester}
                          onChange={(v) => setForm({ ...form, semester: v })}
                          options={SEMESTERS}
                        />
                      </Field>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Branch">
                        <SelectInput
                          value={form.branch}
                          onChange={(v) => setForm({ ...form, branch: v })}
                          options={BRANCHES}
                        />
                      </Field>
                      <Field label="Academic Category">
                        <SelectInput
                          value={form.category}
                          onChange={(v) => setForm({ ...form, category: v })}
                          options={CATEGORIES}
                        />
                      </Field>
                    </div>
                  </>
                )}

                {/* 2. GOOGLE DRIVE LINK FIELDS */}
                {mode === "drive" && (
                  <>
                    <Field label="Google Drive URL" required>
                      <Input
                        value={form.url_link}
                        onChange={(e) => setForm({ ...form, url_link: e.target.value })}
                        placeholder="https://drive.google.com/drive/folders/..."
                      />
                    </Field>

                    {form.url_link && (
                      <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl flex items-start gap-3 text-xs text-sky-850">
                        <FolderOpen className="h-5 w-5 text-sky-500 shrink-0" />
                        <div>
                          <p className="font-bold">Google Drive Cloud Preview Active</p>
                          <p className="mt-0.5 text-slate-500">
                            Ensure the directory sharing permissions are set to 'Anyone with the
                            link' so students can access it.
                          </p>
                        </div>
                      </div>
                    )}

                    <Field label="Resource Title" required>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Distributed Systems Lab Records"
                      />
                    </Field>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Subject">
                        <Input
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          placeholder="e.g. Distributed Computing"
                        />
                      </Field>
                      <Field label="Semester">
                        <SelectInput
                          value={form.semester}
                          onChange={(v) => setForm({ ...form, semester: v })}
                          options={SEMESTERS}
                        />
                      </Field>
                    </div>
                  </>
                )}

                {/* 3. YOUTUBE PLAYLIST FIELDS */}
                {mode === "youtube" && (
                  <>
                    <Field label="YouTube Playlist / Video URL" required>
                      <Input
                        value={form.url_link}
                        onChange={(e) => setForm({ ...form, url_link: e.target.value })}
                        placeholder="https://www.youtube.com/playlist?list=..."
                      />
                    </Field>

                    {youtubePreview && (
                      <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative h-36 bg-slate-900">
                        <img
                          src={youtubePreview}
                          className="w-full h-full object-cover opacity-60"
                          alt="YouTube Course"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="h-10 w-10 bg-red-650 text-white rounded-full flex items-center justify-center shadow-lg">
                            <Youtube className="h-5 w-5" />
                          </span>
                        </div>
                        <span className="absolute bottom-3 left-3 text-[10px] bg-black/60 px-2 py-0.5 rounded text-white font-bold">
                          Course Playlist Preview
                        </span>
                      </div>
                    )}

                    <Field label="Playlist Title" required>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Complete Placement DSA Course"
                      />
                    </Field>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Subject">
                        <Input
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          placeholder="e.g. Data Structures"
                        />
                      </Field>
                      <Field label="Tags Category">
                        <SelectInput
                          value={form.category}
                          onChange={(v) => setForm({ ...form, category: v })}
                          options={CATEGORIES}
                        />
                      </Field>
                    </div>
                  </>
                )}

                {/* 4. EDUCATIONAL WEBSITE FIELDS */}
                {mode === "website" && (
                  <>
                    <Field label="Website URL" required>
                      <Input
                        value={form.url_link}
                        onChange={(e) => setForm({ ...form, url_link: e.target.value })}
                        placeholder="https://www.geeksforgeeks.org"
                      />
                    </Field>

                    {form.url_link && (
                      <div className="p-3 bg-white border border-slate-150 rounded-2xl flex items-center gap-3">
                        <img
                          src={`https://www.google.com/s2/favicons?sz=64&domain=${form.url_link}`}
                          onError={(e) => {
                            (e.target as any).src =
                              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=50";
                          }}
                          className="h-8 w-8 rounded-lg shrink-0 object-contain border border-slate-100"
                          alt="favicon"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {form.url_link}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            Educational site favicon preview
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Website Name" required>
                        <Input
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          placeholder="e.g. GeeksforGeeks Portal"
                        />
                      </Field>
                      <Field label="Category">
                        <SelectInput
                          value={form.category}
                          onChange={(v) => setForm({ ...form, category: v })}
                          options={CATEGORIES}
                        />
                      </Field>
                    </div>
                  </>
                )}

                {/* 5. GITHUB REPOSITORY FIELDS */}
                {mode === "github" && (
                  <>
                    <Field label="GitHub Repository URL" required>
                      <Input
                        value={form.url_link}
                        onChange={(e) => setForm({ ...form, url_link: e.target.value })}
                        placeholder="https://github.com/facebook/react"
                      />
                    </Field>

                    {githubInfo && (
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl text-white space-y-2 shadow-sm">
                        <div className="flex items-center gap-3 justify-between">
                          <div className="flex items-center gap-2">
                            {githubInfo.ownerAvatar && (
                              <img
                                src={githubInfo.ownerAvatar}
                                className="h-6 w-6 rounded-full"
                                alt=""
                              />
                            )}
                            <span className="font-extrabold text-xs">{githubInfo.name}</span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                            <Star className="h-3 w-3 fill-current" /> {githubInfo.stars} stars
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                          {githubInfo.description}
                        </p>
                      </div>
                    )}

                    <Field label="Repository Name" required>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. React Native Complete Project"
                      />
                    </Field>
                  </>
                )}

                {/* 6. INTERVIEW MATERIAL FIELDS */}
                {mode === "interview" && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Company Name" required>
                        <Input
                          value={form.company_name}
                          onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                          placeholder="e.g. Microsoft India"
                        />
                      </Field>
                      <Field label="Interview Topic" required>
                        <Input
                          value={form.interview_topic}
                          onChange={(e) => setForm({ ...form, interview_topic: e.target.value })}
                          placeholder="e.g. System Design Questions"
                        />
                      </Field>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Sharing Format
                      </Label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, interview_mode: "link" }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                            form.interview_mode === "link"
                              ? "bg-slate-900 border-transparent text-white"
                              : "bg-white border-zinc-200 text-slate-500"
                          }`}
                        >
                          Resource URL Link
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, interview_mode: "file" }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                            form.interview_mode === "file"
                              ? "bg-slate-900 border-transparent text-white"
                              : "bg-white border-zinc-200 text-slate-500"
                          }`}
                        >
                          Upload PDF / File
                        </button>
                      </div>
                    </div>

                    {form.interview_mode === "link" ? (
                      <Field label="Interview Link URL" required>
                        <Input
                          value={form.url_link}
                          onChange={(e) => setForm({ ...form, url_link: e.target.value })}
                          placeholder="https://drive.google.com/..."
                        />
                      </Field>
                    ) : (
                      <div>
                        <Label className="mb-2 block font-semibold text-slate-800">
                          Upload Interview PDF <span className="text-destructive ml-0.5">*</span>
                        </Label>
                        {!file ? (
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-purple-100/80 bg-purple-50/10 rounded-2xl p-10 cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-all duration-300">
                            <UploadCloud className="h-10 w-10 text-purple-500 mb-3 animate-pulse" />
                            <p className="font-bold text-slate-850">
                              Click to upload or drag and drop
                            </p>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf"
                              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                          </label>
                        ) : (
                          <div className="flex items-center justify-between rounded-2xl bg-purple-50/40 border border-purple-100 p-4">
                            <span className="text-sm font-bold text-slate-850 truncate">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFile(null)}
                              className="h-8 w-8 rounded-lg hover:bg-purple-100/50 flex items-center justify-center text-purple-600 transition"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Experience Level">
                        <SelectInput
                          value={form.experience_level}
                          onChange={(v) => setForm({ ...form, experience_level: v })}
                          options={["Entry Level", "Mid Level", "Senior Level"]}
                        />
                      </Field>
                      <Field label="Material Category">
                        <SelectInput
                          value={form.interview_category}
                          onChange={(v) => setForm({ ...form, interview_category: v })}
                          options={["HR Questions", "Technical Questions", "DSA", "Aptitude"]}
                        />
                      </Field>
                    </div>
                  </>
                )}

                {/* 7. PLACEMENT RESOURCE FIELDS */}
                {mode === "placement" && (
                  <>
                    <Field label="Placement Material Title" required>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. TCS Ninja 2026 Aptitude PDF"
                      />
                    </Field>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Sharing Format
                      </Label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, placement_mode: "link" }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                            form.placement_mode === "link"
                              ? "bg-slate-900 border-transparent text-white"
                              : "bg-white border-zinc-200 text-slate-500"
                          }`}
                        >
                          Resource URL Link
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, placement_mode: "file" }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                            form.placement_mode === "file"
                              ? "bg-slate-900 border-transparent text-white"
                              : "bg-white border-zinc-200 text-slate-500"
                          }`}
                        >
                          Upload PDF / File
                        </button>
                      </div>
                    </div>

                    {form.placement_mode === "link" ? (
                      <Field label="Placement Link URL" required>
                        <Input
                          value={form.url_link}
                          onChange={(e) => setForm({ ...form, url_link: e.target.value })}
                          placeholder="https://drive.google.com/..."
                        />
                      </Field>
                    ) : (
                      <div>
                        <Label className="mb-2 block font-semibold text-slate-800">
                          Upload Placement File <span className="text-destructive ml-0.5">*</span>
                        </Label>
                        {!file ? (
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-purple-100/80 bg-purple-50/10 rounded-2xl p-10 cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-all duration-300">
                            <UploadCloud className="h-10 w-10 text-purple-500 mb-3 animate-pulse" />
                            <p className="font-bold text-slate-850">
                              Click to upload or drag and drop
                            </p>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.ppt,.docx,.zip"
                              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                          </label>
                        ) : (
                          <div className="flex items-center justify-between rounded-2xl bg-purple-50/40 border border-purple-100 p-4">
                            <span className="text-sm font-bold text-slate-850 truncate">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFile(null)}
                              className="h-8 w-8 rounded-lg hover:bg-purple-100/50 flex items-center justify-center text-purple-600 transition"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Target Company Type">
                        <SelectInput
                          value={form.company_type}
                          onChange={(v) => setForm({ ...form, company_type: v })}
                          options={["Product Based", "Service Based", "Startup", "FAANG Giant"]}
                        />
                      </Field>
                      <Field label="College Campus">
                        <Input
                          value={form.college}
                          onChange={(e) => setForm({ ...form, college: e.target.value })}
                          placeholder="e.g. Stanford Campus"
                        />
                      </Field>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Smart tags system */}
            <div className="space-y-3.5 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <Label className="font-semibold text-slate-800">Smart Resource Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.tagInput}
                    onChange={(e) => setForm({ ...form, tagInput: e.target.value })}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Press enter or comma to insert tags..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTag(form.tagInput)}
                    className="rounded-xl border-zinc-200 text-slate-600 font-semibold cursor-pointer h-10 px-4 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4 animate-hover-spin" /> Add
                  </Button>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Suggested popular tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_TAGS.map((tag) => {
                    const clean = tag.toLowerCase();
                    const active = form.tags.includes(clean);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => (active ? removeTag(clean) : addTag(clean))}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                          active
                            ? "bg-violet-50 border-violet-200 text-violet-650"
                            : "bg-white border-slate-150 text-slate-500 hover:border-slate-350 hover:bg-slate-50"
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Tags list */}
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-slate-900 text-white font-extrabold text-[10px] tracking-wide uppercase px-2.5 py-1 rounded-full border border-slate-800 shadow-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-slate-400 hover:text-white rounded-full p-0.5 hover:bg-white/10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <Field label="Description / Explanatory Notes">
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Include a short summary explaining what topics are covered, previous years used, or helpful details..."
                rows={4}
              />
            </Field>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-2xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow font-bold cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting to database...
                </>
              ) : (
                <>Upload Resource to Vault</>
              )}
            </Button>
          </form>
        </div>
      </div>
    </SiteLayout>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="font-semibold text-slate-850 text-xs">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="rounded-xl h-10 border-zinc-200">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
