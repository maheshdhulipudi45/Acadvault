import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SliderImport from "react-slick";
const Slider = (SliderImport as any).default || SliderImport;
import { toast } from "sonner";
import {
  ArrowRight,
  Upload,
  FileText,
  FlaskConical,
  ClipboardList,
  BookOpen,
  Library,
  GraduationCap,
  Sparkles,
  Star,
  Download,
  Users,
  Layers,
  Zap,
  Heart,
  Database,
  Cpu,
  Network,
  Coffee,
  Code2,
  Globe,
  Brain,
  Rocket,
  Trophy,
  Medal,
  Award,
  MoreVertical,
  Search,
  Lock,
  ShieldAlert,
  ArrowDown,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Youtube,
  Github,
  FolderOpen,
  Play,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { apiFetch } from "@/lib/api";
import { fileMeta, formatNum, timeAgo } from "@/lib/format";
import { authModal } from "@/lib/auth-modal";
import { useAuth } from "@/lib/auth-context";
import { previewModal } from "@/lib/preview-modal";

export const Route = createFileRoute("/")({ component: Home });

const categories = [
  {
    name: "Notes",
    count: "15,000+",
    Icon: FileText,
    bg: "bg-pastel-purple",
    iconBg: "bg-white",
    color: "text-violet-600",
  },
  {
    name: "Previous Papers",
    count: "10,000+",
    Icon: FileText,
    bg: "bg-pastel-blue",
    iconBg: "bg-white",
    color: "text-blue-600",
  },
  {
    name: "Lab Records",
    count: "8,000+",
    Icon: FlaskConical,
    bg: "bg-pastel-green",
    iconBg: "bg-white",
    color: "text-emerald-600",
  },
  {
    name: "Assignments",
    count: "12,000+",
    Icon: ClipboardList,
    bg: "bg-pastel-orange",
    iconBg: "bg-white",
    color: "text-orange-600",
  },
  {
    name: "Study Materials",
    count: "20,000+",
    Icon: BookOpen,
    bg: "bg-pastel-pink",
    iconBg: "bg-white",
    color: "text-rose-600",
  },
  {
    name: "Books & References",
    count: "5,000+",
    Icon: Library,
    bg: "bg-pastel-indigo",
    iconBg: "bg-white",
    color: "text-indigo-600",
  },
];

const contributorAvatars = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80",
];
const contributorNames = ["John Doe", "Jane Smith", "Alex Johnson", "Michael Lee"];
const contributorTimes = ["1 hour ago", "2 hours ago", "3 hours ago", "5 hours ago"];

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

const SlickPrevArrow = (props: any) => {
  const { className, style, onClick } = props;
  const isDisabled = className?.includes("slick-disabled");
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`absolute left-[-20px] top-1/2 -translate-y-1/2 z-30 hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm border border-slate-150 shadow-[0_4px_12px_rgba(0,0,0,0.06)] text-slate-700 transition-all duration-300 select-none ${
        isDisabled
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-[#6366F1] hover:border-[#6366F1] hover:text-white hover:shadow-glow hover:-translate-y-1/2 hover:scale-105 cursor-pointer group"
      }`}
      style={{ ...style, display: "flex" }}
      aria-label="Previous Slide"
    >
      <ChevronLeft
        className={`h-5 w-5 ${isDisabled ? "text-slate-400" : "text-slate-655 group-hover:text-white transition-colors duration-200"}`}
      />
    </button>
  );
};

const SlickNextArrow = (props: any) => {
  const { className, style, onClick } = props;
  const isDisabled = className?.includes("slick-disabled");
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`absolute right-[-20px] top-1/2 -translate-y-1/2 z-30 hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm border border-slate-150 shadow-[0_4px_12px_rgba(0,0,0,0.06)] text-slate-700 transition-all duration-300 select-none ${
        isDisabled
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-[#6366F1] hover:border-[#6366F1] hover:text-white hover:shadow-glow hover:-translate-y-1/2 hover:scale-105 cursor-pointer group"
      }`}
      style={{ ...style, display: "flex" }}
      aria-label="Next Slide"
    >
      <ChevronRight
        className={`h-5 w-5 ${isDisabled ? "text-slate-400" : "text-slate-655 group-hover:text-white transition-colors duration-200"}`}
      />
    </button>
  );
};

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const words = ["smarter.", "together.", "efficiently.", "better."];

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % words.length;
      const fullWord = words[i];

      setTypedText(
        isDeleting
          ? fullWord.substring(0, typedText.length - 1)
          : fullWord.substring(0, typedText.length + 1),
      );

      setTypingSpeed(isDeleting ? 75 : 150);

      if (!isDeleting && typedText === fullWord) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && typedText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [typedText, isDeleting, loopNum, typingSpeed]);

  // Retrieve Real-time Database Counts
  const { data: dbStats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => apiFetch("/stats"),
  });

  // Query Latest Resources (limit 8)
  const { data: latest, isLoading: isLatestLoading } = useQuery({
    queryKey: ["latest-resources"],
    queryFn: () => apiFetch("/resources/latest"),
  });

  // Query Trending Resources (limit 8)
  const { data: trending, isLoading: isTrendingLoading } = useQuery({
    queryKey: ["trending-resources"],
    queryFn: () => apiFetch("/resources/trending"),
  });

  // Query Top Contributors from MongoDB
  const { data: contributors } = useQuery({
    queryKey: ["contributors-list"],
    queryFn: () => apiFetch("/contributors"),
  });

  // Query all resources to calculate exact dynamic counts for hero orbiting note cards
  const { data: allResources } = useQuery({
    queryKey: ["all-resources"],
    queryFn: () => apiFetch("/resources"),
  });

  // Dynamic Orbit Note download count helper
  const getDownloads = (title: string, defaultVal: string) => {
    if (!allResources) return defaultVal;
    const matches = allResources.filter(
      (r: any) =>
        r.title.toLowerCase().includes(title.toLowerCase()) ||
        (r.subject && r.subject.toLowerCase().includes(title.toLowerCase())),
    );
    if (matches.length === 0) return defaultVal;
    const total = matches.reduce((sum: number, r: any) => sum + (r.downloads ?? 0), 0);
    return `${formatNum(total)} Downloads`;
  };

  // Dynamic uploader rating calculated from database statistics
  const dynamicRating = useMemo(() => {
    if (!dbStats || dbStats.downloads === 0) return "4.9";
    const score = 4.5 + Math.min(0.49, dbStats.downloads / 50);
    return score.toFixed(1);
  }, [dbStats]);

  // Dynamic top 4 trending resources for orbiting cards
  const orbitCards = useMemo(() => {
    const defaultCards = [
      {
        title: "DBMS Notes",
        downloads: getDownloads("DBMS Notes", "2.4k Downloads"),
        icon: <Database className="h-5 w-5" />,
        bgColor: "bg-red-500",
        shadowColor: "rgba(239,68,68,0.3)",
        query: "DBMS",
        realResource: null as any,
      },
      {
        title: "Operating System",
        downloads: getDownloads("Operating System", "1.8k Downloads"),
        icon: <Cpu className="h-5 w-5" />,
        bgColor: "bg-blue-500",
        shadowColor: "rgba(59,130,246,0.3)",
        query: "Operating System",
        realResource: null as any,
      },
      {
        title: "Java Concepts",
        downloads: getDownloads("Java Concepts", "1.2k Downloads"),
        icon: <Code2 className="h-5 w-5" />,
        bgColor: "bg-purple-500",
        shadowColor: "rgba(139,92,246,0.3)",
        query: "Java",
        realResource: null as any,
      },
      {
        title: "Previous Papers",
        downloads: getDownloads("Previous Papers", "3.6k Downloads"),
        icon: <Sparkles className="h-5 w-5 fill-white/20" />,
        bgColor: "bg-green-500",
        shadowColor: "rgba(16,185,129,0.3)",
        query: "Papers",
        realResource: null as any,
      },
    ];

    if (!trending || trending.length === 0) return defaultCards;

    return defaultCards.map((def, idx) => {
      if (idx < trending.length) {
        const t = trending[idx];
        const shortTitle = t.title.length > 18 ? t.title.substring(0, 16) + "..." : t.title;

        let icon = def.icon;
        if (t.file_type === "pdf") icon = <FileText className="h-5 w-5" />;
        else if (t.file_type === "zip") icon = <Layers className="h-5 w-5" />;
        else if (t.file_type === "docx" || t.file_type === "doc")
          icon = <ClipboardList className="h-5 w-5" />;

        return {
          title: shortTitle,
          downloads: `${t.downloads} ${t.downloads === 1 ? "Download" : "Downloads"}`,
          icon: icon,
          bgColor: def.bgColor,
          shadowColor: def.shadowColor,
          query: t.title,
          realResource: t,
        };
      }
      return def;
    });
  }, [trending, allResources]);

  const handleOrbitClick = (card: any) => {
    if (card.realResource) {
      handleDownload(card.realResource);
    } else {
      navigate({ to: "/resources", search: { q: card.query } });
    }
  };

  // Auth-gated download handler
  const handleDownload = async (r: any) => {
    if (!user) {
      sessionStorage.setItem("pending_download", JSON.stringify(r));
      authModal.show("login", `Log in to download "${r.title}". It's free.`);
      return;
    }
    // Auto-repair legacy URLs missing '/public/' segment to prevent Supabase 400 Bad Request
    let fileUrl = r.file_url;
    if (fileUrl && fileUrl.includes("/storage/v1/object/resources/")) {
      fileUrl = fileUrl.replace(
        "/storage/v1/object/resources/",
        "/storage/v1/object/public/resources/",
      );
    }
    window.open(fileUrl, "_blank");
    try {
      await apiFetch(`/resources/${r.id}/download`, { method: "POST" });
      toast.success("Download started!");
    } catch (err: any) {
      console.error("Increment downloads failed:", err);
    }
  };

  // React Slick sliders settings
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
    prevArrow: <SlickPrevArrow />,
    nextArrow: <SlickNextArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          arrows: false,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          arrows: false,
        },
      },
    ],
  };

  const latestCarouselSettings = useMemo(
    () => ({
      ...carouselSettings,
      infinite: latest ? latest.length > 4 : false,
    }),
    [latest],
  );

  const trendingCarouselSettings = useMemo(
    () => ({
      ...carouselSettings,
      infinite: trending ? trending.length > 4 : false,
    }),
    [trending],
  );

  const subjectsSettings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    arrows: true,
    prevArrow: <SlickPrevArrow />,
    nextArrow: <SlickNextArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          arrows: false,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          arrows: false,
        },
      },
    ],
  };

  const contributorsSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    pauseOnHover: true,
    arrows: true,
    prevArrow: <SlickPrevArrow />,
    nextArrow: <SlickNextArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          arrows: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          arrows: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          arrows: false,
        },
      },
    ],
  };

  const dynamicContributorsSettings = useMemo(
    () => ({
      ...contributorsSettings,
      infinite: contributors ? contributors.length > 5 : false,
    }),
    [contributors],
  );

  const displayStats = [
    { value: dbStats ? formatNum(dbStats.uploads) : "50K+", label: "Notes" },
    { value: dbStats ? formatNum(dbStats.downloads) : "1M+", label: "Downloads" },
    { value: dbStats ? formatNum(dbStats.users) : "20K+", label: "Students" },
    { value: dbStats ? formatNum(dbStats.colleges) : "150+", label: "Colleges" },
  ];

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white pt-4 pb-12 lg:pt-8 lg:pb-20 border-b border-[#F1F5F9]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-100px] right-[-100px] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[#8B5CF6]/10 to-[#EC4899]/5 blur-3xl opacity-80" />
          <div className="absolute bottom-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#3B82F6]/6 to-[#8B5CF6]/4 blur-3xl opacity-70" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-4 lg:px-8 z-10">
          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col justify-center"
            >
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#FFF5F7] backdrop-blur px-3.5 py-1.5 text-xs font-extrabold text-[#E91E63] shadow-sm border border-[#FFE2E8] mb-6 hover:scale-[1.02] transition-transform">
                <Sparkles className="h-3.5 w-3.5 text-[#FF9800] fill-[#FF9800]/20 animate-pulse" />
                One Place. All Your Academic Needs.
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-[72px] font-extrabold tracking-tight leading-[1.06] mb-6 text-slate-900">
                Share Knowledge.
                <br />
                Empower{" "}
                <span className="bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#DB2777] bg-clip-text text-transparent drop-shadow-sm">
                  Students.
                </span>
              </h1>

              <p className="text-lg text-[#5E6672] max-w-xl mb-8 leading-relaxed font-semibold">
                Upload notes, discover useful resources and help students learn{" "}
                <span className="text-[#6366F1] font-extrabold">{typedText}</span>
                <span className="inline-block w-[2px] h-5 bg-[#6366F1] ml-0.5 animate-pulse align-middle" />{" "}
                | Share knowledge and build university networks together.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white hover:scale-[1.03] hover:shadow-glow transition-all duration-300 px-8 font-semibold cursor-pointer"
                  onClick={() => navigate({ to: "/resources" })}
                >
                  Explore Resources
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#1E293B] hover:scale-[1.03] transition-all px-8 font-semibold cursor-pointer shadow-sm flex items-center gap-2"
                  onClick={() => {
                    if (user) navigate({ to: "/upload" as any });
                    else authModal.show("login");
                  }}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF2F6] text-[#6366F1]">
                    <Upload className="h-3.5 w-3.5" />
                  </span>
                  Upload Notes
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-[#3B82F6] shadow-sm" />
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-[#8B5CF6] shadow-sm" />
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-[#F59E0B] shadow-sm" />
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-[#EC4899] shadow-sm" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-[#F59E0B]">
                    <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                    <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                    <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                    <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                    <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                    <span className="text-sm font-bold text-[#1E293B] ml-1">{dynamicRating}</span>
                  </div>
                  <span className="text-xs text-[#64748B] font-semibold">
                    Loved by {dbStats ? formatNum(dbStats.users) : "20,000+"} students
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Orbiting Cards Illustration */}
            <div className="relative hidden lg:flex items-center justify-center h-[550px] w-full">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/10 blur-3xl opacity-80 pointer-events-none" />

              <div className="relative w-[340px] h-[340px] flex items-center justify-center z-0 group">
                <div className="absolute -bottom-6 w-[280px] h-[25px] bg-[#1E1B4B]/15 blur-md rounded-full transform scale-y-50 group-hover:scale-x-110 transition-transform duration-500" />

                <motion.img
                  src="/hero_student.png"
                  alt="Upgrade Your Skills"
                  className="max-h-[380px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] cursor-pointer"
                  initial={{ y: 0 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* Orbiting Card 1: Dynamic Top 1 trending resource */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ type: "spring", delay: 0.4, duration: 0.8 }}
                whileHover={{ scale: 1.08, y: -4 }}
                className="absolute top-10 left-4 flex items-center gap-3 bg-white/90 backdrop-blur-md border border-white/80 rounded-2xl p-3 px-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] hover:shadow-elevated transition-all duration-300 animate-float z-10 cursor-pointer"
                onClick={() => handleOrbitClick(orbitCards[0])}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${orbitCards[0].bgColor} text-white shadow-[0_4px_10px_rgba(239,68,68,0.2)]`}
                >
                  {orbitCards[0].icon}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">{orbitCards[0].title}</div>
                  <div className="text-xs font-semibold text-slate-500">
                    {orbitCards[0].downloads}
                  </div>
                </div>
              </motion.div>

              {/* Orbiting Card 2: Dynamic Top 2 trending resource */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ type: "spring", delay: 0.5, duration: 0.8 }}
                whileHover={{ scale: 1.08, y: -4 }}
                className="absolute top-24 right-4 flex items-center gap-3 bg-white/90 backdrop-blur-md border border-white/80 rounded-2xl p-3 px-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] hover:shadow-elevated transition-all duration-300 animate-float-delayed z-10 cursor-pointer"
                onClick={() => handleOrbitClick(orbitCards[1])}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${orbitCards[1].bgColor} text-white shadow-[0_4px_10px_rgba(59,130,246,0.2)]`}
                >
                  {orbitCards[1].icon}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">{orbitCards[1].title}</div>
                  <div className="text-xs font-semibold text-slate-500">
                    {orbitCards[1].downloads}
                  </div>
                </div>
              </motion.div>

              {/* Orbiting Card 3: Dynamic Top 3 trending resource */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ type: "spring", delay: 0.6, duration: 0.8 }}
                whileHover={{ scale: 1.08, y: -4 }}
                className="absolute bottom-28 left-0 flex items-center gap-3 bg-white/90 backdrop-blur-md border border-white/80 rounded-2xl p-3 px-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] hover:shadow-elevated transition-all duration-300 animate-float-slow z-10 cursor-pointer"
                onClick={() => handleOrbitClick(orbitCards[2])}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${orbitCards[2].bgColor} text-white shadow-[0_4px_10px_rgba(139,92,246,0.2)]`}
                >
                  {orbitCards[2].icon}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">{orbitCards[2].title}</div>
                  <div className="text-xs font-semibold text-slate-500">
                    {orbitCards[2].downloads}
                  </div>
                </div>
              </motion.div>

              {/* Orbiting Card 4: Dynamic Top 4 trending resource */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ type: "spring", delay: 0.7, duration: 0.8 }}
                whileHover={{ scale: 1.08, y: -4 }}
                className="absolute bottom-20 right-0 flex items-center gap-3 bg-white/90 backdrop-blur-md border border-white/80 rounded-2xl p-3 px-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] hover:shadow-elevated transition-all duration-300 animate-float z-10 cursor-pointer"
                onClick={() => handleOrbitClick(orbitCards[3])}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${orbitCards[3].bgColor} text-white shadow-[0_4px_10px_rgba(16,185,129,0.2)]`}
                >
                  {orbitCards[3].icon}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">{orbitCards[3].title}</div>
                  <div className="text-xs font-semibold text-slate-500">
                    {orbitCards[3].downloads}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Stats Ribbon */}
          <div className="mt-16 pt-10 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayStats.map((s, idx) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.5 }}
                className="text-center md:text-left hover:scale-[1.02] transition-transform duration-200"
              >
                <div className="text-3xl font-extrabold text-[#4F46E5]">{s.value}</div>
                <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 lg:px-8 mt-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Browse by Category
              </h2>
              <p className="text-slate-500 text-sm mt-1 font-semibold">
                Discover notes, papers, and archives structured for your curriculum.
              </p>
            </div>
            <Link
              to="/resources"
              className="text-sm font-bold text-slate-600 hover:text-[#6366F1] inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-100 bg-white hover:bg-slate-50 shadow-sm transition-all whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {categories.map((c) => (
              <Link
                key={c.name}
                to="/resources"
                className="group bg-white rounded-2xl p-6 border border-[#F1F5F9] hover:border-[#6366F1]/20 hover:shadow-[0_12px_30px_rgba(99,102,241,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
              >
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 shadow-sm ${c.bg} border border-white/50`}
                >
                  <c.Icon className={`h-6 w-6 ${c.color}`} />
                </div>
                <div className="font-bold text-slate-800 text-sm group-hover:text-[#6366F1] transition-colors">
                  {c.name}
                </div>
                <div className="text-xs text-slate-400 font-bold mt-1">{c.count}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Resources Slick Slider */}
      <section className="px-4 lg:px-8 mt-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Latest Resources
              </h2>
              <p className="text-slate-500 text-sm mt-1 font-semibold">
                Recently uploaded study resources from universities across the country.
              </p>
            </div>
            <Link
              to="/resources"
              className="text-sm font-bold text-slate-600 hover:text-[#6366F1] inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-100 bg-white hover:bg-slate-50 shadow-sm transition-all whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              View all resources <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLatestLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#F1F5F9] rounded-2xl p-6 h-[190px] animate-pulse"
                >
                  <div className="h-10 w-10 bg-slate-100 rounded-xl mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : !latest || latest.length === 0 ? (
            <div className="text-center py-20 rounded-[32px] border border-dashed border-purple-200/80 bg-purple-50/5 relative overflow-hidden p-8">
              {/* Premium Empty State Illustration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-purple-600/5 blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-md mx-auto">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-100 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <BookOpen className="h-8 w-8 text-purple-600 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-slate-850 mb-2">No resources shared yet</h3>
                <p className="text-sm text-slate-500 font-semibold mb-6">
                  Be the first to help your fellow students by uploading study notes, lab journals,
                  or question papers!
                </p>
                <Link to="/upload">
                  <Button className="rounded-full bg-gradient-primary text-white hover:opacity-90 shadow-glow px-6 font-bold flex items-center gap-2 mx-auto cursor-pointer">
                    <Upload className="h-4 w-4" /> Share a Resource
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="slick-slider-wrapper">
              <Slider {...latestCarouselSettings}>
                {latest.map((r, i) => {
                  const meta = fileMeta(r.file_type);
                  const authorAvatar = r.uploader_avatar || contributorAvatars[i % 4];
                  const authorName = r.uploader_name || contributorNames[i % 4];
                  const timeDisplay = timeAgo(r.created_at);
                  const avgRating =
                    r.ratings && r.ratings.length > 0
                      ? (
                          r.ratings.reduce((sum: number, x: any) => sum + x.score, 0) /
                          r.ratings.length
                        ).toFixed(1)
                      : "4.0";

                  const getYoutubeId = (url: string) => {
                    if (!url) return null;
                    const reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                    const match = url.match(reg);
                    return match && match[2].length === 11 ? match[2] : null;
                  };

                  const isYoutube = r.url_link && getYoutubeId(r.url_link);
                  const isGithub = r.url_link && r.url_link.toLowerCase().includes("github.com");
                  const isDrive =
                    r.url_link && r.url_link.toLowerCase().includes("drive.google.com");
                  const isWebsite = r.file_type === "link" && !isYoutube && !isGithub && !isDrive;

                  return (
                    <div
                      key={r.id}
                      className="py-2 cursor-pointer"
                      onClick={() => previewModal.show(r)}
                    >
                      <article className="group bg-white border border-[#F1F5F9] rounded-3xl p-5 hover:shadow-elevated hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[360px] relative overflow-hidden">
                        <div>
                          {/* Top badges bar */}
                          <div className="flex items-start justify-between mb-3.5">
                            {isYoutube ? (
                              <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-650 flex items-center justify-center shadow-sm animate-pulse">
                                <Youtube className="h-5 w-5 text-red-500" />
                              </div>
                            ) : isGithub ? (
                              <div className="h-10 w-10 rounded-xl bg-slate-900/10 text-slate-800 flex items-center justify-center shadow-sm">
                                <Github className="h-5 w-5 text-slate-700" />
                              </div>
                            ) : isDrive ? (
                              <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shadow-sm">
                                <FolderOpen className="h-5 w-5 text-sky-600" />
                              </div>
                            ) : isWebsite ? (
                              <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center shadow-sm">
                                <Globe className="h-5 w-5 text-violet-600" />
                              </div>
                            ) : (
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.color} font-bold text-xs shadow-sm border border-white`}
                              >
                                {meta.label}
                              </div>
                            )}

                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {r.category ||
                                  (isYoutube
                                    ? "Youtube Course"
                                    : isGithub
                                      ? "Github Repo"
                                      : isDrive
                                        ? "Drive Link"
                                        : "Notes")}
                              </span>
                              {r.verified && (
                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-0.5 shadow-sm animate-pulse">
                                  <CheckCircle className="h-2.5 w-2.5 fill-current text-blue-500" />{" "}
                                  Verified
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
                                    <span className="h-7 w-7 bg-red-600 text-white rounded-full flex items-center justify-center shadow hover:scale-110 transition">
                                      <Play className="h-3.5 w-3.5 fill-current" />
                                    </span>
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
                                {r.description ||
                                  "Open source repository containing lecture tutorials and coding guides."}
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
                            <div className="space-y-1.5">
                              <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-violet-650 transition-colors">
                                {r.title}
                              </h3>
                              {r.subject && (
                                <p className="text-xs text-slate-400 font-semibold">{r.subject}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {r.semester && (
                                  <span className="text-[9px] bg-slate-50 text-slate-400 font-bold px-2 py-0.5 rounded border border-slate-100">
                                    {r.semester}
                                  </span>
                                )}
                                {r.branch && (
                                  <span className="text-[9px] bg-slate-50 text-slate-400 font-bold px-2 py-0.5 rounded border border-slate-100">
                                    {r.branch}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer Area */}
                        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3">
                          <div className="flex items-center justify-between text-[11px] text-slate-450 font-bold">
                            <div className="flex items-center gap-2">
                              <img
                                src={authorAvatar}
                                className="h-5 w-5 rounded-full object-cover border border-slate-100"
                                alt=""
                              />
                              <span className="truncate max-w-[100px] text-slate-700">
                                {authorName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <span className="inline-flex items-center gap-0.5">
                                <Download className="h-3 w-3" /> {formatNum(r.downloads ?? 0)}
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-amber-500">
                                <Star className="h-3 w-3 fill-current text-amber-400" /> {avgRating}
                              </span>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(r);
                              }}
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
                    </div>
                  );
                })}
              </Slider>
            </div>
          )}
        </div>
      </section>

      {/* Trending Resources Slick Slider */}
      <section className="px-4 lg:px-8 mt-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Trending Resources
              </h2>
              <p className="text-slate-500 text-sm mt-1 font-semibold">
                The most popular revision aids, summaries, and guides downloaded by students.
              </p>
            </div>
            <Link
              to="/resources"
              className="text-sm font-bold text-slate-600 hover:text-[#6366F1] inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-100 bg-white hover:bg-slate-50 shadow-sm transition-all whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              View all resources <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isTrendingLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#F1F5F9] rounded-2xl p-6 h-[190px] animate-pulse"
                >
                  <div className="h-10 w-10 bg-slate-100 rounded-xl mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : !trending || trending.length === 0 ? (
            <div className="text-center py-20 rounded-[32px] border border-dashed border-purple-200/80 bg-purple-50/5 relative overflow-hidden p-8">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-purple-600/5 blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-md mx-auto">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-100 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-850 mb-2">No trending resources yet</h3>
                <p className="text-sm text-slate-500 font-semibold mb-6">
                  Be the first to download or upload highly searched exam papers to get featured
                  here!
                </p>
              </div>
            </div>
          ) : (
            <div className="slick-slider-wrapper">
              <Slider {...trendingCarouselSettings}>
                {trending.map((r, i) => {
                  const meta = fileMeta(r.file_type);
                  const authorAvatar = r.uploader_avatar || contributorAvatars[(i + 2) % 4];
                  const authorName = r.uploader_name || contributorNames[(i + 2) % 4];
                  const timeDisplay = timeAgo(r.created_at);
                  const avgRating =
                    r.ratings && r.ratings.length > 0
                      ? (
                          r.ratings.reduce((sum: number, x: any) => sum + x.score, 0) /
                          r.ratings.length
                        ).toFixed(1)
                      : "4.0";

                  const getYoutubeId = (url: string) => {
                    if (!url) return null;
                    const reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                    const match = url.match(reg);
                    return match && match[2].length === 11 ? match[2] : null;
                  };

                  const isYoutube = r.url_link && getYoutubeId(r.url_link);
                  const isGithub = r.url_link && r.url_link.toLowerCase().includes("github.com");
                  const isDrive =
                    r.url_link && r.url_link.toLowerCase().includes("drive.google.com");
                  const isWebsite = r.file_type === "link" && !isYoutube && !isGithub && !isDrive;

                  return (
                    <div
                      key={r.id}
                      className="py-2 cursor-pointer"
                      onClick={() => previewModal.show(r)}
                    >
                      <article className="group bg-white border border-[#F1F5F9] rounded-3xl p-5 hover:shadow-elevated hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[360px] relative overflow-hidden">
                        <div>
                          {/* Top badges bar */}
                          <div className="flex items-start justify-between mb-3.5">
                            {isYoutube ? (
                              <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-650 flex items-center justify-center shadow-sm animate-pulse">
                                <Youtube className="h-5 w-5 text-red-500" />
                              </div>
                            ) : isGithub ? (
                              <div className="h-10 w-10 rounded-xl bg-slate-900/10 text-slate-800 flex items-center justify-center shadow-sm">
                                <Github className="h-5 w-5 text-slate-700" />
                              </div>
                            ) : isDrive ? (
                              <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shadow-sm">
                                <FolderOpen className="h-5 w-5 text-sky-600" />
                              </div>
                            ) : isWebsite ? (
                              <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center shadow-sm">
                                <Globe className="h-5 w-5 text-violet-600" />
                              </div>
                            ) : (
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.color} font-bold text-xs shadow-sm border border-white`}
                              >
                                {meta.label}
                              </div>
                            )}

                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {r.category ||
                                  (isYoutube
                                    ? "Youtube Course"
                                    : isGithub
                                      ? "Github Repo"
                                      : isDrive
                                        ? "Drive Link"
                                        : "Notes")}
                              </span>
                              {r.verified && (
                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-0.5 shadow-sm animate-pulse">
                                  <CheckCircle className="h-2.5 w-2.5 fill-current text-blue-500" />{" "}
                                  Verified
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
                                    <span className="h-7 w-7 bg-red-600 text-white rounded-full flex items-center justify-center shadow hover:scale-110 transition">
                                      <Play className="h-3.5 w-3.5 fill-current" />
                                    </span>
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
                                {r.description ||
                                  "Open source repository containing lecture tutorials and coding guides."}
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
                            <div className="space-y-1.5">
                              <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-violet-650 transition-colors">
                                {r.title}
                              </h3>
                              {r.subject && (
                                <p className="text-xs text-slate-400 font-semibold">{r.subject}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {r.semester && (
                                  <span className="text-[9px] bg-slate-50 text-slate-400 font-bold px-2 py-0.5 rounded border border-slate-100">
                                    {r.semester}
                                  </span>
                                )}
                                {r.branch && (
                                  <span className="text-[9px] bg-slate-50 text-slate-400 font-bold px-2 py-0.5 rounded border border-slate-100">
                                    {r.branch}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer Area */}
                        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3">
                          <div className="flex items-center justify-between text-[11px] text-slate-450 font-bold">
                            <div className="flex items-center gap-2">
                              <img
                                src={authorAvatar}
                                className="h-5 w-5 rounded-full object-cover border border-slate-100"
                                alt=""
                              />
                              <span className="truncate max-w-[100px] text-slate-700">
                                {authorName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <span className="inline-flex items-center gap-0.5">
                                <Download className="h-3 w-3" /> {formatNum(r.downloads ?? 0)}
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-amber-500">
                                <Star className="h-3 w-3 fill-current text-amber-400" /> {avgRating}
                              </span>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(r);
                              }}
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
                    </div>
                  );
                })}
              </Slider>
            </div>
          )}
        </div>
      </section>

      {/* Auth-Gate Download Banner */}
      {!user && (
        <section className="px-4 lg:px-8 mt-24">
          <div className="mx-auto max-w-[1400px] rounded-3xl bg-gradient-to-r from-[#8B5CF6]/8 via-[#EC4899]/4 to-transparent border border-[#8B5CF6]/15 px-10 py-8 flex flex-wrap items-center justify-between gap-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-[0_8px_20px_rgba(139,92,246,0.12)] text-[#8B5CF6] border border-[#8B5CF6]/10">
                <Lock className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-xl">
                  Want to download resources?
                </h3>
                <p className="text-sm text-slate-500 mt-1 font-semibold">
                  Create a free student account to download unlimited papers, labs, and revisions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="rounded-full bg-white border-[#E2E8F0] hover:bg-slate-50 text-slate-700 px-6 font-semibold cursor-pointer h-11"
                onClick={() => authModal.show("login")}
              >
                Log in
              </Button>
              <Button
                className="rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white hover:opacity-95 shadow-[0_10px_20px_rgba(79,70,229,0.2)] px-8 font-semibold cursor-pointer h-11"
                onClick={() => authModal.show("signup")}
              >
                Sign up for free
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="px-4 lg:px-8 mt-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">How It Works</h2>
            <p className="text-slate-500 text-sm mt-2 font-semibold">
              Getting started with AcadVault is simple. Follow these steps to optimize your study
              resources.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              {
                step: "01",
                title: "Create Your Account",
                desc: "Sign up in seconds. Enter your college name and major branch to personalize your academic dashboard feed.",
              },
              {
                step: "02",
                title: "Upload Notes & Papers",
                desc: "Drag and drop your handwritten study notes, lab journals, or previous exam papers. Tag subjects for search discovery.",
              },
              {
                step: "03",
                title: "Share and Learn Together",
                desc: "Download resources shared by other students. Earn points for every download your uploads receive and climb the ranks!",
              },
            ].map((s, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#F1F5F9] rounded-3xl p-8 relative hover:shadow-[0_16px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="text-6xl font-black text-slate-100 group-hover:text-[#6366F1]/10 transition-colors absolute top-6 right-8 select-none">
                  {s.step}
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-extrabold mb-6 shadow-md shadow-[#4f46e5]/20">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">{s.title}</h3>
                <p className="text-slate-500 text-sm font-semibold leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Subjects Slick Slider */}
      <section className="px-4 lg:px-8 mt-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Popular Subjects
              </h2>
              <p className="text-slate-500 text-sm mt-1 font-semibold">
                Explore lecture guides, test banks, and revisions indexed by topic.
              </p>
            </div>
            <Link
              to="/resources"
              className="text-sm font-semibold text-slate-600 hover:text-[#6366F1] inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-100 bg-white hover:bg-slate-50 shadow-sm transition-all"
            >
              View all subjects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="slick-slider-wrapper">
            <Slider {...subjectsSettings}>
              {[
                {
                  name: "Data Structures",
                  Icon: Code2,
                  color: "text-orange-600",
                  bg: "bg-orange-50",
                },
                { name: "DBMS", Icon: Database, color: "text-amber-600", bg: "bg-amber-50" },
                {
                  name: "Operating System",
                  Icon: Cpu,
                  color: "text-violet-600",
                  bg: "bg-violet-50",
                },
                {
                  name: "Computer Networks",
                  Icon: Network,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
                { name: "Java", Icon: Coffee, color: "text-rose-600", bg: "bg-rose-50" },
                { name: "Python", Icon: Code2, color: "text-yellow-600", bg: "bg-yellow-50" },
                {
                  name: "Web Development",
                  Icon: Globe,
                  color: "text-indigo-600",
                  bg: "bg-indigo-50",
                },
                { name: "AI & ML", Icon: Brain, color: "text-emerald-600", bg: "bg-emerald-50" },
              ].map((s) => (
                <div key={s.name} className="py-2">
                  <div
                    onClick={() => navigate({ to: "/resources", search: { q: s.name } })}
                    className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-full px-5 py-3 hover:border-[#6366F1]/30 hover:shadow-[0_8px_20px_rgba(99,102,241,0.04)] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                  >
                    <div
                      className={`h-8 w-8 rounded-full ${s.bg} flex items-center justify-center shrink-0 border border-white`}
                    >
                      <s.Icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                    <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                      {s.name}
                    </span>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      {/* Top Contributors Slick Slider */}
      <section className="px-4 lg:px-8 mt-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Top Contributors
              </h2>
              <p className="text-slate-500 text-sm mt-1 font-semibold">
                Outstanding students driving academic excellence in the community.
              </p>
            </div>
            <Link
              to="/leaderboard"
              className="text-sm font-semibold text-slate-600 hover:text-[#6366F1] inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-100 bg-white hover:bg-slate-50 shadow-sm transition-all"
            >
              View leaderboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {!contributors || contributors.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
              {[
                {
                  rank: 1,
                  name: "Alex Johnson",
                  points: "4,560",
                  resources: 120,
                  icon: Trophy,
                  iconColor: "text-yellow-500",
                  avatar: PRESET_AVATARS[0].url,
                },
                {
                  rank: 2,
                  name: "Jane Smith",
                  points: "3,870",
                  resources: 98,
                  icon: Medal,
                  iconColor: "text-slate-400",
                  avatar: PRESET_AVATARS[1].url,
                },
                {
                  rank: 3,
                  name: "Michael Lee",
                  points: "3,230",
                  resources: 76,
                  icon: Award,
                  iconColor: "text-orange-500",
                  avatar: PRESET_AVATARS[4].url,
                },
                {
                  rank: 4,
                  name: "Emily Davis",
                  points: "2,890",
                  resources: 65,
                  icon: Star,
                  iconColor: "text-violet-400",
                  avatar: PRESET_AVATARS[3].url,
                },
                {
                  rank: 5,
                  name: "Chris Brown",
                  points: "2,450",
                  resources: 54,
                  icon: Star,
                  iconColor: "text-blue-400",
                  avatar: PRESET_AVATARS[2].url,
                },
              ].map((c) => (
                <div
                  key={c.rank}
                  className="bg-white border border-[#F1F5F9] rounded-2xl p-5 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[220px]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <img
                        src={c.avatar}
                        className="h-14 w-14 rounded-full object-cover border-2 border-violet-100 shadow-sm"
                        alt=""
                      />
                      <div className="absolute -top-1.5 -left-1.5 h-6 w-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-800 shadow-sm">
                        {c.rank}
                      </div>
                    </div>
                    <c.icon className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm leading-snug">{c.name}</div>
                    <div className="text-xs text-slate-500 font-semibold mt-1">
                      {c.points} Points
                    </div>
                    <div className="text-xs text-slate-400 font-semibold">
                      {c.resources} Resources
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold text-violet-600 bg-[#F5F3FF] rounded-full px-3 py-1.5 w-max border border-[#E9E3FF]">
                    <Sparkles className="h-3 w-3" /> Top Contributor
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="slick-slider-wrapper">
              <Slider {...dynamicContributorsSettings}>
                {contributors.map((c, i) => {
                  const rankIcons = [Trophy, Medal, Award];
                  const rankIconColors = ["text-yellow-500", "text-slate-400", "text-orange-500"];
                  const RankIcon = rankIcons[i] || Star;
                  const rankIconColor = rankIconColors[i] || "text-purple-400";
                  const avatar = contributorAvatars[i % 4];

                  return (
                    <div key={c.id} className="py-2">
                      <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 hover:shadow-elevated hover:-translate-y-1.5 transition-all duration-305 flex flex-col justify-between min-h-[220px]">
                        <div className="flex items-start justify-between mb-4">
                          <div className="relative">
                            <div className="h-14 w-14 rounded-full border-2 border-violet-100 shadow-sm flex items-center justify-center bg-purple-50 text-purple-600 font-extrabold text-lg overflow-hidden">
                              {c.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -top-1.5 -left-1.5 h-6 w-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-800 shadow-sm">
                              {i + 1}
                            </div>
                          </div>
                          <RankIcon className={`h-5 w-5 ${rankIconColor}`} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm leading-snug truncate">
                            {c.full_name ?? "Anonymous"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold truncate mb-2">
                            {c.college_name ?? "University"}
                          </div>
                          <div className="text-xs text-slate-500 font-bold mt-1">
                            {formatNum(c.downloads)} Downloads
                          </div>
                          <div className="text-xs text-slate-400 font-semibold">
                            {c.uploads} Resources shared
                          </div>
                        </div>
                        <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold text-violet-650 bg-[#F5F3FF] rounded-full px-3 py-1.5 w-max border border-[#E9E3FF]">
                          <Sparkles className="h-3 w-3 animate-pulse" /> Contributor
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Slider>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 lg:px-8 mt-24 mb-12">
        <div className="mx-auto max-w-[800px]">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm mt-2 font-semibold">
              Have questions about AcadVault? We have answers to the most common queries.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is AcadVault completely free?",
                a: "Yes, AcadVault is 100% free! All downloads and uploads are completely free. Our mission is to democratize academic resources for students worldwide.",
              },
              {
                q: "What types of files can I upload?",
                a: "You can upload PDF notes, PowerPoint presentation slides (PPT/PPTX), Word documents (DOC/DOCX), and ZIP archives (which are great for lab records or collections of papers).",
              },
              {
                q: "How do I earn points and reach the leaderboard?",
                a: "You earn points by sharing high-quality resources. For every download your resources receive, you earn points. The more you upload, and the more helpful your resources are, the higher you rise!",
              },
              {
                q: "Are the resources verified for accuracy?",
                a: "Resources are uploaded by fellow students and rated by the community. We encourage users to upvote helpful notes. If you find any duplicate or incorrect content, you can report it.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#F1F5F9] rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:border-[#6366F1]/20"
              >
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-5 font-bold text-slate-800 text-sm list-none select-none">
                    <span>{faq.q}</span>
                    <span className="transition group-open:rotate-180">
                      <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                    </span>
                  </summary>
                  <div className="p-5 pt-0 text-sm text-slate-500 font-semibold leading-relaxed border-t border-slate-50 bg-[#FAF9FF]/30">
                    {faq.a}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Start Sharing CTA */}
      <section className="px-4 lg:px-8 mt-24">
        <div className="mx-auto max-w-[1400px] rounded-3xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] p-10 md:p-16 relative overflow-hidden shadow-[0_20px_50px_rgba(79,70,229,0.3)]">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-4 left-10 h-3 w-3 rounded-full bg-yellow-300" />
            <div className="absolute bottom-8 left-1/4 h-2 w-2 rounded-full bg-pink-300" />
            <div className="absolute top-1/2 right-1/3 h-2 w-2 rounded-full bg-white" />
          </div>
          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0 border border-white/20">
                <Rocket className="h-8 w-8 text-white animate-bounce" />
              </div>
              <div className="text-primary-foreground">
                <h3 className="text-3xl font-extrabold text-white">
                  Start Sharing. Start Learning.
                </h3>
                <p className="text-base text-white/90 mt-1 font-semibold">
                  Be a part of AcadVault today!
                </p>
                <p className="text-sm text-white/85 mt-1 font-medium">
                  Upload your notes and help thousands of students study better.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="rounded-full bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white hover:text-slate-900 cursor-pointer h-12 px-6 font-bold"
                onClick={() => {
                  if (user) navigate({ to: "/upload" as any });
                  else authModal.show("login");
                }}
              >
                <Upload className="mr-2 h-4 w-4" /> Upload Notes
              </Button>
              <Link to="/resources">
                <Button className="rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white hover:opacity-95 cursor-pointer h-12 px-8 font-bold shadow-md">
                  Explore Resources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
