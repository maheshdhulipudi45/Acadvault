import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  Filter,
  SlidersHorizontal,
  Eye,
  Calendar,
  BookOpen,
  GraduationCap,
  Sparkles,
  X,
  ArrowUpDown,
  FileText,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  FolderOpen,
  Youtube,
  Github,
  Globe,
  Briefcase,
  Award,
  CheckCircle,
  Play,
  Star,
  ChevronRight,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { fileMeta, formatNum, timeAgo } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { authModal } from "@/lib/auth-modal";
import { previewModal } from "@/lib/preview-modal";
import { toast } from "sonner";

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
  validateSearch: (s: Record<string, unknown>) => ({ q: (s.q as string) ?? "" }),
});

const SEMESTERS = [
  "All",
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
];

const BRANCHES = ["All", "CSE", "ECE", "EEE", "ME", "CE", "IT", "AI/ML", "MCA"];

const STREAMS = [
  "All",
  "BTech",
  "MCA",
  "Interview Prep",
  "Placement Materials",
  "Coding Resources",
];

const FORMATS = [
  "All",
  "PDFs",
  "Drive Links",
  "Websites",
  "YouTube Courses",
  "GitHub Repositories",
];

const TYPES = [
  "All",
  "Notes",
  "Previous Papers",
  "Lab Records",
  "Assignments",
  "Study Materials",
  "Books",
];

const SORTS = [
  { value: "newest", label: "Newest Uploads" },
  { value: "popular", label: "Most Downloaded" },
  { value: "az", label: "Title A → Z" },
];

const QUICK_CHIPS = [
  { label: "Notes", value: "Notes", type: "type" },
  { label: "Previous Papers", value: "Previous Papers", type: "type" },
  { label: "BTech Notes", value: "BTech", type: "stream" },
  { label: "MCA Notes", value: "MCA", type: "stream" },
  { label: "Interview Prep", value: "Interview Prep", type: "stream" },
];

const AUTOCOMPLETE_SUGGESTIONS = [
  "DBMS Notes",
  "MCA Java",
  "Placement PDF",
  "Interview Questions",
  "React Course",
  "DSA Playlist",
];

function ResourcesPage() {
  const search = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [q, setQ] = useState(search.q);
  const [semester, setSemester] = useState("All");
  const [branch, setBranch] = useState("All");
  const [stream, setStream] = useState("All");
  const [format, setFormat] = useState("All");
  const [type, setType] = useState("All");
  const [sort, setSort] = useState("newest");
  const [verifiedOnly, setVerifiedOnly] = useState("All"); // "All" | "Verified Only"

  // Query Real uploaded resources from MongoDB Atlas database
  const { data: resources, isLoading } = useQuery({
    queryKey: ["resources"],
    queryFn: () => apiFetch("/resources"),
  });

  const filtered = useMemo(() => {
    let list = (resources ?? []).filter((r: any) => {
      // Search Query Filter with smart fuzzy keyword matching
      if (q) {
        const queryClean = q.toLowerCase().trim();
        const searchStr = `${r.title} ${r.subject ?? ""} ${r.description ?? ""} ${r.college ?? ""} ${r.category ?? ""}`.toLowerCase();
        
        // Exact match or partial token matching
        const words = queryClean.split(/\s+/);
        const matchesAllWords = words.every((word) => searchStr.includes(word));
        if (!matchesAllWords) return false;
      }

      // Semester Filter
      if (semester !== "All" && r.semester !== semester) return false;

      // Branch Filter
      if (branch !== "All" && r.branch !== branch) return false;

      // Stream / Program Filter (mapped categories)
      if (stream !== "All") {
        const cat = (r.category || "").toLowerCase();
        if (stream === "BTech" && !cat.includes("btech")) return false;
        if (stream === "MCA" && !cat.includes("mca")) return false;
        if (stream === "Interview Prep" && !cat.includes("interview")) return false;
        if (stream === "Placement Materials" && !cat.includes("placement")) return false;
        if (stream === "Coding Resources" && !cat.includes("coding")) return false;
      }

      // Resource Type Filter
      if (type !== "All" && r.resource_type !== type) return false;

      // File Format / Link sharing Filter
      if (format !== "All") {
        const rExt = (r.file_type || "").toLowerCase();
        const cat = (r.category || "").toLowerCase();
        if (format === "PDFs" && rExt !== "pdf") return false;
        if (format === "Drive Links" && !cat.includes("drive")) return false;
        if (format === "Websites" && !cat.includes("website")) return false;
        if (format === "YouTube Courses" && !cat.includes("youtube")) return false;
        if (format === "GitHub Repositories" && !cat.includes("coding")) return false;
      }

      // Verified Filter
      if (verifiedOnly === "Verified Only" && !r.verified) return false;

      return true;
    });

    if (sort === "popular") {
      list = [...list].sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));
    } else if (sort === "az") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [resources, q, semester, branch, stream, type, format, sort, verifiedOnly]);

  const activeFilters = [
    semester !== "All" && { label: semester, clear: () => setSemester("All") },
    branch !== "All" && { label: branch, clear: () => setBranch("All") },
    stream !== "All" && { label: `Program: ${stream}`, clear: () => setStream("All") },
    format !== "All" && { label: `Format: ${format}`, clear: () => setFormat("All") },
    type !== "All" && { label: type, clear: () => setType("All") },
    verifiedOnly !== "All" && { label: "Verified Only", clear: () => setVerifiedOnly("All") },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const clearAll = () => {
    setSemester("All");
    setBranch("All");
    setStream("All");
    setFormat("All");
    setType("All");
    setVerifiedOnly("All");
    setQ("");
  };

  const handleQuickChip = (chip: typeof QUICK_CHIPS[0]) => {
    if (chip.type === "type") {
      setType(type === chip.value ? "All" : chip.value);
    } else if (chip.type === "stream") {
      setStream(stream === chip.value ? "All" : chip.value);
    }
  };

  // Secure download & redirect flow
  const download = async (r: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    let fileUrl = r.file_url;
    if (r.file_path === "link" && r.url_link) {
      fileUrl = r.url_link;
    }

    if (!user) {
      // Intercept Action: save resource details in sessionStorage and prompt user login
      sessionStorage.setItem("pending_download", JSON.stringify(r));
      authModal.show("login", `Log in to access this premium resource. It's free!`);
      return;
    }

    try {
      window.open(fileUrl, "_blank");
      await apiFetch(`/resources/${r.id}/download`, { method: "POST" });
      toast.success("Redirecting to resource folder...");
    } catch (err: any) {
      console.error("Increment downloads failed:", err);
    }
  };

  // YouTube preview ID
  const getYoutubeEmbedId = (url: string) => {
    if (!url) return null;
    const reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(reg);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Dynamic intelligent card renderer
  const renderCardContent = (r: any) => {
    const meta = fileMeta(r.file_type);
    const avgRating =
      r.ratings && r.ratings.length > 0
        ? (r.ratings.reduce((sum: number, x: any) => sum + x.score, 0) / r.ratings.length).toFixed(1)
        : "N/A";

    const isYoutube = r.url_link && getYoutubeEmbedId(r.url_link);
    const isGithub = r.url_link && r.url_link.toLowerCase().includes("github.com");
    const isDrive = r.url_link && r.url_link.toLowerCase().includes("drive.google.com");
    const isWebsite = r.file_type === "link" && !isYoutube && !isGithub && !isDrive;

    return (
      <article
        onClick={() => previewModal.show(r)}
        className="group bg-white border border-border/60 rounded-3xl p-5 hover:shadow-elevated hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[240px] relative overflow-hidden"
      >
        <div>
          {/* Top badges bar */}
          <div className="flex items-start justify-between mb-3.5">
            {isYoutube ? (
              <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-650 flex items-center justify-center shadow-sm">
                <Youtube className="h-5 w-5" />
              </div>
            ) : isGithub ? (
              <div className="h-10 w-10 rounded-xl bg-slate-900/10 text-slate-800 flex items-center justify-center shadow-sm">
                <Github className="h-5 w-5" />
              </div>
            ) : isDrive ? (
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shadow-sm">
                <FolderOpen className="h-5 w-5" />
              </div>
            ) : isWebsite ? (
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center shadow-sm">
                <Globe className="h-5 w-5" />
              </div>
            ) : (
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.color} font-bold text-xs shadow-sm border border-white`}>
                {meta.label}
              </div>
            )}

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {r.category || "Study Material"}
              </span>
              {r.verified && (
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-0.5 shadow-sm">
                  <CheckCircle className="h-2.5 w-2.5 fill-current text-blue-500" /> Verified
                </span>
              )}
            </div>
          </div>

          {/* Dynamic details inside card */}
          {isYoutube ? (
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-violet-650 transition-colors">
                {r.title}
              </h3>
              {isYoutube && (
                <div className="rounded-xl overflow-hidden h-24 bg-slate-900 relative">
                  <img
                    src={`https://i3.ytimg.com/vi/${isYoutube}/0.jpg`}
                    className="w-full h-full object-cover opacity-60"
                    alt=""
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="h-7 w-7 bg-red-600 text-white rounded-full flex items-center justify-center shadow"><Play className="h-3.5 w-3.5 fill-current" /></span>
                  </div>
                </div>
              )}
            </div>
          ) : isGithub ? (
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-violet-650 transition-colors">
                {r.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold line-clamp-2">
                {r.description || "Open source repository containing lecture tutorials and coding guides."}
              </p>
            </div>
          ) : isDrive ? (
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-violet-650 transition-colors">
                {r.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold">
                Google Drive Shared Folder
              </p>
            </div>
          ) : isWebsite ? (
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-[#6366F1] transition-colors">
                {r.title}
              </h3>
              <div className="flex items-center gap-1 text-[10px] text-violet-600 font-bold">
                <img
                  src={`https://www.google.com/s2/favicons?sz=32&domain=${r.url_link}`}
                  onError={(e) => {
                    (e.target as any).style.display = "none";
                  }}
                  className="h-3 w-3 object-contain shrink-0"
                  alt=""
                />
                <span className="truncate max-w-[150px]">{r.url_link}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold line-clamp-2">
                {r.description || "Educational portal."}
              </p>
            </div>
          ) : (
            // PDF/File representation
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-violet-650 transition-colors">
                {r.title}
              </h3>
              {r.subject && <p className="text-xs text-slate-400 font-semibold">{r.subject}</p>}
              <div className="flex flex-wrap gap-1 mt-1">
                {r.semester && <Chip>{r.semester}</Chip>}
                {r.branch && <Chip>{r.branch}</Chip>}
              </div>
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-slate-450 font-bold">
            <div className="flex items-center gap-2">
              <img
                src={r.uploader_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80"}
                className="h-5 w-5 rounded-full object-cover border border-slate-100"
                alt=""
              />
              <span className="truncate max-w-[120px]">{r.uploader_name || "Anonymous Student"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5"><Download className="h-3 w-3 text-slate-400" /> {formatNum(r.downloads)}</span>
              <span className="inline-flex items-center gap-0.5 text-amber-500"><Star className="h-3 w-3 fill-current text-amber-400" /> {avgRating}</span>
            </div>
          </div>

          <div className="flex justify-between items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                previewModal.show(r);
              }}
              className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-850 hover:bg-slate-50 border border-slate-150 rounded-xl transition cursor-pointer text-center"
            >
              Explore Info
            </button>
            <Button
              size="sm"
              onClick={(e) => download(r, e)}
              className="flex-1 rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90 font-bold text-[10px] uppercase h-9 cursor-pointer shadow-sm flex items-center justify-center gap-1"
            >
              {isYoutube ? (
                <>Watch Course</>
              ) : isGithub ? (
                <>Open Repo</>
              ) : isDrive ? (
                <>Open Drive</>
              ) : isWebsite ? (
                <>Visit Link</>
              ) : (
                <>Download File</>
              )}
            </Button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <SiteLayout>
      <div className="px-4 lg:px-8 mt-8">
        <div className="mx-auto max-w-[1400px]">
          
          {/* Page Banner */}
          <div className="rounded-[32px] bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border border-purple-100/50 p-8 md:p-10 mb-8 relative overflow-hidden shadow-[0_15px_40px_rgba(139,92,246,0.02)]">
            <div className="absolute top-6 right-8 hidden md:block">
              <BookOpen className="h-20 w-20 text-purple-400/20 animate-pulse" style={{ animationDuration: '4s' }} />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-1.5 text-xs font-bold text-purple-700 mb-4 border border-purple-100 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#FF9800] fill-[#FF9800]/10 animate-bounce" /> {filtered.length} resources available
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-slate-900">
              Explore <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">Resources</span>
            </h1>
            <p className="text-muted-foreground mb-6 max-w-xl font-semibold text-sm">
              Search lecture summaries, dynamic repositories, previous exam papers, and course playlists verified by administrators.
            </p>
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for DBMS Notes, MCA Java, Placement PDF..."
                className="pl-12 pr-4 h-13 rounded-full bg-white border-white shadow-card focus-visible:ring-1 focus-visible:ring-purple-500/20"
              />
            </div>

            {/* Keyword Autocomplete Suggestions list */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Suggestions:</span>
              {AUTOCOMPLETE_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setQ(suggestion)}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-150 text-slate-500 hover:text-slate-800 hover:border-slate-350 transition cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
            
            {/* Filter sidebar */}
            <aside className="bg-white border border-border/60 rounded-3xl p-6 shadow-card lg:sticky lg:top-20">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-pastel-purple flex items-center justify-center shadow-sm">
                    <SlidersHorizontal className="h-4 w-4 text-violet-600" />
                  </div>
                  <h2 className="font-bold text-slate-850 text-sm">Filters</h2>
                </div>
                {(activeFilters.length > 0 || q) && (
                  <button onClick={clearAll} className="text-xs text-[#8B5CF6] font-bold hover:underline cursor-pointer">
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-5">
                
                <FormField label="Stream / Program" icon={<GraduationCap className="h-3.5 w-3.5" />}>
                  <Select value={stream} onValueChange={setStream}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/40 border-border/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STREAMS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Sharing Format" icon={<FileText className="h-3.5 w-3.5" />}>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/40 border-border/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FORMATS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Verification Status" icon={<CheckCircle className="h-3.5 w-3.5" />}>
                  <Select value={verifiedOnly} onValueChange={setVerifiedOnly}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/40 border-border/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Resources</SelectItem>
                      <SelectItem value="Verified Only">Verified Only</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Resource Type" icon={<BookOpen className="h-3.5 w-3.5" />}>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/40 border-border/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Semester" icon={<Calendar className="h-3.5 w-3.5" />}>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/40 border-border/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SEMESTERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Branch / Major" icon={<GraduationCap className="h-3.5 w-3.5" />}>
                  <Select value={branch} onValueChange={setBranch}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/40 border-border/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Sort by" icon={<ArrowUpDown className="h-3.5 w-3.5" />}>
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/40 border-border/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SORTS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>

                <div className="pt-3 border-t border-border/60">
                  <Link to="/upload">
                    <Button className="w-full rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow h-11 font-bold cursor-pointer">
                      <Sparkles className="h-4 w-4 mr-2" /> Share a Resource
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground text-center mt-3 font-semibold">Help others by uploading study notes.</p>
                </div>
              </div>
            </aside>

            {/* Content list */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="text-sm text-muted-foreground font-semibold">
                  {isLoading ? (
                    "Loading resources..."
                  ) : (
                    <>
                      <span className="font-bold text-foreground">{filtered.length}</span>{" "}
                      {filtered.length === 1 ? "resource" : "resources"} found
                    </>
                  )}
                </div>
                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {activeFilters.map((f) => (
                      <button
                        key={f.label}
                        onClick={f.clear}
                        className="inline-flex items-center gap-1 rounded-full bg-pastel-purple/60 px-3 py-1 text-xs font-bold text-violet-700 hover:bg-pastel-purple cursor-pointer shadow-sm"
                      >
                        {f.label} <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Premium Empty State */}
              {filtered.length === 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 rounded-[32px] border border-dashed border-purple-200 bg-purple-50/5 p-8 flex flex-col items-center justify-center"
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="h-16 w-16 bg-gradient-to-br from-purple-100 to-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm relative z-10 border border-purple-100"
                  >
                    <FileQuestion className="h-9 w-9 text-purple-650" />
                  </motion.div>

                  <h3 className="text-xl font-bold text-slate-850 mb-2 relative z-10">No resources matched your search</h3>
                  <p className="text-sm text-slate-500 max-w-sm font-semibold mb-6 relative z-10">
                    We couldn't find anything matching your exact filters. Try adjusting them or upload notes to help seniors!
                  </p>
                  
                  <Link to="/upload" className="relative z-10">
                    <Button className="rounded-full bg-gradient-primary text-white hover:opacity-90 shadow-glow px-6 font-bold flex items-center gap-2 cursor-pointer">
                      <Download className="h-4 w-4" /> Share a Resource
                    </Button>
                  </Link>
                </motion.div>
              )}

              {/* Loading skeletons */}
              {isLoading && (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white border border-border/60 rounded-3xl p-5 h-56 animate-pulse">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 mb-4" />
                      <div className="h-4 w-3/4 bg-slate-100 rounded mb-2" />
                      <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>
              )}

              {/* Card lists */}
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((r: any) => (
                  <div key={r.id}>
                    {renderCardContent(r)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
        {icon} {label}
      </Label>
      {children}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-slate-500">
      {children}
    </span>
  );
}
