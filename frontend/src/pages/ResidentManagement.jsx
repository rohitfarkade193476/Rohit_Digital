import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Upload, Download } from 'lucide-react';

import ResidentStats from '../components/residents/ResidentStats.jsx';
import ResidentFilters from '../components/residents/ResidentFilters.jsx';
import ResidentTable from '../components/residents/ResidentTable.jsx';
import ResidentFormModal from '../components/residents/ResidentFormModal.jsx';
import ExcelImportModal from '../components/common/ExcelImportModal.jsx';
import DeleteConfirmationModal from '../components/residents/DeleteConfirmationModal.jsx';
import { getResidents,
  createResident,
  updateResident,
  deleteResident,
  previewResidentsExcel,
  uploadResidentsExcel, } from "../lib/residentApi";

export default function ResidentManagement() {

  const [residents, setResidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWing, setSelectedWing] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedResident, setSelectedResident] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [excelModalOpen, setExcelModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchResidents = async () => {
  try {
    setIsLoading(true);
    setFetchError("");

    const data = await getResidents(currentPage);

    setResidents(data.data.residents || []);
  } catch (err) {
    setFetchError(
      err.response?.data?.message || "Failed to load residents"
    );
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
   fetchResidents();
  }, [currentPage]);

  const filteredResidents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return residents.filter((r) => {
      const nameMatch = (r.name || '').toLowerCase().includes(term);
      const flatMatch = (r.flatNumber || '').toLowerCase().includes(term);
      const phoneMatch = (r.phone || '').toLowerCase().includes(term);
      const matchesSearch = !term || nameMatch || flatMatch || phoneMatch;

      const matchesWing = selectedWing === 'ALL' || r.wing === selectedWing;
      const matchesType =
        selectedType === 'ALL' ||
        r.residentType.toLowerCase() === selectedType.toLowerCase();
      const matchesStatus =
        selectedStatus === 'ALL' ||
        r.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesWing && matchesType && matchesStatus;
    });
  }, [residents, searchTerm, selectedWing, selectedType, selectedStatus]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedWing('ALL');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setCurrentPage(1);
  };

  const handleOpenAddModal = () => {
    setFormMode('add');
    setSelectedResident(null);
    setFormModalOpen(true);
  };

  const handleOpenViewModal = (resident) => {
    setFormMode('view');
    setSelectedResident(resident);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (resident) => {
    setFormMode('edit');
    setSelectedResident(resident);
    setFormModalOpen(true);
  };

  const handleOpenDeleteModal = (resident) => {
    setSelectedResident(resident);
    setDeleteModalOpen(true);
  };

 
 const handleFormSubmit = async (formData) => {
  try {
    setIsSubmitting(true);

    if (formMode === "add") {
      await createResident(formData);

      setSuccessMessage(`Resident ${formData.name} added successfully.`);
    } else if (formMode === "edit") {
      await updateResident(selectedResident.id, formData);

      setSuccessMessage(`Resident ${formData.name} updated successfully.`);
    }

    await fetchResidents();

    setFormModalOpen(false);
    setSelectedResident(null);
  } catch (err) {
    console.error(err);
    setFetchError(
      err.response?.data?.message || "Operation failed"
    );
  } finally {
    setIsSubmitting(false);
  }
};
 
const handleConfirmDelete = async () => {
  try {
    setIsDeleting(true);

    await deleteResident(selectedResident.id);

    await fetchResidents();

    setSuccessMessage(
      `Resident ${selectedResident.name} deleted successfully.`
    );

    setDeleteModalOpen(false);
    setSelectedResident(null);
  } catch (err) {
    console.error(err);
    setFetchError(
      err.response?.data?.message || "Delete failed"
    );
  } finally {
    setIsDeleting(false);
  }
};

  const handleExcelUploadSuccess = (result) => {
    setSuccessMessage(
      `${result.imported} resident${result.imported === 1 ? '' : 's'} imported successfully.`
    );
    fetchResidents();
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Resident Name,Flat Number,Wing,Phone Number,Email,Resident Type,Status,Move-in Date\nRahul Sharma,A101,A,+91 98765 43210,rahul.sharma@example.com,Owner,ACTIVE,2022-01-15\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'resident_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMessage('Resident Excel template downloaded successfully.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Resident Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage all residents in your society.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resident</span>
          </button>

          <button
            onClick={() => setExcelModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Upload Excel</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            title="Download CSV/Excel template format"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download Template</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {successMessage}
        </div>
      )}

      <ResidentStats residents={residents} />

      <ResidentFilters
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedWing={selectedWing}
        setSelectedWing={(val) => {
          setSelectedWing(val);
          setCurrentPage(1);
        }}
        selectedType={selectedType}
        setSelectedType={(val) => {
          setSelectedType(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        setSelectedStatus={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
      />

      <ResidentTable
        residents={filteredResidents}
        searchTerm={searchTerm}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onView={handleOpenViewModal}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
      />

      <ResidentFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        mode={formMode}
        initialData={selectedResident}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <ExcelImportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        title="Import Residents"
        subtitle="Bulk import residents via Excel"
        description="Upload an Excel file containing resident details. Residents will belong to your society and receive an activation email to set their password."
        itemNoun="resident"
        itemNounPlural="residents"
        columnsHint="Resident Name, Phone Number, Email, Flat Number, Resident Type"
        templateCsv="data:text/csv;charset=utf-8,Resident Name,Flat Number,Wing,Phone Number,Email,Resident Type,Status,Move-in Date\nRahul Sharma,A101,A,+91 98765 43210,rahul.sharma@example.com,Owner,ACTIVE,2022-01-15\n"
        templateFilename="resident_import_template.csv"
        previewFunction={previewResidentsExcel}
        importFunction={uploadResidentsExcel}
        previewExtraColumn={{ label: 'Flat', accessor: 'flatNumber' }}
        importLabel="Import Residents"
        onSuccess={handleExcelUploadSuccess}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        residentName={selectedResident?.name}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
