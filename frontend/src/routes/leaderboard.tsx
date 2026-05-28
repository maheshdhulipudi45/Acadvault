import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Award } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { apiFetch } from "@/lib/api";
import { formatNum } from "@/lib/format";

export const Route = createFileRoute("/leaderboard")({ component: Leaderboard });

function Leaderboard() {
  const { data } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => apiFetch("/contributors"),
  });

  const ranks = [Trophy, Medal, Award];
  const rankColor = ["text-yellow-500 bg-yellow-50", "text-slate-500 bg-slate-100", "text-orange-500 bg-orange-50"];

  return (
    <SiteLayout>
      <div className="px-4 lg:px-8 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[32px] bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border border-purple-100/50 p-8 md:p-10 mb-8 text-center shadow-[0_15px_40px_rgba(139,92,246,0.02)]">
            <Trophy className="h-12 w-12 mx-auto text-yellow-500 mb-3 drop-shadow-sm" />
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-slate-900">
              Top <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">Contributors</span>
            </h1>
            <p className="text-muted-foreground font-semibold">Students sharing the most knowledge with the community.</p>
          </div>

          <div className="space-y-3">
            {(data ?? []).map((p, i) => {
              const Icon = ranks[i] ?? null;
              return (
                <div key={p.id} className={`flex items-center gap-4 bg-white border border-border/60 rounded-2xl p-4 ${i < 3 ? "shadow-card" : ""}`}>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold ${i < 3 ? rankColor[i] : "bg-muted text-muted-foreground"}`}>
                    {Icon ? <Icon className="h-5 w-5" /> : `#${i + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{p.full_name ?? "Anonymous"}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.college_name ?? "—"}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gradient">{formatNum(p.downloads)}</div>
                    <div className="text-xs text-muted-foreground">{p.uploads} uploads</div>
                  </div>
                </div>
              );
            })}
            {(!data || data.length === 0) && (
              <div className="text-center py-16 text-muted-foreground">No contributors yet. Be the first!</div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
