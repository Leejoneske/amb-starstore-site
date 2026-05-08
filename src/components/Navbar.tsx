import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Overview", href: "#overview" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Levels", href: "#levels" },
  { label: "Policies", href: "#policies" },
  { label: "Opt-Out", href: "#opt-out" },
  { label: "FAQ", href: "#faq" },
  { label: "Newsletter", href: "#newsletter" },
];

const externalLinks = [
  { label: "Blog", href: "https://starstore.app/blog" },
  { label: "Main App", href: "https://starstore.app" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (href: string) => {
    setOpen(false);
    if (!isHome) {
      navigate("/" + href);
      return;
    }
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigate("/"); }}
            className="flex items-center gap-2 group"
          >
            <span className="text-xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
              StarStore
            </span>
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              Ambassador
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {isHome && navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => handleClick(l.href)}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/60 active:scale-[0.97]"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => { setOpen(false); navigate("/contact"); }}
              className={`px-3 py-1.5 text-sm transition-colors rounded-md hover:bg-secondary/60 active:scale-[0.97] ${
                location.pathname === "/contact" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Contact Us
            </button>
            {externalLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/60"
              >
                {l.label} ↗
              </a>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-md text-foreground hover:bg-secondary active:scale-95 transition-transform"
            aria-label="Toggle navigation"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background/98 backdrop-blur-md border-b border-border animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {isHome && navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => handleClick(l.href)}
                className="block w-full text-left px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-md transition-colors"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => { setOpen(false); navigate("/contact"); }}
              className="block w-full text-left px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-md transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
