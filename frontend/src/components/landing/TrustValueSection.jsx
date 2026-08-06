import React from "react";
import {
  Zap,
  MessageSquareCheck,
  Eye,
  Briefcase,
  Smile,
  ShieldCheck,
} from "lucide-react";

const VALUE_PILLARS = [
  {
    icon: Zap,
    title: "Faster complaint resolution",
    description:
      "Automated routing and instant notifications shorten resolution cycles significantly.",
  },
  {
    icon: MessageSquareCheck,
    title: "Better communication",
    description:
      "Keep residents, committee admins, internal staff, and vendors aligned without manual calls.",
  },
  {
    icon: Eye,
    title: "Transparent complaint tracking",
    description:
      "Clear status visibility from issue submission to photo evidence verification.",
  },
  {
    icon: Briefcase,
    title: "Centralized staff & vendor management",
    description:
      "Seamlessly dispatch tasks, review proof of work, and track service contractor performance.",
  },
  {
    icon: Smile,
    title: "Better resident experience",
    description:
      "Empower residents with a modern, hassle-free digital portal accessible anytime.",
  },
];

export default function TrustValueSection() {
  return (
    <section className="py-24 bg-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Core Value Pillars
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything your society needs, in one place.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Replace fragmented WhatsApp groups, paper registers, and manual tracking with a modern digital platform.
          </p>
        </div>

        {/* Value Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {VALUE_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {pillar.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
