import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Mail, Download } from 'lucide-react';

import VendorStats from '../components/vendors/VendorStats.jsx';
import VendorFilters from '../components/vendors/VendorFilters.jsx';
import VendorTable from '../components/vendors/VendorTable.jsx';
import VendorFormModal from '../components/vendors/VendorFormModal.jsx';
import VendorDeactivateModal from '../components/vendors/VendorDeactivateModal.jsx';

const INITIAL_VENDORS = [
  {
    id: 'vnd-101',
    name: 'Apex Elevator Solutions',
    category: 'Elevator Maintenance',
    phone: '+91 98111 22233',
    email: 'contact@apexelevators.com',
    status: 'ACTIVE',
    invitationStatus: 'Accepted',
    contractType: 'Annual Maintenance (AMC)',
    notes: '24/7 priority response under 1 hour for lift emergencies.',
  },
  {
    id: 'vnd-102',
    name: 'Rapid Aqua Plumbing Services',
    category: 'Plumbing Services',
    phone: '+91 98222 33344',
    email: 'info@rapidaquaplumbing.in',
    status: 'ACTIVE',
    invitationStatus: 'Accepted',
    contractType: 'Annual Maintenance (AMC)',
    notes: 'Covers main pipeline, overhead tank & motor pump maintenance.',
  },
  {
    id: 'vnd-103',
    name: 'VoltCare Electrical Corp',
    category: 'Electrical Works',
    phone: '+91 98333 44455',
    email: 'support@voltcare.com',
    status: 'INVITED',
    invitationStatus: 'Pending',
    contractType: 'On-Call Service',
    notes: 'Substation transformer and street light panel servicing.',
  },
  {
    id: 'vnd-104',
    name: 'ShieldGuard Security Systems',
    category: 'Security Systems',
    phone: '+91 98444 55566',
    email: 'service@shieldguard.com',
    status: 'ACTIVE',
    invitationStatus: 'Accepted',
    contractType: 'Annual Maintenance (AMC)',
    notes: 'CCTV cameras, boom barriers & biometric access control maintenance.',
  },
  {
    id: 'vnd-105',
    name: 'GreenLeaf Landscaping & Gardens',
    category: 'Landscaping & Gardening',
    phone: '+91 98555 66677',
    email: 'gardens@greenleaf.org',
    status: 'ACTIVE',
    invitationStatus: 'Accepted',
    contractType: 'Project Contract',
    notes: 'Weekly lawn trimming, tree pruning and sprinkler upkeep.',
  },
  {
    id: 'vnd-106',
    name: 'CleanCity Waste Logistics',
    category: 'Waste Management',
    phone: '+91 98666 77788',
    email: 'ops@cleancitywaste.com',
    status: 'INACTIVE',
    invitationStatus: 'Expired',
    contractType: 'On-Call Service',
    notes: 'Organic compost plant maintenance & dry waste recycling.',
  },
];

export default function VendorManagement() {
  const [vendorList, setVendorList] = useState(INITIAL_VENDORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit' | 'view'
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [isProcessingDeactivate, setIsProcessingDeactivate] = useState(false);

  // Auto-dismiss notification
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Derived filtered list
  const filteredVendors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return vendorList.filter((v) => {
      const nameMatch = (v.name || '').toLowerCase().includes(term);
      const catMatch = (v.category || '').toLowerCase().includes(term);
      const phoneMatch = (v.phone || '').toLowerCase().includes(term);
      const emailMatch = (v.email || '').toLowerCase().includes(term);
      const matchesSearch = !term || nameMatch || catMatch || phoneMatch || emailMatch;

      const matchesCategory =
        selectedCategory === 'ALL' || v.category === selectedCategory;
      const matchesStatus =
        selectedStatus === 'ALL' ||
        v.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [vendorList, searchTerm, selectedCategory, selectedStatus]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setCurrentPage(1);
  };

  // Handlers
  const handleOpenAddModal = () => {
    setFormMode('add');
    setSelectedVendor(null);
    setFormModalOpen(true);
  };

  const handleOpenViewModal = (vendor) => {
    setFormMode('view');
    setSelectedVendor(vendor);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (vendor) => {
    setFormMode('edit');
    setSelectedVendor(vendor);
    setFormModalOpen(true);
  };

  const handleOpenDeactivateModal = (vendor) => {
    setSelectedVendor(vendor);
    setDeactivateModalOpen(true);
  };

  const handleFormSubmit = (formData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (formMode === 'add') {
        const newVendor = {
          ...formData,
          id: `vnd-${Date.now().toString().slice(-4)}`,
          invitationStatus: formData.status === 'INVITED' ? 'Pending' : 'Accepted',
        };
        setVendorList((prev) => [newVendor, ...prev]);
        setSuccessMessage(`Vendor "${formData.name}" registered and invitation sent.`);
      } else if (formMode === 'edit' && selectedVendor) {
        setVendorList((prev) =>
          prev.map((v) => (v.id === selectedVendor.id ? { ...v, ...formData } : v))
        );
        setSuccessMessage(`Vendor "${formData.name}" updated successfully.`);
      }
      setIsSubmitting(false);
      setFormModalOpen(false);
      setSelectedVendor(null);
    }, 400);
  };

  const handleConfirmDeactivate = () => {
    if (!selectedVendor) return;
    setIsProcessingDeactivate(true);
    setTimeout(() => {
      setVendorList((prev) =>
        prev.map((v) =>
          v.id === selectedVendor.id
            ? { ...v, status: 'INACTIVE', invitationStatus: 'Suspended' }
            : v
        )
      );
      setSuccessMessage(
        `Vendor "${selectedVendor.name}" access deactivated. Historical records preserved.`
      );
      setIsProcessingDeactivate(false);
      setDeactivateModalOpen(false);
      setSelectedVendor(null);
    }, 400);
  };

  const handleSendBatchInvitations = () => {
    setSuccessMessage('Invitation emails dispatched to all pending vendors.');
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Vendor ID,Company Name,Category,Phone,Email,Status,Invitation Status,Contract Type\n' +
      vendorList
        .map(
          (v) =>
            `"${v.id}","${v.name}","${v.category}","${v.phone}","${v.email}","${v.status}","${v.invitationStatus}","${v.contractType}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'society_vendors_directory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage('Vendor directory exported successfully as CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Vendor Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage external contractors, maintenance vendors, and service SLAs.
          </p>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Invite Vendor</span>
          </button>

          <button
            onClick={handleSendBatchInvitations}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4 text-slate-500" />
            <span>Send Invites</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            title="Export vendor list as CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Vendor Stats Bar */}
      <VendorStats vendorList={vendorList} />

      {/* Filters Bar */}
      <VendorFilters
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedCategory={selectedCategory}
        setSelectedCategory={(val) => {
          setSelectedCategory(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        setSelectedStatus={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Vendor Data Table */}
      <VendorTable
        vendorList={filteredVendors}
        searchTerm={searchTerm}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onView={handleOpenViewModal}
        onEdit={handleOpenEditModal}
        onDeactivate={handleOpenDeactivateModal}
      />

      {/* Modals */}
      <VendorFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        mode={formMode}
        initialData={selectedVendor}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <VendorDeactivateModal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        vendorName={selectedVendor?.name}
        onConfirm={handleConfirmDeactivate}
        isProcessing={isProcessingDeactivate}
      />
    </div>
  );
}
