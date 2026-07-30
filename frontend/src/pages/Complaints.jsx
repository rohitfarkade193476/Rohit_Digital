import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Download, X, Loader2, AlertCircle } from 'lucide-react';

import ComplaintStats from '../components/complaints/ComplaintStats.jsx';
import ComplaintFilters from '../components/complaints/ComplaintFilters.jsx';
import ComplaintTable from '../components/complaints/ComplaintTable.jsx';
import ComplaintDetailsDrawer from '../components/complaints/ComplaintDetailsDrawer.jsx';
import AssignStaffModal from '../components/complaints/AssignStaffModal.jsx';
import AssignVendorModal from '../components/complaints/AssignVendorModal.jsx';

const SAMPLE_STAFF = [
  { id: 'st-1', name: 'Mohan Lal', role: 'Electrician' },
  { id: 'st-2', name: 'Ramesh Kumar', role: 'Security Guard' },
  { id: 'st-3', name: 'Geeta Devi', role: 'Housekeeping Cleaner' },
  { id: 'st-4', name: 'Vijay Singh', role: 'Plumber' },
];

const SAMPLE_VENDORS = [
  { id: 'v-1', name: 'Apex Elevator Co.', category: 'Elevator Maintenance' },
  { id: 'v-2', name: 'QuickPlumb Services', category: 'Plumbing Services' },
  { id: 'v-3', name: 'BrightSpark Electricals', category: 'Electrical Contracting' },
  { id: 'v-4', name: 'ShieldGuard Security', category: 'CCTV & Security Tech' },
];

const INITIAL_COMPLAINTS = [
  {
    id: 'cmp-1001',
    ticketId: '#CMP-1001',
    title: 'Water Leakage in Master Bathroom',
    description: 'Water is dripping constantly from the ceiling of the master bathroom. Causing dampness on walls.',
    residentName: 'Rahul Sharma',
    flatNumber: 'A101',
    residentPhone: '+91 98765 43210',
    residentEmail: 'rahul.sharma@example.com',
    category: 'Plumbing',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedTo: { name: 'Mohan Lal', type: 'Staff' },
    assignedStaff: 'Mohan Lal',
    assignedVendor: null,
    createdDate: '2026-07-25',
    timeline: [
      { step: 'CREATED', time: '2026-07-25 09:30 AM' },
      { step: 'ASSIGNED', time: '2026-07-25 10:15 AM' },
      { step: 'IN_PROGRESS', time: '2026-07-25 11:00 AM' },
    ],
    comments: [
      { author: 'Rahul Sharma', date: '2026-07-25 09:30 AM', text: 'Water dripping getting worse.' },
      { author: 'Mohan Lal (Staff)', date: '2026-07-25 10:30 AM', text: 'Inspected flat above, valve replacement needed.' },
    ],
  },
  {
    id: 'cmp-1002',
    ticketId: '#CMP-1002',
    title: 'Lift B Noise & Frequent Stoppage',
    description: 'Lift B in Wing B is making screeching sound and stopping midway between 2nd and 3rd floor.',
    residentName: 'Sneha Patil',
    flatNumber: 'B203',
    residentPhone: '+91 98230 11223',
    residentEmail: 'sneha.patil@example.com',
    category: 'Elevator',
    priority: 'EMERGENCY',
    status: 'OPEN',
    assignedTo: { name: 'Apex Elevator Co.', type: 'Vendor' },
    assignedStaff: null,
    assignedVendor: 'Apex Elevator Co.',
    createdDate: '2026-07-28',
    timeline: [{ step: 'CREATED', time: '2026-07-28 08:10 AM' }],
    comments: [
      { author: 'Sneha Patil', date: '2026-07-28 08:10 AM', text: 'Lift stopped with residents inside briefly.' },
    ],
  },
  {
    id: 'cmp-1003',
    ticketId: '#CMP-1003',
    title: 'Corridor Light Not Working on 4th Floor',
    description: 'Two tubelights in the corridor near A401-A404 are flickering and turned off.',
    residentName: 'Vikram Mehta',
    flatNumber: 'A402',
    residentPhone: '+91 97112 33445',
    residentEmail: 'vikram.mehta@example.com',
    category: 'Electrical',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    assignedTo: { name: 'BrightSpark Electricals', type: 'Vendor' },
    assignedStaff: null,
    assignedVendor: 'BrightSpark Electricals',
    createdDate: '2026-07-20',
    timeline: [
      { step: 'CREATED', time: '2026-07-20 02:00 PM' },
      { step: 'ASSIGNED', time: '2026-07-20 03:00 PM' },
      { step: 'IN_PROGRESS', time: '2026-07-21 10:00 AM' },
      { step: 'RESOLVED', time: '2026-07-21 04:30 PM' },
    ],
    comments: [
      { author: 'BrightSpark Technician', date: '2026-07-21 04:30 PM', text: 'Replaced choke and bulb.' },
    ],
  },
  {
    id: 'cmp-1004',
    ticketId: '#CMP-1004',
    title: 'Trash Collection Delayed in Wing C',
    description: 'Morning housekeeping staff missed garbage collection on 1st floor Wing C today.',
    residentName: 'Ananya Iyer',
    flatNumber: 'C104',
    residentPhone: '+91 99887 76655',
    residentEmail: 'ananya.iyer@example.com',
    category: 'Housekeeping',
    priority: 'LOW',
    status: 'CLOSED',
    assignedTo: { name: 'Geeta Devi', type: 'Staff' },
    assignedStaff: 'Geeta Devi',
    assignedVendor: null,
    createdDate: '2026-07-18',
    timeline: [
      { step: 'CREATED', time: '2026-07-18 11:00 AM' },
      { step: 'ASSIGNED', time: '2026-07-18 11:15 AM' },
      { step: 'IN_PROGRESS', time: '2026-07-18 11:30 AM' },
      { step: 'RESOLVED', time: '2026-07-18 12:00 PM' },
      { step: 'CLOSED', time: '2026-07-18 01:00 PM' },
    ],
    comments: [{ author: 'Geeta Devi', date: '2026-07-18 12:00 PM', text: 'Trash collected.' }],
  },
  {
    id: 'cmp-1005',
    ticketId: '#CMP-1005',
    title: 'Main Gate Security Camera Malfunction',
    description: 'CCTV Camera #3 at Gate 1 feed is blank on the security monitor.',
    residentName: 'Rajesh Kumar',
    flatNumber: 'B102',
    residentPhone: '+91 96543 21098',
    residentEmail: 'rajesh.kumar@example.com',
    category: 'Security',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedTo: { name: 'Ramesh Kumar', type: 'Staff' },
    assignedStaff: 'Ramesh Kumar',
    assignedVendor: null,
    createdDate: '2026-07-26',
    timeline: [
      { step: 'CREATED', time: '2026-07-26 04:00 PM' },
      { step: 'ASSIGNED', time: '2026-07-26 04:30 PM' },
      { step: 'IN_PROGRESS', time: '2026-07-27 09:00 AM' },
    ],
    comments: [],
  },
  {
    id: 'cmp-1006',
    ticketId: '#CMP-1006',
    title: 'Balcony Door Latch Broken',
    description: 'Sliding balcony door latch broken during heavy wind.',
    residentName: 'Priya Joshi',
    flatNumber: 'D301',
    residentPhone: '+91 95432 10987',
    residentEmail: 'priya.joshi@example.com',
    category: 'Carpentry',
    priority: 'LOW',
    status: 'OPEN',
    assignedTo: 'Unassigned',
    assignedStaff: null,
    assignedVendor: null,
    createdDate: '2026-07-29',
    timeline: [{ step: 'CREATED', time: '2026-07-29 09:00 AM' }],
    comments: [],
  },
  {
    id: 'cmp-1007',
    ticketId: '#CMP-1007',
    title: 'Low Water Pressure on 3rd Floor',
    description: 'Taps in kitchen and bathroom have very low water pressure since yesterday evening.',
    residentName: 'Amit Verma',
    flatNumber: 'C303',
    residentPhone: '+91 94321 09876',
    residentEmail: 'amit.verma@example.com',
    category: 'Plumbing',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    assignedTo: { name: 'QuickPlumb Services', type: 'Vendor' },
    assignedStaff: null,
    assignedVendor: 'QuickPlumb Services',
    createdDate: '2026-07-22',
    timeline: [
      { step: 'CREATED', time: '2026-07-22 06:00 PM' },
      { step: 'ASSIGNED', time: '2026-07-22 07:00 PM' },
      { step: 'IN_PROGRESS', time: '2026-07-23 09:00 AM' },
      { step: 'RESOLVED', time: '2026-07-23 11:30 AM' },
    ],
    comments: [],
  },
  {
    id: 'cmp-1008',
    ticketId: '#CMP-1008',
    title: 'Basement Parking Light Flickering',
    description: 'LED panel near parking slot P-42 is continuously flickering.',
    residentName: 'Pooja Kulkarni',
    flatNumber: 'D204',
    residentPhone: '+91 93210 98765',
    residentEmail: 'pooja.kulkarni@example.com',
    category: 'Electrical',
    priority: 'LOW',
    status: 'OPEN',
    assignedTo: { name: 'Mohan Lal', type: 'Staff' },
    assignedStaff: 'Mohan Lal',
    assignedVendor: null,
    createdDate: '2026-07-27',
    timeline: [{ step: 'CREATED', time: '2026-07-27 01:00 PM' }],
    comments: [],
  },
];

export default function Complaints() {
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStaff, setSelectedStaff] = useState('ALL');
  const [selectedVendor, setSelectedVendor] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [assignStaffModalOpen, setAssignStaffModalOpen] = useState(false);
  const [assignVendorModalOpen, setAssignVendorModalOpen] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newComplaintForm, setNewComplaintForm] = useState({
    title: '',
    residentName: '',
    flatNumber: '',
    category: 'Plumbing',
    priority: 'MEDIUM',
    description: '',
  });

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const filteredComplaints = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return complaints.filter((c) => {
      const ticketMatch = (c.ticketId || c.id || '').toLowerCase().includes(term);
      const titleMatch = (c.title || '').toLowerCase().includes(term);
      const residentMatch = (c.residentName || '').toLowerCase().includes(term);
      const flatMatch = (c.flatNumber || '').toLowerCase().includes(term);
      const matchesSearch = !term || ticketMatch || titleMatch || residentMatch || flatMatch;

      const matchesPriority =
        selectedPriority === 'ALL' || c.priority.toUpperCase() === selectedPriority.toUpperCase();

      const matchesStatus =
        selectedStatus === 'ALL' || c.status.toUpperCase() === selectedStatus.toUpperCase();

      const matchesCategory =
        selectedCategory === 'ALL' || c.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesStaff =
        selectedStaff === 'ALL' ||
        (selectedStaff === 'UNASSIGNED'
          ? !c.assignedStaff
          : c.assignedStaff === selectedStaff);

      const matchesVendor =
        selectedVendor === 'ALL' ||
        (selectedVendor === 'UNASSIGNED'
          ? !c.assignedVendor
          : c.assignedVendor === selectedVendor);

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus &&
        matchesCategory &&
        matchesStaff &&
        matchesVendor
      );
    });
  }, [
    complaints,
    searchTerm,
    selectedPriority,
    selectedStatus,
    selectedCategory,
    selectedStaff,
    selectedVendor,
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedPriority('ALL');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
    setSelectedStaff('ALL');
    setSelectedVendor('ALL');
    setCurrentPage(1);
  };

  const handleOpenViewDrawer = (complaint) => {
    setSelectedComplaint(complaint);
    setDrawerOpen(true);
  };

  const handleOpenAssignStaff = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignStaffModalOpen(true);
  };

  const handleOpenAssignVendor = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignVendorModalOpen(true);
  };

  const handleAssignStaffSubmit = (complaintId, staffName) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const updatedTimeline = [...(c.timeline || [])];
          if (!updatedTimeline.some((t) => t.step === 'ASSIGNED')) {
            updatedTimeline.push({
              step: 'ASSIGNED',
              time: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
            });
          }
          return {
            ...c,
            assignedStaff: staffName,
            assignedVendor: null,
            assignedTo: { name: staffName, type: 'Staff' },
            status: c.status === 'OPEN' ? 'IN_PROGRESS' : c.status,
            timeline: updatedTimeline,
          };
        }
        return c;
      })
    );

    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint((prev) => ({
        ...prev,
        assignedStaff: staffName,
        assignedVendor: null,
        assignedTo: { name: staffName, type: 'Staff' },
        status: prev.status === 'OPEN' ? 'IN_PROGRESS' : prev.status,
      }));
    }

    setSuccessMessage(`Staff member "${staffName}" assigned successfully.`);
  };

  const handleAssignVendorSubmit = (complaintId, vendorName) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const updatedTimeline = [...(c.timeline || [])];
          if (!updatedTimeline.some((t) => t.step === 'ASSIGNED')) {
            updatedTimeline.push({
              step: 'ASSIGNED',
              time: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
            });
          }
          return {
            ...c,
            assignedVendor: vendorName,
            assignedStaff: null,
            assignedTo: { name: vendorName, type: 'Vendor' },
            status: c.status === 'OPEN' ? 'IN_PROGRESS' : c.status,
            timeline: updatedTimeline,
          };
        }
        return c;
      })
    );

    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint((prev) => ({
        ...prev,
        assignedVendor: vendorName,
        assignedStaff: null,
        assignedTo: { name: vendorName, type: 'Vendor' },
        status: prev.status === 'OPEN' ? 'IN_PROGRESS' : prev.status,
      }));
    }

    setSuccessMessage(`Vendor "${vendorName}" assigned successfully.`);
  };

  const handleCloseComplaintSubmit = (complaint) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaint.id) {
          const updatedTimeline = [...(c.timeline || [])];
          if (!updatedTimeline.some((t) => t.step === 'CLOSED')) {
            updatedTimeline.push({
              step: 'CLOSED',
              time: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
            });
          }
          return { ...c, status: 'CLOSED', timeline: updatedTimeline };
        }
        return c;
      })
    );

    if (selectedComplaint && selectedComplaint.id === complaint.id) {
      setSelectedComplaint((prev) => ({ ...prev, status: 'CLOSED' }));
    }

    setSuccessMessage(`Complaint "${complaint.ticketId}" marked as CLOSED.`);
  };

  const handleAddCommentSubmit = (complaintId, text) => {
    const newCommentObj = {
      author: 'Society Admin',
      date: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      text: text,
    };

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return { ...c, comments: [...(c.comments || []), newCommentObj] };
        }
        return c;
      })
    );

    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newCommentObj],
      }));
    }
  };

  const handleCreateComplaintSubmit = (e) => {
    e.preventDefault();
    const nextNum = complaints.length + 1001;
    const newComplaint = {
      id: `cmp-${nextNum}`,
      ticketId: `#CMP-${nextNum}`,
      title: newComplaintForm.title.trim(),
      residentName: newComplaintForm.residentName.trim(),
      flatNumber: newComplaintForm.flatNumber.trim(),
      category: newComplaintForm.category,
      priority: newComplaintForm.priority,
      description: newComplaintForm.description.trim(),
      status: 'OPEN',
      assignedTo: 'Unassigned',
      assignedStaff: null,
      assignedVendor: null,
      createdDate: new Date().toISOString().split('T')[0],
      timeline: [
        {
          step: 'CREATED',
          time: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        },
      ],
      comments: [],
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    setSuccessMessage(`Complaint "${newComplaint.ticketId}" created successfully.`);
    setCreateModalOpen(false);
    setNewComplaintForm({
      title: '',
      residentName: '',
      flatNumber: '',
      category: 'Plumbing',
      priority: 'MEDIUM',
      description: '',
    });
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Complaint ID,Title,Resident,Flat,Category,Priority,Status,Assigned To,Created Date\n' +
      complaints
        .map(
          (c) =>
            `"${c.ticketId}","${c.title}","${c.residentName}","${c.flatNumber}","${c.category}","${c.priority}","${c.status}","${
              c.assignedTo?.name || c.assignedTo || 'Unassigned'
            }","${c.createdDate}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'complaints_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage('Complaints exported successfully as CSV.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Complaint Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and track all complaints.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Complaint</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            title="Export complaints as CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {successMessage}
        </div>
      )}

      <ComplaintStats complaints={complaints} />

      <ComplaintFilters
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedPriority={selectedPriority}
        setSelectedPriority={(val) => {
          setSelectedPriority(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        setSelectedStatus={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        selectedCategory={selectedCategory}
        setSelectedCategory={(val) => {
          setSelectedCategory(val);
          setCurrentPage(1);
        }}
        selectedStaff={selectedStaff}
        setSelectedStaff={(val) => {
          setSelectedStaff(val);
          setCurrentPage(1);
        }}
        selectedVendor={selectedVendor}
        setSelectedVendor={(val) => {
          setSelectedVendor(val);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
        staffOptions={SAMPLE_STAFF}
        vendorOptions={SAMPLE_VENDORS}
      />

      <ComplaintTable
        complaints={filteredComplaints}
        searchTerm={searchTerm}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onView={handleOpenViewDrawer}
        onAssign={(c) => {
          setSelectedComplaint(c);
          setAssignStaffModalOpen(true);
        }}
        onEdit={handleOpenViewDrawer}
      />

      <ComplaintDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        complaint={selectedComplaint}
        onAssignStaffClick={handleOpenAssignStaff}
        onAssignVendorClick={handleOpenAssignVendor}
        onCloseComplaintClick={handleCloseComplaintSubmit}
        onAddComment={handleAddCommentSubmit}
      />

      <AssignStaffModal
        isOpen={assignStaffModalOpen}
        onClose={() => setAssignStaffModalOpen(false)}
        complaint={selectedComplaint}
        staffList={SAMPLE_STAFF}
        onAssign={handleAssignStaffSubmit}
      />

      <AssignVendorModal
        isOpen={assignVendorModalOpen}
        onClose={() => setAssignVendorModalOpen(false)}
        complaint={selectedComplaint}
        vendorList={SAMPLE_VENDORS}
        onAssign={handleAssignVendorSubmit}
      />

      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Log New Complaint</h2>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaintSubmit}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Complaint Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Pipeline Leakage"
                    value={newComplaintForm.title}
                    onChange={(e) =>
                      setNewComplaintForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Resident Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={newComplaintForm.residentName}
                      onChange={(e) =>
                        setNewComplaintForm((prev) => ({ ...prev, residentName: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Flat Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. A101"
                      value={newComplaintForm.flatNumber}
                      onChange={(e) =>
                        setNewComplaintForm((prev) => ({ ...prev, flatNumber: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Category *
                    </label>
                    <select
                      value={newComplaintForm.category}
                      onChange={(e) =>
                        setNewComplaintForm((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Elevator">Elevator</option>
                      <option value="Security">Security</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Priority *
                    </label>
                    <select
                      value={newComplaintForm.priority}
                      onChange={(e) =>
                        setNewComplaintForm((prev) => ({ ...prev, priority: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="EMERGENCY">Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the complaint details..."
                    value={newComplaintForm.description}
                    onChange={(e) =>
                      setNewComplaintForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Create Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
