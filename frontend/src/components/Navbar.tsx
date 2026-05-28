import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  GraduationCap,
  Upload as UploadIcon,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Bookmark,
  TrendingUp,
  Award,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { authModal } from "@/lib/auth-modal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={closeMobileMenu}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Acad<span className="text-gradient">Vault</span>
          </span>
        </Link>

        {/* Desktop Navbar Links */}
        <nav className="hidden lg:flex items-center gap-1 ml-6">
          <Link
            to="/"
            activeProps={{ className: "text-violet-650 bg-violet-50/60 font-semibold" }}
            activeOptions={{ exact: true }}
            className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:text-foreground hover:bg-accent transition-all"
          >
            Home
          </Link>

          {user ? (
            <>
              <Link
                to="/resources"
                activeProps={{ className: "text-violet-650 bg-violet-50/60 font-semibold" }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:text-foreground hover:bg-accent transition-all"
              >
                Resources
              </Link>
              <Link
                to="/my-uploads"
                activeProps={{ className: "text-violet-650 bg-violet-50/60 font-semibold" }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:text-foreground hover:bg-accent transition-all"
              >
                My Uploads
              </Link>
              <Link
                to="/saved"
                activeProps={{ className: "text-violet-650 bg-violet-50/60 font-semibold" }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:text-foreground hover:bg-accent transition-all"
              >
                Saved
              </Link>
              <Link
                to="/profile"
                activeProps={{ className: "text-violet-650 bg-violet-50/60 font-semibold" }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:text-foreground hover:bg-accent transition-all"
              >
                Profile
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  activeProps={{ className: "text-violet-650 bg-violet-50/60 font-semibold" }}
                  className="px-4 py-2 text-sm font-semibold text-violet-650 bg-violet-50/30 rounded-lg hover:text-violet-750 hover:bg-violet-50 transition-all border border-violet-200"
                >
                  Admin Panel
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/resources"
                activeProps={{ className: "text-violet-650 bg-violet-50/60 font-semibold" }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:text-foreground hover:bg-accent transition-all"
              >
                Explore
              </Link>
              <Link
                to="/resources"
                activeProps={{ className: "text-violet-650 bg-violet-50/60 font-semibold" }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:text-foreground hover:bg-accent transition-all"
              >
                Resources
              </Link>
              <Link
                to="/leaderboard"
                activeProps={{ className: "text-violet-650 bg-violet-50/60 font-semibold" }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:text-foreground hover:bg-accent transition-all"
              >
                Leaderboard
              </Link>
              <Link
                to="/upload"
                activeProps={{ className: "text-violet-650 bg-violet-50/60 font-semibold" }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:text-foreground hover:bg-accent transition-all"
              >
                Upload
              </Link>
            </>
          )}
        </nav>

        {/* Desktop / Mobile End Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full flex items-center gap-2 h-10 px-4 bg-gradient-primary text-primary-foreground hover:opacity-90 cursor-pointer">
                  <UserIcon className="h-4 w-4" />
                  <span className="text-xs font-bold hidden lg:inline-block">{user.full_name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-bold text-slate-800 truncate">{user.full_name}</p>
                  <p className="text-xs text-slate-400 font-semibold truncate">{user.college_name}</p>
                  {user.role === "admin" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 mt-1">
                      <Shield className="h-3 w-3" /> Administrator
                    </span>
                  )}
                </div>
                <DropdownMenuSeparator />
                {user.role === "admin" && (
                  <DropdownMenuItem onClick={() => { navigate({ to: "/admin" }); closeMobileMenu(); }}>
                    <Shield className="mr-2 h-4 w-4" /> Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => { navigate({ to: "/profile" }); closeMobileMenu(); }}>
                  <UserIcon className="mr-2 h-4 w-4" /> Profile Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate({ to: "/my-uploads" }); closeMobileMenu(); }}>
                  <UploadIcon className="mr-2 h-4 w-4" /> My Uploads
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate({ to: "/saved" }); closeMobileMenu(); }}>
                  <Bookmark className="mr-2 h-4 w-4" /> Saved Resources
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => { await signOut(); navigate({ to: "/" }); closeMobileMenu(); }} className="text-red-650 hover:bg-red-50 hover:text-red-700">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" className="text-primary font-medium hidden sm:inline-flex cursor-pointer" onClick={() => authModal.show("login")}>
                Log in
              </Button>
              <Button className="rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow px-5 cursor-pointer" onClick={() => authModal.show("signup")}>
                Sign up
              </Button>
            </>
          )}

          {/* Mobile Hamburger Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg lg:hidden h-10 w-10 text-slate-700 hover:bg-slate-100 focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
    </header>

    {/* Mobile Sliding Solid Drawer Panel */}
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          />

          {/* Sidebar panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-[280px] sm:w-[320px] bg-white border-l border-zinc-200 p-6 flex flex-col justify-between shadow-2xl lg:hidden h-full"
          >
            <div className="flex flex-col gap-6">
              {/* Header row in mobile drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-sm text-slate-800">AcadVault</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer flex items-center justify-center"
                  onClick={closeMobileMenu}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigation</p>
                {user && (
                  <div className="mt-1 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="font-extrabold text-slate-800 text-xs truncate">{user.full_name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{user.college_name}</p>
                  </div>
                )}
              </div>

                <div className="flex flex-col gap-2">
                  <Link
                    to="/"
                    activeProps={{ className: "text-violet-650 bg-violet-50/50 font-bold" }}
                    activeOptions={{ exact: true }}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:text-foreground hover:bg-slate-50 transition-all"
                  >
                    <GraduationCap className="h-4 w-4" /> Home
                  </Link>

                  {user ? (
                    <>
                      <Link
                        to="/resources"
                        activeProps={{ className: "text-violet-650 bg-violet-50/50 font-bold" }}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:text-foreground hover:bg-slate-50 transition-all"
                      >
                        <TrendingUp className="h-4 w-4" /> Resources
                      </Link>
                      <Link
                        to="/my-uploads"
                        activeProps={{ className: "text-violet-650 bg-violet-50/50 font-bold" }}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:text-foreground hover:bg-slate-50 transition-all"
                      >
                        <UploadIcon className="h-4 w-4" /> My Uploads
                      </Link>
                      <Link
                        to="/saved"
                        activeProps={{ className: "text-violet-650 bg-violet-50/50 font-bold" }}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:text-foreground hover:bg-slate-50 transition-all"
                      >
                        <Bookmark className="h-4 w-4" /> Saved
                      </Link>
                      <Link
                        to="/profile"
                        activeProps={{ className: "text-violet-650 bg-violet-50/50 font-bold" }}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:text-foreground hover:bg-slate-50 transition-all"
                      >
                        <UserIcon className="h-4 w-4" /> Profile
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          activeProps={{ className: "text-violet-650 bg-violet-50/50 font-bold" }}
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-violet-650 bg-violet-50/30 rounded-xl hover:text-violet-750 hover:bg-violet-50 transition-all border border-violet-100"
                        >
                          <Shield className="h-4 w-4 text-violet-600" /> Admin Panel
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      <Link
                        to="/resources"
                        activeProps={{ className: "text-violet-650 bg-violet-50/50 font-bold" }}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:text-foreground hover:bg-slate-50 transition-all"
                      >
                        <TrendingUp className="h-4 w-4" /> Explore
                      </Link>
                      <Link
                        to="/resources"
                        activeProps={{ className: "text-violet-650 bg-violet-50/50 font-bold" }}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:text-foreground hover:bg-slate-50 transition-all"
                      >
                        <GraduationCap className="h-4 w-4" /> Resources
                      </Link>
                      <Link
                        to="/leaderboard"
                        activeProps={{ className: "text-violet-650 bg-violet-50/50 font-bold" }}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:text-foreground hover:bg-slate-50 transition-all"
                      >
                        <Award className="h-4 w-4" /> Leaderboard
                      </Link>
                      <Link
                        to="/upload"
                        activeProps={{ className: "text-violet-650 bg-violet-50/50 font-bold" }}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:text-foreground hover:bg-slate-50 transition-all"
                      >
                        <UploadIcon className="h-4 w-4" /> Upload
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile Actions Bottom */}
              <div className="pt-6 border-t border-zinc-150">
                {user ? (
                  <Button
                    variant="destructive"
                    className="w-full rounded-xl gap-2 font-semibold h-11 cursor-pointer"
                    onClick={async () => {
                      await signOut();
                      navigate({ to: "/" });
                      closeMobileMenu();
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl text-primary font-medium h-11 border-zinc-200 cursor-pointer"
                      onClick={() => {
                        closeMobileMenu();
                        authModal.show("login");
                      }}
                    >
                      Log in
                    </Button>
                    <Button
                      className="w-full rounded-xl bg-gradient-primary text-primary-foreground font-semibold h-11 cursor-pointer shadow-glow"
                      onClick={() => {
                        closeMobileMenu();
                        authModal.show("signup");
                      }}
                    >
                      Sign up
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
