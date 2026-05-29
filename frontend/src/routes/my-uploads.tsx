import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Download, Trash2, Plus, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { authModal } from "@/lib/auth-modal";
import { fileMeta, formatNum, timeAgo } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/my-uploads")({ component: MyUploads });

function MyUploads() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) authModal.show("login", "Log in to view your uploads.");
  }, [user, loading]);

  const { data: items, isLoading } = useQuery({
    enabled: !!user,
    queryKey: ["my-uploads", user?.id],
    queryFn: () => apiFetch("/resources/my-uploads"),
  });

  const del = async (id: string, path: string) => {
    if (!confirm("Delete this resource?")) return;
    try {
      await supabase.storage.from("resources").remove([path]);
      await apiFetch(`/resources/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["my-uploads"] });
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  if (loading || isLoading)
    return (
      <SiteLayout>
        <div className="p-16 text-center">
          <Loader2 className="animate-spin mx-auto" />
        </div>
      </SiteLayout>
    );
  if (!user)
    return (
      <SiteLayout>
        <div className="p-16 text-center text-muted-foreground">Please log in.</div>
      </SiteLayout>
    );

  return (
    <SiteLayout>
      <div className="px-4 lg:px-8 py-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Uploads</h1>
              <p className="text-muted-foreground mt-1">{items?.length ?? 0} resources shared</p>
            </div>
            <Link to="/upload">
              <Button className="rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
                <Plus className="h-4 w-4 mr-1.5" /> New upload
              </Button>
            </Link>
          </div>

          {!items || items.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-dashed">
              <p className="font-medium mb-2">No uploads yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Share your first resource with the community.
              </p>
              <Link to="/upload">
                <Button className="rounded-lg bg-gradient-primary text-primary-foreground">
                  Upload Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((r) => {
                const meta = fileMeta(r.file_type);
                return (
                  <div
                    key={r.id}
                    className="bg-white border border-border/60 rounded-2xl p-5 hover:shadow-elevated transition-all"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${meta.color} font-bold text-xs shrink-0`}
                      >
                        {meta.label}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm leading-snug line-clamp-2">
                          {r.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{r.resource_type}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Download className="h-3.5 w-3.5" /> {formatNum(r.downloads)} •{" "}
                        {timeAgo(r.created_at)}
                      </span>
                      <button
                        onClick={() => del(r.id, r.file_path)}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
