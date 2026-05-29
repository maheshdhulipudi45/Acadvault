import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Shield,
  Users,
  FileText,
  CheckCircle,
  Download,
  AlertOctagon,
  Trash2,
  Check,
  TrendingUp,
  Award,
  Loader2,
  Ban,
  Filter,
  RefreshCw,
  Search,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { authModal } from "@/lib/auth-modal";
import { apiFetch } from "@/lib/api";
import { formatNum, timeAgo } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({ component: AdminDashboard });

function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"analytics" | "verify" | "reports" | "users">(
    "analytics",
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        authModal.show("login", "Administration privileges required. Please log in.");
        navigate({ to: "/" });
      } else if (user.role !== "admin") {
        toast.error("Access Denied: Administrators only.");
        navigate({ to: "/" });
      }
    }
  }, [user, loading]);

  // Fetch metrics
  const {
    data: analytics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    enabled: !!user && user.role === "admin",
    queryKey: ["admin-analytics"],
    queryFn: () => apiFetch("/admin/analytics"),
  });

  // Fetch pending verification queue
  const {
    data: resources,
    isLoading: resourcesLoading,
    refetch: refetchResources,
  } = useQuery({
    enabled: !!user && user.role === "admin",
    queryKey: ["admin-resources"],
    queryFn: () => apiFetch("/resources"),
  });

  // Fetch flag reports
  const {
    data: reports,
    isLoading: reportsLoading,
    refetch: refetchReports,
  } = useQuery({
    enabled: !!user && user.role === "admin",
    queryKey: ["admin-reports"],
    queryFn: () => apiFetch("/admin/reports"),
  });

  // Fetch all users
  const {
    data: users,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    enabled: !!user && user.role === "admin",
    queryKey: ["admin-users"],
    queryFn: () => apiFetch("/admin/users"),
  });

  if (
    loading ||
    (user &&
      user.role === "admin" &&
      (analyticsLoading || resourcesLoading || reportsLoading || usersLoading))
  ) {
    return (
      <SiteLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-violet-600 h-10 w-10" />
        </div>
      </SiteLayout>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md text-center py-20 px-4">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-sm text-slate-500 mb-6">
            You must be logged in as an administrator to access this area.
          </p>
          <Button
            onClick={() => authModal.show("login")}
            className="rounded-xl bg-gradient-primary text-white"
          >
            Authenticate
          </Button>
        </div>
      </SiteLayout>
    );
  }

  // Handle manual verify trigger
  const handleVerify = async (id: string) => {
    try {
      const res = await apiFetch(`/admin/verify/${id}`, { method: "PUT" });
      toast.success(res.message);
      refetchResources();
      refetchReports();
      refetchAnalytics();
      qc.invalidateQueries({ queryKey: ["resources"] });
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    }
  };

  // Handle delete resource trigger
  const handleDeleteResource = async (id: string) => {
    if (
      !confirm(
        "Are you absolutely sure you want to delete this resource permanently? This will also remove any related flags.",
      )
    )
      return;
    try {
      const res = await apiFetch(`/admin/resource/${id}`, { method: "DELETE" });
      toast.success(res.message);
      refetchResources();
      refetchReports();
      refetchAnalytics();
      qc.invalidateQueries({ queryKey: ["resources"] });
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  // Handle BAN / Delete User trigger
  const handleDeleteUser = async (id: string) => {
    if (
      !confirm(
        "Ban and delete this user permanently? This will remove all their shared documents as well.",
      )
    )
      return;
    try {
      const res = await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
      toast.success(res.message);
      refetchUsers();
      refetchResources();
      refetchAnalytics();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove user");
    }
  };

  const handleRefreshAll = () => {
    refetchAnalytics();
    refetchResources();
    refetchReports();
    refetchUsers();
    toast.success("Dashboard metrics refreshed");
  };

  // Filters based on search query
  const filteredVerifyQueue =
    resources?.filter(
      (r: any) =>
        !r.verified &&
        (r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.uploader_name?.toLowerCase().includes(searchQuery.toLowerCase())),
    ) ?? [];

  const filteredUsers =
    users?.filter(
      (u: any) =>
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.college_name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) ?? [];

  return (
    <SiteLayout>
      <div className="px-4 lg:px-8 py-10">
        <div className="mx-auto max-w-[1250px] space-y-8">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-violet-100 flex items-center justify-center text-violet-650">
                  <Shield className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">
                  AcadVault Control Console
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mt-1">Administration panel</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefreshAll}
                className="rounded-xl border-zinc-200 cursor-pointer h-10 w-10"
              >
                <RefreshCw className="h-4 w-4 text-slate-500 animate-hover-spin" />
              </Button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-150 overflow-x-auto gap-2 pb-1 text-sm font-semibold tracking-tight scrollbar-none shrink-0">
            {[
              { id: "analytics", label: "Dashboard Analytics", icon: TrendingUp },
              {
                id: "verify",
                label: "Verification Queue",
                icon: CheckCircle,
                badge: resources?.filter((r: any) => !r.verified).length,
              },
              {
                id: "reports",
                label: "Spam & Flags Dashboard",
                icon: AlertOctagon,
                badge: reports?.length,
              },
              { id: "users", label: "User Accounts Manager", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white shadow-md font-bold"
                      : "text-slate-500 hover:text-slate-950 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {!!tab.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        activeTab === tab.id ? "bg-violet-650 text-white" : "bg-red-500 text-white"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Views */}
          {activeTab === "analytics" && analytics && (
            <div className="space-y-8">
              {/* Analytics Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: "Total Students",
                    val: analytics.totalUsers,
                    icon: Users,
                    color: "bg-blue-500/10 text-blue-650",
                  },
                  {
                    label: "Total uploads",
                    val: analytics.totalResources,
                    icon: FileText,
                    color: "bg-purple-500/10 text-purple-650",
                  },
                  {
                    label: "Verified resources",
                    val: analytics.verifiedResources,
                    icon: CheckCircle,
                    color: "bg-emerald-500/10 text-emerald-650",
                  },
                  {
                    label: "Total downloads",
                    val: analytics.totalDownloads,
                    icon: Download,
                    color: "bg-amber-500/10 text-amber-650",
                  },
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-border/60 rounded-3xl p-6 flex items-center justify-between shadow-sm"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">
                          {card.label}
                        </p>
                        <p className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-2">
                          {formatNum(card.val)}
                        </p>
                      </div>
                      <div
                        className={`h-12 w-12 rounded-2xl ${card.color} flex items-center justify-center shadow-sm`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Branch / College Distribution metrics */}
                <div className="bg-white border border-border/60 rounded-3xl p-6 space-y-4">
                  <h3 className="font-extrabold text-lg text-slate-850">Distribution by Branch</h3>
                  <div className="space-y-3">
                    {Object.keys(analytics.branchDistribution || {}).length === 0 ? (
                      <p className="text-xs text-slate-400">No branch distributions recorded</p>
                    ) : (
                      Object.entries(analytics.branchDistribution).map(([branch, count]: any) => (
                        <div key={branch} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>{branch}</span>
                            <span>{count} resources</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-primary rounded-full"
                              style={{
                                width: `${Math.min(100, (count / (analytics.totalResources || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Leaderboard Top Contributors */}
                <div className="bg-white border border-border/60 rounded-3xl p-6 space-y-4">
                  <h3 className="font-extrabold text-lg text-slate-850">Top System Contributors</h3>
                  <div className="space-y-3">
                    {analytics.topContributors?.map((u: any, idx: number) => (
                      <div
                        key={u._id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-extrabold text-slate-400 w-4">
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{u.full_name}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">{u.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold text-violet-650 bg-violet-50">
                            {u.badge}
                          </span>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">{u.points} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "verify" && (
            <div className="space-y-6">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search verification queue (e.g. operating systems, Java)..."
                  className="pl-10 h-11 rounded-xl bg-white border-zinc-200"
                />
              </div>

              {filteredVerifyQueue.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed rounded-3xl p-6">
                  <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
                  <p className="font-bold text-slate-800 text-lg">Verification Queue Clear</p>
                  <p className="text-sm text-slate-400 max-w-xs mx-auto mt-1">
                    Excellent! All uploaded resources are currently validated or no pending uploads
                    exist.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredVerifyQueue.map((r: any) => {
                    return (
                      <div
                        key={r.id}
                        className="bg-white border border-border/60 rounded-3xl p-5 hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[10px] font-bold bg-violet-50 text-violet-650 px-2.5 py-0.5 rounded-full border border-violet-100">
                              {r.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {timeAgo(r.created_at)}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2">
                            {r.title}
                          </h3>
                          <div className="text-xs text-slate-500 font-semibold space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <p>
                              Subject: <span className="text-slate-800">{r.subject || "N/A"}</span>
                            </p>
                            <p>
                              Branch: <span className="text-slate-800">{r.branch || "N/A"}</span>
                            </p>
                            <p>
                              Semester:{" "}
                              <span className="text-slate-800">{r.semester || "N/A"}</span>
                            </p>
                            <p>
                              Shared by:{" "}
                              <span className="text-slate-850">{r.uploader_name || "Unknown"}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                          <Button
                            onClick={() => handleVerify(r.id)}
                            className="flex-1 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-semibold text-xs h-10 cursor-pointer"
                          >
                            <Check className="h-4 w-4 mr-1.5" /> Validate & Verify
                          </Button>
                          <Button
                            onClick={() => handleDeleteResource(r.id)}
                            variant="destructive"
                            className="rounded-xl font-semibold text-xs h-10 cursor-pointer px-4"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              {!reports || reports.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed rounded-3xl p-6">
                  <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
                  <p className="font-bold text-slate-800 text-lg">System Flag-Free</p>
                  <p className="text-sm text-slate-400 max-w-xs mx-auto mt-1">
                    Amazing! No resources have been flagged by students.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {reports.map((rep: any) => (
                    <div
                      key={rep.id}
                      className="bg-white border border-red-200/60 rounded-3xl p-5 hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold bg-red-50 border border-red-100 text-red-650 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                            {rep.reason}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {timeAgo(rep.created_at)}
                          </span>
                        </div>

                        <div>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            Reported Resource
                          </p>
                          <h4 className="font-bold text-slate-800 text-sm mt-0.5 truncate">
                            {rep.resource?.title || "Deleted resource"}
                          </h4>
                        </div>

                        {rep.details && (
                          <div className="p-3 bg-red-500/5 rounded-xl border border-red-100 text-xs">
                            <p className="font-bold text-red-750 uppercase text-[9px] tracking-wide mb-0.5">
                              Reporter details
                            </p>
                            <p className="text-slate-700 leading-relaxed font-semibold">
                              "{rep.details}"
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-slate-400 font-medium space-y-0.5 pb-2">
                          <p>
                            Reporter:{" "}
                            <span className="font-bold text-slate-800">{rep.reporter?.name}</span> (
                            {rep.reporter?.email})
                          </p>
                          <p>
                            Uploader:{" "}
                            <span className="font-bold text-slate-800">
                              {rep.resource?.uploader?.name}
                            </span>{" "}
                            ({rep.resource?.uploader?.email})
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                        <Button
                          onClick={() => handleVerify(rep.resource?.id)}
                          className="flex-1 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-semibold text-xs h-10 cursor-pointer"
                        >
                          <Check className="h-4 w-4 mr-1.5" /> Keep & Verify
                        </Button>
                        <Button
                          onClick={() => handleDeleteResource(rep.resource?.id)}
                          variant="destructive"
                          className="flex-1 rounded-xl font-semibold text-xs h-10 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" /> Remove spam
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user accounts (e.g. John Doe, Stanford)..."
                  className="pl-10 h-11 rounded-xl bg-white border-zinc-200"
                />
              </div>

              {/* Users table */}
              <div className="bg-white border border-border/60 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">College</th>
                        <th className="px-6 py-4">XP Level</th>
                        <th className="px-6 py-4">Badge Rank</th>
                        <th className="px-6 py-4 text-center">Security Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-10 text-slate-450">
                            No student profiles match the filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u: any) => (
                          <tr key={u._id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-violet-500/10 text-violet-650 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                  {u.full_name?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-extrabold text-slate-800 truncate">
                                    {u.full_name}
                                  </p>
                                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                    {u.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-650 truncate max-w-xs">
                              {u.college_name}
                            </td>
                            <td className="px-6 py-4 text-slate-800 font-extrabold">
                              {formatNum(u.points)} XP
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  u.badge.includes("Top")
                                    ? "text-amber-700 bg-amber-50"
                                    : "text-violet-600 bg-violet-50"
                                }`}
                              >
                                {u.badge}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {u.role === "admin" ? (
                                <span className="text-[10px] text-slate-400 font-bold">
                                  Admin Shield
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition cursor-pointer"
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
