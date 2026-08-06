import React from "react";
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";

export default function LandingFooter() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
          {/* Brand */}
          <div className="lg:col-span-1">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 mb-5 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/30">
                <span className="text-white font-bold text-lg">S</span>
              </div>

              <span className="text-xl font-bold text-white">
                Society<span className="text-indigo-400">Hub</span>
              </span>
            </button>

            <p className="text-sm leading-6 text-slate-400 max-w-sm">
              A smarter way to manage housing societies, complaints,
              residents, staff, vendors, and everyday community operations
              from one platform.
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>support@societyhub.com</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>+91 00000 00000</span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Pune, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Product
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Features
                </button>
              </li>

              <li>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>

              <li>
                <button
                  onClick={() => scrollToSection("roles")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Role Solutions
                </button>
              </li>

              <li>
                <button
                  onClick={() => scrollToSection("product-preview")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Product Preview
                </button>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Platform
            </h3>

            <ul className="space-y-3 text-sm">
              <li className="hover:text-white transition-colors cursor-default">
                Resident Management
              </li>

              <li className="hover:text-white transition-colors cursor-default">
                Complaint Management
              </li>

              <li className="hover:text-white transition-colors cursor-default">
                Staff & Vendor Management
              </li>

              <li className="hover:text-white transition-colors cursor-default">
                Notifications
              </li>

              <li className="hover:text-white transition-colors cursor-default">
                Status Tracking
              </li>
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Get Started
            </h3>

            <p className="text-sm leading-6 text-slate-400 mb-5">
              Bring your society operations together in one simple,
              centralized platform.
            </p>

            <div className="flex flex-col gap-3">
              <a
                href="/register-society"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                Register Your Society
              </a>

              <a
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-200 text-sm font-semibold transition-colors"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} SocietyHub. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-xs sm:text-sm text-slate-500">
            <button className="hover:text-slate-300 transition-colors cursor-pointer">
              Privacy Policy
            </button>

            <button className="hover:text-slate-300 transition-colors cursor-pointer">
              Terms of Service
            </button>

            <button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="w-8 h-8 rounded-lg border border-slate-700 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Back to top"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}