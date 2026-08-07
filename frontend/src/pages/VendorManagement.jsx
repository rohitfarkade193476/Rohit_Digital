import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';

import VendorStats from '../components/vendors/VendorStats.jsx';
import VendorFilters from '../components/vendors/VendorFilters.jsx';
import VendorTable from '../components/vendors/VendorTable.jsx';
import VendorDetailsModal from '../components/vendors/VendorDetailsModal.jsx';
import { getAllVendors } from '../lib/vendorApi.js';
import {
  getSocietyConnections,
  sendConnectionRequest,
} from '../lib/vendorConnectionApi.js';

const PAGE_SIZE = 6;

const STATIC_CATEGORIES = [
  'Plumbing Services',
  'Electrical Works',
  'Elevator Maintenance',
  'Security Systems',
  'Pest Control',
  'Waste Management',
  'Landscaping & Gardening',
  'Civil & Painting',
];

export default function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('AVAILABLE');

  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const [detailsVendor, setDetailsVendor] = useState(null);
  const [connections, setConnections] = useState([]);
  const [actionError, setActionError] = useState('');
  const [sendingId, setSendingId] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const fetchVendors = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError('');
      const data = await getAllVendors({
        page: currentPage,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        category: selectedCategory === 'ALL' ? '' : selectedCategory,
        isAvailable:
          selectedAvailability === 'AVAILABLE' ? 'true' : 'false',
      });
      setVendors(data.data?.vendors || []);
      setTotal(data.data?.total || 0);
      setTotalPages(data.data?.totalPages || 1);
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Failed to load vendors'
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedCategory, selectedAvailability]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const fetchConnections = useCallback(async () => {
    try {
      const data = await getSocietyConnections();
      setConnections(data.data?.connections || []);
    } catch (err) {
      setActionError(
        err?.response?.data?.message || 'Failed to load vendor connections',
      );
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleSendConnectionRequest = async (vendorId) => {
    try {
      setSendingId(vendorId);
      setActionError('');
      const data = await sendConnectionRequest(vendorId);
      setSuccessMessage(data.message);
      await fetchConnections();
    } catch (err) {
      setActionError(
        err?.response?.data?.message || 'Failed to send connection request',
      );
    } finally {
      setSendingId(null);
    }
  };

  const connectionStatusForVendor = (vendorId) => {
    const connection = connections.find((c) => c.vendorId === vendorId);
    return connection?.status || null;
  };

  const categoryOptions = useMemo(() => {
    const fromData = new Set(vendors.map((v) => v.category).filter(Boolean));
    const merged = [...fromData];
    for (const c of STATIC_CATEGORIES) {
      if (!merged.includes(c)) merged.push(c);
    }
    return merged;
  }, [vendors]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedAvailability('AVAILABLE');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Company Name,Category,Contact,Phone,Email,Status,Available,Contract Type\n' +
      vendors
        .map(
          (v) =>
            `"${v.companyName || v.name}","${v.category}","${v.contactPerson}","${v.phone}","${v.email}","${v.status}","${v.isAvailable ? 'Yes' : 'No'}","${v.contractType || ''}"`
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
            Browse registered service partners and assign work.
          </p>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportCSV}
            disabled={vendors.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            title="Export vendor list as CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {actionError}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {successMessage}
        </div>
      )}

      <VendorStats vendorList={vendors} total={total} />

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
        selectedAvailability={selectedAvailability}
        setSelectedAvailability={(val) => {
          setSelectedAvailability(val);
          setCurrentPage(1);
        }}
        categoryOptions={categoryOptions}
        onReset={handleResetFilters}
      />

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-12 flex items-center justify-center text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading vendors…
        </div>
      ) : (
        <VendorTable
          vendorList={vendors}
          searchTerm={debouncedSearch}
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          onPageChange={setCurrentPage}
          onView={(vendor) => setDetailsVendor(vendor)}
        />
      )}

      <VendorDetailsModal
        isOpen={!!detailsVendor}
        onClose={() => setDetailsVendor(null)}
        vendor={detailsVendor}
        connectionStatus={
          detailsVendor ? connectionStatusForVendor(detailsVendor.id) : null
        }
        isSendingRequest={
          detailsVendor ? sendingId === detailsVendor.id : false
        }
        onSendRequest={handleSendConnectionRequest}
      />
    </div>
  );
}
