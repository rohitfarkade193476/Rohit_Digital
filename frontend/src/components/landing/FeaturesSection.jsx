import React from "react";
import {
  AlertCircle,
  UserCheck,
  Activity,
  BellRing,
  Users,
  Briefcase,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

const FEATURES = [
  {
    icon: AlertCircle,
    color: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30",
    title: "Complaint Management",
    description:
      "Residents can raise and track maintenance complaints from one place.",
    tag: "Core Feature",
  },
  {
    icon: UserCheck,
    color: "from-indigo-500/20 to-violet-500/10 text-indigo-400 border-indigo-500/30",
    title: "Smart Assignment",
    description:
      "Society admins can assign complaints to the right staff member or vendor.",
    tag: "Workflow",
  },
  {
    icon: Activity,
    color: "from-blue-500/20 to-cyan-500/10 text-blue-400 border-blue-500/30",
    title: "Real-Time Status Tracking",
    description:
      "Everyone can track complaint progress from created to resolved.",
    tag: "Transparency",
  },
  {
    icon: BellRing,
    color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30",
    title: "Notifications",
    description:
      "Keep residents, admins, staff and vendors informed about important updates.",
    tag: "Alerts",
  },
  {
    icon: Users,
    color: "from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30",
    title: "Resident Management",
    description: "Manage residents and flats efficiently.",
    tag: "Directory",
  },
  {
    icon: Briefcase,
    color: "from-sky-500/20 to-indigo-500/10 text-sky-400 border-sky-500/30",
    title: "Staff & Vendor Management",
    description: "Manage internal staff and external service providers.",
    tag: "Operations",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for total society peace of mind
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Purpose-built tools to solve modern housing society maintenance, communication, and management challenges.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} border flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs font-medium text-slate-500 group-hover:text-indigo-400 transition-colors">
                  <CheckCircle className="w-4 h-4 mr-1.5 text-indigo-500/70" />
                  Included in platform
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
