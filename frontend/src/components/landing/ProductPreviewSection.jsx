import React from "react";
import {
  LayoutDashboard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MoreVertical,
  UserCheck,
  Building2,
  SlidersHorizontal,
} from "lucide-react";

export default function ProductPreviewSection() {
  return (
    <section id="product-preview" className="py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            Live Interface Preview
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for speed, clarity, and control
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Experience an intuitive dashboard designed to resolve issues faster and keep your society running seamlessly.
          </p>
        </div>

        {/* Mock Application Window Frame */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
          
          {/* Top Browser Control Bar */}
          <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-4 text-xs font-mono text-slate-400">
                app.housingportal.com/society-admin/complaints
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Royal Palm Residency
              </span>
            </div>
          </div>

          {/* Inner Dashboard Layout Mockup */}
          <div className="p-6 space-y-6">
            
            {/* Header & Metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                  Complaint Management Console
                </h3>
                <p className="text-xs text-slate-400">
                  Overview of current complaints, assignments, and resolution status
                </p>
              </div>

              {/* Action Buttons Mock */}
              <div className="flex items-center gap-2">
                <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> Filter Status
                </div>
                <div className="bg-indigo-600 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white">
                  + New Complaint
                </div>
              </div>
            </div>

            {/* Metric Status Cards (Open, In Progress, Resolved, Closed) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Open */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-amber-400 mb-1">
                  <span className="text-xs font-semibold">Open Complaints</span>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-white">12</div>
                <p className="text-[11px] text-slate-400 mt-1">Requires admin review</p>
              </div>

              {/* In Progress */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-blue-400 mb-1">
                  <span className="text-xs font-semibold">In Progress</span>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-white">18</div>
                <p className="text-[11px] text-slate-400 mt-1">Assigned to staff/vendor</p>
              </div>

              {/* Resolved */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-emerald-400 mb-1">
                  <span className="text-xs font-semibold">Resolved</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-white">45</div>
                <p className="text-[11px] text-slate-400 mt-1">Pending resident check</p>
              </div>

              {/* Closed */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold">Closed</span>
                  <XCircle className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-2xl font-black text-white">124</div>
                <p className="text-[11px] text-slate-400 mt-1">Completed & archived</p>
              </div>

            </div>

            {/* Mock Complaint Table */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Recent Complaints
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      readOnly
                      placeholder="Search complaints..."
                      className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-300 pointer-events-none w-44"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Title & Unit</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Assigned To</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    
                    {/* Row 1 */}
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-mono text-slate-400">#CMP-4029</td>
                      <td className="py-3 px-4 font-medium text-white">
                        Main Pipeline Leakage <span className="text-slate-400 font-normal">• Flat A-402</span>
                      </td>
                      <td className="py-3 px-4">Plumbing</td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center">
                          V
                        </div>
                        Apex Plumbing Services
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                          In Progress
                        </span>
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-mono text-slate-400">#CMP-4028</td>
                      <td className="py-3 px-4 font-medium text-white">
                        Elevator B Sensor Fault <span className="text-slate-400 font-normal">• Block B</span>
                      </td>
                      <td className="py-3 px-4">Electrical</td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center">
                          S
                        </div>
                        Ramesh Kumar (Staff)
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                          Open
                        </span>
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-mono text-slate-400">#CMP-4025</td>
                      <td className="py-3 px-4 font-medium text-white">
                        Clubhouse Light Switch <span className="text-slate-400 font-normal">• Amenities</span>
                      </td>
                      <td className="py-3 px-4">Maintenance</td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center">
                          S
                        </div>
                        Suresh Patel (Staff)
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          Resolved
                        </span>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
