import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, Menu, X, ArrowRight } from "lucide-react";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-slate-950/20 py-3"
          : "bg-slate-950/70 backdrop-blur-sm border-b border-slate-800/60 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                HousingPortal
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Society & Maintenance
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80">
            <button
              onClick={() => scrollToSection("features")}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-full transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-full transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("solutions")}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-full transition-colors"
            >
              Solutions
            </button>
            <button
              onClick={() => scrollToSection("product-preview")}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-full transition-colors"
            >
              Preview
            </button>
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register-society"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all hover:shadow-indigo-600/40 hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 rounded-lg"
            >
              Login
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => scrollToSection("features")}
              className="text-left px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-left px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("solutions")}
              className="text-left px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              Role Solutions
            </button>
            <button
              onClick={() => scrollToSection("product-preview")}
              className="text-left px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              Product Preview
            </button>
          </nav>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link
              to="/login"
              className="w-full text-center py-2.5 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl"
            >
              Login to Account
            </Link>
            <Link
              to="/register-society"
              className="w-full text-center py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
            >
              Get Started (Register Society)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
