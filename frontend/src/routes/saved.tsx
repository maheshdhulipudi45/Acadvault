import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Bookmark,
  Star,
  Download,
  Sparkles,
  Loader2,
  BookOpen,
  Heart,
  CheckCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { authModal } from "@/lib/auth-modal";
import { previewModal } from "@/lib/preview-modal";
import { fileMeta, formatNum } from "@/lib/format";

export const Route = createFileRoute("/saved")({ component: SavedResources });

function SavedResources() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      authModal.show("login", "Please log in to view your saved bookmarks.");
    }
  }, [user, loading]);

  const {
    data: items,
    isLoading,
    refetch,
  } = useQuery({
    enabled: !!user,
    queryKey: ["saved", user?.id],
    queryFn: () => apiFetch("/resources/saved"),
  });

  if (loading || isLoading) {
    return (
      <SiteLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-violet-600 h-10 w-10" />
        </div>
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md text-center py-20 px-4">
          <Bookmark className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-sm text-slate-500 mb-6">
            Please log in or sign up to view and access your bookmarked study resources.
          </p>
          <Button
            onClick={() => authModal.show("login")}
            className="rounded-xl bg-gradient-primary text-white"
          >
            Log in to continue
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="px-4 lg:px-8 py-10">
        <div className="mx-auto max-w-[1200px]">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Saved Resources
              </h1>
              <p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-sm">
                <Bookmark className="h-4 w-4 text-violet-500 fill-current" />
                {items?.length ?? 0} saved educational documents & links
              </p>
            </div>
            <Link to="/resources">
              <Button
                variant="outline"
                className="rounded-xl border-zinc-200 hover:bg-slate-50 font-semibold cursor-pointer"
              >
                <BookOpen className="h-4 w-4 mr-2" /> Explore more resources
              </Button>
            </Link>
          </div>

          {/* Cards Grid */}
          {!items || items.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
              <Bookmark className="mx-auto h-12 w-12 text-slate-350 mb-3" />
              <p className="font-bold text-slate-800 text-lg mb-1">Your vault is empty</p>
              <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                Bookmark notes, previous semester exam papers, interview questions, or playlists to
                access them instantly from this page.
              </p>
              <Link to="/resources">
                <Button className="rounded-xl bg-gradient-primary text-white shadow-glow">
                  Find resources now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((r: any) => {
                const meta = fileMeta(r.file_type);
                const avgRating =
                  r.ratings && r.ratings.length > 0
                    ? (
                        r.ratings.reduce((sum: number, x: any) => sum + x.score, 0) /
                        r.ratings.length
                      ).toFixed(1)
                    : "N/A";

                return (
                  <div
                    key={r.id}
                    onClick={() => previewModal.show(r)}
                    className="group bg-white border border-border/60 rounded-3xl p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-violet-250 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Icon + Top category bar */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${meta.color} font-extrabold text-xs shrink-0 shadow-sm`}
                        >
                          {meta.label}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {r.category || "Study Material"}
                          </span>
                          {r.verified && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                              <CheckCircle className="h-2.5 w-2.5" /> Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & info */}
                      <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-violet-650 transition-colors">
                        {r.title}
                      </h3>
                      <p className="text-[11px] text-slate-450 mt-1.5 font-semibold">
                        {r.subject} • {r.semester}
                      </p>
                    </div>

                    {/* Stats footer bar */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-450 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Download className="h-3.5 w-3.5 text-slate-400" />
                        {formatNum(r.downloads)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5 text-red-400 fill-current" />
                        {r.likes?.length ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {avgRating}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
