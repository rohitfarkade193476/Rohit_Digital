import React, { useState } from "react";
import {
  User,
  Shield,
  UserCog,
  Briefcase,
  Globe,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const ROLES = [
  {
    id: "resident",
    roleName: "Resident",
    icon: User,
    badge: "Homeowner / Tenant",
    color: "from-blue-500 to-indigo-600",
    description:
      "A frictionless portal for residents to submit requests, monitor resolution progress, and verify fixes.",
    features: [
      "Raise complaints with photos and descriptions",
      "Track complaint status in real-time",
      "View resolution evidence uploaded by technicians",
      "Reopen complaint if issue is not fully resolved",
    ],
  },
  {
    id: "society-admin",
    roleName: "Society Admin",
    icon: Shield,
    badge: "Committee / Management",
    color: "from-indigo-500 to-violet-600",
    description:
      "Full administrative oversight over society flats, residents, staff assignments, and maintenance tasks.",
    features: [
      "Manage all resident and flat records",
      "Assign complaints to internal staff or external vendors",
      "Monitor daily society operations and performance",
      "Close resolved complaints after verification",
    ],
  },
  {
    id: "staff",
    roleName: "Staff",
    icon: UserCog,
    badge: "Maintenance / Operations",
    color: "from-emerald-500 to-teal-600",
    description:
      "Mobile-friendly operational workspace for electricians, plumbers, security, and facility staff.",
    features: [
      "View assigned complaints instantly",
      "Accept assignments and update work progress",
      "Upload resolution photo evidence on-site",
      "Receive real-time task notifications",
    ],
  },
  {
    id: "vendor",
    roleName: "Vendor",
    icon: Briefcase,
    badge: "Third-Party Contractors",
    color: "from-amber-500 to-orange-600",
    description:
      "Dedicated contractor portal for external service providers to manage society jobs and service orders.",
    features: [
      "Manage assigned society maintenance jobs",
      "Accept work requests and set schedules",
      "Update job status from field",
      "Submit completion evidence & service details",
    ],
  },
  {
    id: "super-admin",
    roleName: "Super Admin",
    icon: Globe,
    badge: "SaaS Platform Operator",
    color: "from-purple-500 to-pink-600",
    description:
      "Multi-tenant platform control center for system-wide governance, society onboarding, and oversight.",
    features: [
      "Manage multiple housing societies",
      "Monitor overall SaaS platform metrics",
      "Manage system-level operations & accounts",
      "Audit platform activity and logs",
    ],
  },
];

export default function RoleSolutionsSection() {
  const [activeRole, setActiveRole] = useState("resident");

  const currentRole = ROLES.find((r) => r.id === activeRole) || ROLES[0];
  const Icon = currentRole.icon;

  return (
    <section id="solutions" className="py-24 bg-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            Tailored Experiences
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for every role in your society
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Dedicated interface and permissions tailored specifically to how each stakeholder works.
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-12">
          {ROLES.map((role) => {
            const RoleIcon = role.icon;
            const isActive = role.id === activeRole;
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <RoleIcon className="w-4 h-4" />
                {role.roleName}
              </button>
            );
          })}
        </div>

        {/* Selected Role Showcase Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-4 text-center md:text-left space-y-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${currentRole.color} mx-auto md:mx-0 flex items-center justify-center text-white shadow-xl`}>
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                  {currentRole.badge}
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  {currentRole.roleName} Dashboard
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                {currentRole.description}
              </p>
              
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Access {currentRole.roleName} Portal
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Role Feature Checklist */}
            <div className="md:col-span-8 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3">
                Key Role Capabilities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentRole.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-200 font-medium leading-snug">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
