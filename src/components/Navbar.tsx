import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Menu, X, Globe, Home, BookOpen, History, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: BookOpen },
  { to: "/history", label: "History", icon: History },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const languages = ["Hinglish", "Hindi", "English"] as const;
export type Language = (typeof languages)[number];

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Navbar({ language, onLanguageChange }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();

  const nextLang = () => {
    const idx = languages.indexOf(language);
    onLanguageChange(languages[(idx + 1) % languages.length]);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-glass-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg glow-text">EduSphere AI</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link key={l.to} to={l.to}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <l.icon className="w-4 h-4" />
                  {l.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-glass-border text-muted-foreground hover:text-foreground" onClick={nextLang}>
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{language}</span>
          </Button>
          <Button className="md:hidden" variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-glass-border/50"
          >
            <div className="p-4 flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
                    <l.icon className="w-4 h-4" />
                    {l.label}
                  </Button>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
