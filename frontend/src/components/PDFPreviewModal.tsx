import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Bookmark,
  Download,
  AlertTriangle,
  Star,
  ExternalLink,
  ChevronRight,
  Loader2,
  Clock,
  CheckCircle,
  Play,
  Github,
  Video,
  FileText,
  AlertOctagon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { authModal } from "@/lib/auth-modal";
import { previewModal, usePreviewModal } from "@/lib/preview-modal";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import { fileMeta, formatNum, timeAgo } from "@/lib/format";

export function PDFPreviewModal() {
  const { open, resource } = usePreviewModal();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [ratingHover, setRatingHover] = useState<number | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string>("Spam");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  // Re-fetch resource full details including live likes, ratings, and bookmark states when opened
  const { data: detail, refetch } = useQuery({
    enabled: !!resource?.id,
    queryKey: ["resource-detail", resource?.id],
    queryFn: async () => {
      // Find the resource from list or fetch detail
      const res = await apiFetch(`/resources`);
      const item = res.find((r: any) => r.id === resource.id);
      if (!item) throw new Error("Not found");
      return item;
    },
    initialData: resource,
  });

  // Fetch recommendations
  const { data: recs } = useQuery({
    enabled: !!resource?.id,
    queryKey: ["resource-recommendations", resource?.id],
    queryFn: () => apiFetch(`/resources/${resource.id}/recommendations`),
  });

  useEffect(() => {
    if (open && resource?.id) {
      refetch();
      setReportOpen(false);
      setReportDetails("");
    }
  }, [open, resource?.id]);

  if (!open || !detail) return null;

  const meta = fileMeta(detail.file_type);

  // Helper to parse YouTube IDs
  const getYoutubeEmbed = (url: string) => {
    if (!url) return null;
    const reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(reg);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const isYoutube = detail.url_link && getYoutubeEmbed(detail.url_link);
  const isGithub = detail.url_link && detail.url_link.toLowerCase().includes("github.com");
  const isDrive = detail.url_link && detail.url_link.toLowerCase().includes("drive.google.com");

  // User relations
  const isLiked = user && detail.likes?.includes(user.id);
  
  // Calculate average rating
  const avgRating = detail.ratings && detail.ratings.length > 0
    ? (detail.ratings.reduce((sum: number, r: any) => sum + r.score, 0) / detail.ratings.length).toFixed(1)
    : "N/A";

  // Check if current user has rated
  const userRating = user ? detail.ratings?.find((r: any) => r.user_id === user.id)?.score : 0;

  const handleLike = async () => {
    if (!user) {
      return authModal.show("login", "Log in to like this resource.");
    }
    try {
      await apiFetch(`/resources/${detail.id}/like`, { method: "POST" });
      refetch();
      qc.invalidateQueries({ queryKey: ["resources"] });
      qc.invalidateQueries({ queryKey: ["my-uploads"] });
      qc.invalidateQueries({ queryKey: ["saved"] });
      toast.success(isLiked ? "Like removed" : "Liked resource!");
    } catch (err: any) {
      toast.error(err.message || "Failed to like");
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      return authModal.show("login", "Log in to save this resource.");
    }
    try {
      await apiFetch(`/resources/${detail.id}/bookmark`, { method: "POST" });
      refetch();
      qc.invalidateQueries({ queryKey: ["resources"] });
      qc.invalidateQueries({ queryKey: ["saved"] });
      toast.success("Bookmark updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to bookmark");
    }
  };

  const handleRate = async (score: number) => {
    if (!user) {
      return authModal.show("login", "Log in to rate this resource.");
    }
    try {
      await apiFetch(`/resources/${detail.id}/rate`, {
        method: "POST",
        body: JSON.stringify({ score }),
      });
      refetch();
      qc.invalidateQueries({ queryKey: ["resources"] });
      toast.success("Thank you for your rating!");
    } catch (err: any) {
      toast.error(err.message || "Failed to rate");
    }
  };

  const handleDownload = async () => {
    // Correct URL parsing to handle both local file server and external links
    let fileUrl = detail.file_url;
    if (detail.file_path === "link" && detail.url_link) {
      fileUrl = detail.url_link;
    }

    if (!user) {
      // Intercept and cache the download action to auto-resume on successful authentication
      sessionStorage.setItem("pending_download", JSON.stringify(detail));
      return authModal.show("login", "Log in to download this resource.");
    }

    try {
      window.open(fileUrl, "_blank");
      await apiFetch(`/resources/${detail.id}/download`, { method: "POST" });
      refetch();
      qc.invalidateQueries({ queryKey: ["resources"] });
      toast.success(`Downloading "${detail.title}"`);
    } catch (err: any) {
      toast.error("Download failed to register.");
    }
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return authModal.show("login", "Log in to flag content.");
    }
    setSubmittingReport(true);
    try {
      await apiFetch(`/reports`, {
        method: "POST",
        body: JSON.stringify({
          resource_id: detail.id,
          reason: reportReason,
          details: reportDetails,
        }),
      });
      toast.success("Resource flagged successfully. Thank you for keeping AcadVault clean.");
      setReportOpen(false);
      setReportDetails("");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit report.");
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && previewModal.hide()}>
      <DialogContent className="max-w-4xl rounded-3xl p-0 overflow-hidden border-white/[0.08] bg-slate-950/95 backdrop-blur-2xl text-white shadow-[0_0_80px_-15px_rgba(139,92,246,0.35)] w-[95vw] max-h-[92vh] flex flex-col">
        {/* Ambient Top Bar */}
        <div className="flex h-14 border-b border-white/[0.06] items-center px-6 justify-between shrink-0 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${meta.color}`}>
              {meta.label}
            </span>
            <span className="text-xs text-slate-400 font-semibold truncate hidden sm:inline-block">
              {detail.category} • {detail.subject}
            </span>
          </div>
          {detail.verified && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
              <CheckCircle className="h-3 w-3" /> Verified notes
            </span>
          )}
        </div>

        {/* Modal Body Scroll Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          <div className="grid md:grid-cols-5 gap-8">
            
            {/* Left Preview Grid Area (3 Cols) */}
            <div className="md:col-span-3 space-y-6 flex flex-col h-full min-h-[300px] md:min-h-[420px]">
              <div className="flex-1 rounded-2xl overflow-hidden bg-slate-900/60 border border-white/[0.06] relative flex flex-col justify-center items-center p-1">
                {isYoutube ? (
                  <iframe
                    src={getYoutubeEmbed(detail.url_link!)!}
                    title={detail.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full min-h-[280px] rounded-xl border-0"
                  />
                ) : detail.file_type === "pdf" ? (
                  <iframe
                    src={
                      detail.file_path === "link"
                        ? detail.file_url
                        : `${API_BASE_URL}/resources/${detail.id}/file`
                    }
                    title={detail.title}
                    className="w-full h-full min-h-[350px] rounded-xl border-0"
                  />
                ) : (
                  <div className="text-center p-8 max-w-sm flex flex-col items-center">
                    <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-400 mb-4">
                      {isGithub ? <Github className="h-8 w-8 text-white" /> : isDrive ? <FileText className="h-8 w-8 text-sky-400" /> : <ExternalLink className="h-8 w-8 text-violet-400" />}
                    </div>
                    <h3 className="font-bold text-base mb-1">External Educational Resource</h3>
                    <p className="text-slate-400 text-xs mb-6">
                      This PPT, ZIP, or repository is hosted externally on safe cloud environments.
                    </p>
                    <Button
                      onClick={handleDownload}
                      className="rounded-full bg-gradient-primary text-white hover:opacity-90 shadow-glow font-bold px-6 py-2 text-xs flex items-center gap-2 cursor-pointer"
                    >
                      Access Material <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleLike}
                  variant="outline"
                  className={`flex-1 h-11 rounded-xl border-white/[0.08] hover:bg-white/[0.04] transition-all cursor-pointer ${
                    isLiked ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20 hover:text-red-500" : "text-slate-300"
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                  {isLiked ? "Liked" : "Like"} ({detail.likes?.length ?? 0})
                </Button>
                <Button
                  onClick={handleBookmark}
                  variant="outline"
                  className={`h-11 w-11 p-0 rounded-xl border-white/[0.08] hover:bg-white/[0.04] cursor-pointer ${
                    user?.bookmarks?.includes(detail.id) ? "bg-violet-500/10 border-violet-500/30 text-violet-400" : "text-slate-350"
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setReportOpen(!reportOpen)}
                  variant="outline"
                  className="h-11 w-11 p-0 rounded-xl border-white/[0.08] text-amber-500 bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 cursor-pointer"
                >
                  <AlertTriangle className="h-4 w-4" />
                </Button>
              </div>

              {/* Flag Report Expandable overlay */}
              {reportOpen && (
                <form onSubmit={submitReport} className="p-4 bg-slate-900/70 border border-amber-500/20 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <AlertOctagon className="h-3.5 w-3.5" /> Flag Resource
                    </span>
                    <button type="button" onClick={() => setReportOpen(false)} className="text-[10px] text-slate-400 hover:text-white">Cancel</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {["Spam", "Broken Link", "Duplicate", "Fake Material"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReportReason(r)}
                        className={`p-2 rounded-lg text-left border ${
                          reportReason === r
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold"
                            : "bg-slate-950 border-white/[0.05] text-slate-450"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      placeholder="Add details (optional)..."
                      className="h-9 rounded-xl bg-slate-950 border-white/[0.08] text-xs"
                    />
                    <Button
                      type="submit"
                      disabled={submittingReport}
                      className="bg-amber-500 text-slate-950 hover:bg-amber-400 h-9 font-bold px-4 rounded-xl text-xs flex items-center gap-1"
                    >
                      {submittingReport ? <Loader2 className="h-3 w-3 animate-spin" /> : "Submit"}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Information Area (2 Cols) */}
            <div className="md:col-span-2 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-white leading-tight line-clamp-3">
                    {detail.title}
                  </h2>
                  <p className="text-slate-450 text-xs mt-2 font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    Uploaded {timeAgo(detail.created_at)}
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-xs space-y-2">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Contributor Info</p>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-violet-600/30 flex items-center justify-center font-bold text-xs">
                        {detail.uploader_name?.charAt(0) || "S"}
                      </div>
                      <div>
                        <p className="font-extrabold text-white">{detail.uploader_name || "Anonymous Student"}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{detail.college || "AcadVault University"}</p>
                      </div>
                    </div>
                  </div>

                  {detail.description && (
                    <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-xs">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Details</p>
                      <p className="text-slate-300 leading-relaxed font-medium">{detail.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                      <p className="text-slate-500 text-[10px] font-bold uppercase mb-0.5">Rating</p>
                      <p className="font-extrabold text-white flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {avgRating} <span className="text-[10px] text-slate-500 font-semibold">({detail.ratings?.length ?? 0})</span>
                      </p>
                    </div>
                    <div className="p-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                      <p className="text-slate-500 text-[10px] font-bold uppercase mb-0.5">Downloads</p>
                      <p className="font-extrabold text-white">{formatNum(detail.downloads)}</p>
                    </div>
                  </div>
                </div>

                {/* Rating Picker */}
                <div className="space-y-2 pb-4 border-b border-white/[0.06]">
                  <p className="text-slate-450 text-[11px] font-bold uppercase tracking-wide">Rate this material</p>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onMouseEnter={() => setRatingHover(num)}
                        onMouseLeave={() => setRatingHover(null)}
                        onClick={() => handleRate(num)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            (ratingHover !== null ? num <= ratingHover : num <= (userRating || 0))
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-650"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Download Action Footer */}
              <div className="space-y-4 pt-4">
                <Button
                  onClick={handleDownload}
                  className="w-full h-12 rounded-2xl bg-gradient-primary text-white hover:opacity-90 shadow-glow font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Download className="h-5 w-5" /> Download Resources
                </Button>
              </div>
            </div>
          </div>

          {/* Recommendations Area */}
          {recs && recs.length > 0 && (
            <div className="pt-6 border-t border-white/[0.06] space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Related study materials</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {recs.map((r: any) => {
                  const rMeta = fileMeta(r.file_type);
                  return (
                    <div
                      key={r.id}
                      onClick={() => previewModal.show(r)}
                      className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl cursor-pointer hover:bg-white/[0.04] transition-all flex items-center gap-3"
                    >
                      <div className={`h-10 w-10 flex items-center justify-center rounded-xl font-bold text-[10px] shrink-0 ${rMeta.color}`}>
                        {rMeta.label}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate text-slate-100">{r.title}</p>
                        <p className="text-[10px] text-slate-500 truncate font-semibold mt-0.5">{r.subject}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
