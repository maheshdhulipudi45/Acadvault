import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, ArrowUp } from "lucide-react";
import { Navbar } from "./Navbar";
import { AuthModal } from "./AuthModal";
import { PDFPreviewModal } from "./PDFPreviewModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
      <footer className="bg-[oklch(0.2_0.04_270)] text-white/80 mt-16">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8 py-12 grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10 md:gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-white">AcadVault</span>
            </Link>
            <p className="text-sm text-white/60 max-w-xs">
              One place for all your academic needs.
              <br />
              Share knowledge. Empower students.
            </p>
            <div className="flex gap-2 mt-5">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Quick Links"
            links={[
              { label: "Explore", to: "/resources" },
              { label: "Resources", to: "/resources" },
              { label: "Leaderboard", to: "/leaderboard" },
              { label: "Upload", to: "/upload" },
            ]}
          />

          <FooterCol
            title="Categories"
            links={[
              { label: "Notes", to: "/resources" },
              { label: "Previous Papers", to: "/resources" },
              { label: "Lab Records", to: "/resources" },
              { label: "Study Materials", to: "/resources" },
            ]}
          />

          <div>
            <h4 className="font-semibold text-white mb-4">Newsletter</h4>
            <p className="text-sm text-white/60 mb-3">
              Stay updated with new resources every week.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Input
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-lg w-full"
              />
              <Button className="rounded-lg bg-gradient-primary text-primary-foreground hover:opacity-90 shrink-0 w-full sm:w-auto cursor-pointer">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8 py-5 flex items-center justify-between text-xs text-white/50">
            <p>© {new Date().getFullYear()} AcadVault. All rights reserved.</p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="h-8 w-8 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </footer>
      <AuthModal />
      <PDFPreviewModal />
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="font-semibold text-white mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm text-white/60">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="hover:text-white transition">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
