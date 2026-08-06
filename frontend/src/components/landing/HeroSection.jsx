import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  Wrench,
  CheckCircle2,
  Clock,
  UserCheck,
  Sparkles,
  AlertTriangle,
  FileCheck,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-slate-950 text-white">
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/30 to-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-blue-600/15 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next-Gen Society Operations Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Smarter Society Management. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
                One Connected Platform.
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Manage complaints, residents, staff, vendors, maintenance and society operations from one connected platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/register-society"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50 hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors"
              >
                Login to Dashboard
              </Link>
            </div>

            {/* Feature Pills under CTAs */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Role-Based Portals
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Real-Time Tracking
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Staff & Vendor Workflows
              </span>
            </div>
          </div>

          {/* Right Hero Visual Illustration (Housing Society & Workflow UI) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Outer decorative ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl blur-xl opacity-30 animate-pulse" />

              {/* Main Illustration Card Container */}
              <div className="relative rounded-2xl bg-slate-900 border border-slate-800/90 p-5 shadow-2xl space-y-4">
                
                {/* Header bar of mock graphic */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Greenwood Heights Society</h4>
                      <p className="text-[10px] text-slate-400">Digital Operations Console</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    System Active
                  </span>
                </div>

                {/* Complaint Flow Mockup Cards */}
                <div className="space-y-3">
                  
                  {/* Step 1: Resident Card */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          Water Leakage - Flat B-302
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          In Progress
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        Raised by Resident • Assigned to Plumber Vendor
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Staff/Vendor Work Assignment */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          Elevator B Monthly Service
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Assigned
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        Technician On-Site • Proof Upload Ready
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Resolved & Evidence Verified */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          Main Gate Security CCTV Repair
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Resolved
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        Verified by Society Admin & Resident
                      </p>
                    </div>
                  </div>

                </div>

                {/* Floating Metric Badges overlay */}
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-lg p-2.5 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Avg. Resolution</div>
                      <div className="text-xs font-bold text-slate-200">50% Faster</div>
                    </div>
                  </div>
                  <div className="bg-violet-950/40 border border-violet-500/20 rounded-lg p-2.5 flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-violet-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">5 Roles Connected</div>
                      <div className="text-xs font-bold text-slate-200">Unified Portal</div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
