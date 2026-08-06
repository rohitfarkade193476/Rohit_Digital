import React from "react";
import {
  FileText,
  UserCheck,
  Wrench,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: FileText,
    title: "Resident raises complaint",
    description:
      "Resident submits a detailed complaint with photo proof, category, and preferred time slot.",
    badge: "Step 1",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Society Admin reviews & assigns",
    description:
      "Admin verifies the complaint urgency and assigns it to internal staff or external vendor.",
    badge: "Step 2",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    number: "03",
    icon: Wrench,
    title: "Staff/Vendor works on complaint",
    description:
      "Assigned technician updates status, inspects the issue, and uploads resolution evidence.",
    badge: "Step 3",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Resident verifies resolution",
    description:
      "Resident reviews evidence, approves completion, or requests reopen if unresolved.",
    badge: "Step 4",
    gradient: "from-emerald-500 to-teal-600",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider">
            Simple 4-Step Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How complaints get resolved effortlessly
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            A transparent, audit-ready lifecycle keeping every stakeholder on the exact same page.
          </p>
        </div>

        {/* 4-Step Connected Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-blue-500/30 via-violet-500/30 to-emerald-500/30 -translate-y-6 pointer-events-none z-0" />

          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 z-10 flex flex-col justify-between"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black bg-gradient-to-r from-slate-400 to-slate-600 bg-clip-text text-transparent">
                      {step.number}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg shadow-indigo-950/50`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-800/40">
                    {step.badge}
                  </span>
                  {idx < STEPS.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-600 hidden lg:block" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
