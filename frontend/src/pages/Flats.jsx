import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Upload, Download } from 'lucide-react';

import FlatStats from '../components/flats/FlatStats.jsx';
import FlatFilters from '../components/flats/FlatFilters.jsx';
import FlatTable from '../components/flats/FlatTable.jsx';
import FlatFormModal from '../components/flats/FlatFormModal.jsx';
import ExcelImportModal from '../components/common/ExcelImportModal.jsx';
import DeleteConfirmationModal from '../components/flats/DeleteConfirmationModal.jsx';

import { getFlats, createFlat, updateFlat, deleteFlat,uploadFlatsExcel } from '../lib/flatsApi.js';

function getErrorMessage(err) {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.message === 'Network Error') return 'Unable to reach the server. Please check your connection.';
  return err?.message || 'An unexpected error occurred.';
}

export default function Flats() {
  const [flats, setFlats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [successMessage, setSuccessMessage] = useState('');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [excelModalOpen, setExcelModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [selectedWing, setSelectedWing] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");

  const fetchFlats = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const data = await getFlats(currentPage, limit);
      setFlats(data.data.flats || []);
      setTotalPages(data.data.totalPages || 1);
      setTotalRecords(data.data.total || 0);
    } catch (err) {
      setFetchError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit]);

  const filteredFlats = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return flats.filter((flat) => {
      const flatNumber = (flat.flatNumber || '').toLowerCase();
      const wing = (flat.wing || '').toLowerCase();

      const matchesSearch =
        !term ||
        flatNumber.includes(term) ||
        wing.includes(term);

      const matchesWing =
        selectedWing === 'ALL' ||
        flat.wing === selectedWing;

      const matchesStatus =
        selectedStatus === 'ALL' ||
        flat.status === selectedStatus;

      const matchesType =
        selectedType === 'ALL' ||
        flat.type === selectedType;

      return (
        matchesSearch &&
        matchesWing &&
        matchesStatus &&
        matchesType
      );
    });
  }, [flats, searchTerm, selectedWing, selectedStatus, selectedType]);

  useEffect(() => {
    fetchFlats();
  }, [fetchFlats]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleOpenAddModal = () => {
    setFormMode('add');
    setSelectedFlat(null);
    setFormError('');
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (flat) => {
    setFormMode('edit');
    setSelectedFlat(flat);
    setFormError('');
    setFormModalOpen(true);
  };

  const handleOpenDeleteModal = (flat) => {
    setSelectedFlat(flat);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError('');
    try {
      if (formMode === 'add') {
        await createFlat(formData);
        setSuccessMessage('Flat created successfully.');
      } else {
        await updateFlat(selectedFlat.id, formData);
        setSuccessMessage('Flat updated successfully.');
      }
      setFormModalOpen(false);
      setSelectedFlat(null);
      await fetchFlats();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedFlat) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteFlat(selectedFlat.id);
      setSuccessMessage(`Flat ${selectedFlat.flatNumber} deleted successfully.`);
      setDeleteModalOpen(false);
      setSelectedFlat(null);
      await fetchFlats();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Flat Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage all flats in your society.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Flat</span>
          </button>

          <button
            onClick={() => setExcelModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Upload Excel</span>
          </button>

          <button
            disabled
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 border border-slate-200 text-slate-400 text-sm font-semibold rounded-lg cursor-not-allowed opacity-60"
            title="Export Excel disabled in preview mode"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {successMessage}
        </div>
      )}

      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          {fetchError}
        </div>
      )}

      <FlatStats flats={flats} />

      <FlatFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onReset={() => {
          setSearchTerm('')
          setSelectedWing("ALL");
          setSelectedStatus("ALL");
          setSelectedType("ALL");
        }}
        selectedWing={selectedWing}
        setSelectedWing={setSelectedWing}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      <FlatTable
        flats={filteredFlats}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={setCurrentPage}
        searchTerm={searchTerm}
        onView={handleOpenEditModal}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
      />

      <FlatFormModal
        isOpen={formModalOpen}
        onClose={() => { setFormModalOpen(false); setFormError(''); }}
        mode={formMode}
        initialData={selectedFlat}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        error={formError}
      />

      <ExcelImportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        title="Upload Flats via Excel"
        subtitle="Bulk upload flats via Excel"
        description="Upload an Excel file containing flat details. Duplicate flat numbers are skipped automatically."
        itemNoun="flat"
        itemNounPlural="flats"
        columnsHint="Flat Number, Wing, Floor, Type, Status"
        importFunction={uploadFlatsExcel}
        importLabel="Upload Flats"
        onSuccess={fetchFlats}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteError(''); }}
        flatNumber={selectedFlat?.flatNumber}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}
