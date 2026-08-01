import React, { useState, useMemo } from 'react';
import { Bell, Plus, Search, Calendar, AlertCircle, Edit2, Trash2, Eye, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';

const INITIAL_NOTICES = [
  {
    id: 'NOT-101',
    title: 'Annual General Body Meeting (AGM) Notice',
    content:
      'The Annual General Body Meeting of Green Valley Society will be held on Sunday, August 15th at 10:00 AM in the Main Clubhouse. All owners are requested to attend.',
    date: '2026-08-01',
    priority: 'HIGH',
    audience: 'All Residents',
    createdBy: 'Society Managing Committee',
    isRead: false,
  },
  {
    id: 'NOT-102',
    title: 'Overhead Water Tank Cleaning Schedule',
    content:
      'Water supply will be temporarily shut off on Wednesday, August 5th between 10:00 AM and 4:00 PM for biannual overhead tank cleaning and chlorination.',
    date: '2026-07-28',
    priority: 'MEDIUM',
    audience: 'All Residents',
    createdBy: 'Estate Manager',
    isRead: true,
  },
  {
    id: 'NOT-103',
    title: 'Independence Day Cultural Program Registration',
    content:
      'Children interested in participating in dance, singing, or drama for Independence Day celebrations are invited to register at the admin office before August 8th.',
    date: '2026-07-25',
    priority: 'NORMAL',
    audience: 'All Residents',
    createdBy: 'Cultural Committee',
    isRead: true,
  },
];

function PriorityBadge({ priority }) {
  if (priority === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <AlertCircle className="w-3 h-3" /> High Priority
      </span>
    );
  }
  if (priority === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        Medium Priority
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
      General Notice
    </span>
  );
}

export default function Notices() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SOCIETY_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewNotice, setViewNotice] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    priority: 'NORMAL',
    audience: 'All Residents',
  });

  const filteredNotices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return notices.filter((n) => {
      const matchSearch =
        !term ||
        n.title.toLowerCase().includes(term) ||
        n.content.toLowerCase().includes(term);
      const matchPriority = selectedPriority === 'ALL' || n.priority === selectedPriority;
      return matchSearch && matchPriority;
    });
  }, [notices, searchTerm, selectedPriority]);

  const handleCreateNotice = (e) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;

    const noticeObj = {
      ...newNotice,
      id: `NOT-${Date.now().toString().slice(-3)}`,
      date: new Date().toISOString().split('T')[0],
      createdBy: `${user?.firstName || 'Admin'} ${user?.lastName || ''}`,
      isRead: false,
    };

    setNotices((prev) => [noticeObj, ...prev]);
    setCreateModalOpen(false);
    setNewNotice({ title: '', content: '', priority: 'NORMAL', audience: 'All Residents' });
    setToastMessage('Society notice published successfully.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDeleteNotice = (id) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    setToastMessage('Notice deleted successfully.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleMarkAsRead = (id) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isAdmin ? 'Society Notice Board Management' : 'Community Notices'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isAdmin
              ? 'Publish official announcements, maintenance updates & event circulars.'
              : 'Stay informed with the latest updates and announcements from society management.'}
          </p>
        </div>

        {isAdmin && (
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Publish Notice
          </Button>
        )}
      </div>

      {toastMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notice by keyword..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium"
        >
          <option value="ALL">All Priorities</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="NORMAL">General Notices</option>
        </select>
      </div>

      {/* Notices Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredNotices.map((n) => (
          <div
            key={n.id}
            className={`bg-white rounded-2xl border ${
              !n.isRead && !isAdmin ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-200/80'
            } p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <PriorityBadge priority={n.priority} />
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{n.date}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">{n.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{n.content}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">By: {n.createdBy}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setViewNotice(n);
                    handleMarkAsRead(n.id);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Read Full
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteNotice(n.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Read Notice Modal */}
      {viewNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <PriorityBadge priority={viewNotice.priority} />
              <button
                onClick={() => setViewNotice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{viewNotice.title}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 border-y border-slate-100 py-2">
              <span>Date: {viewNotice.date}</span>
              <span>Audience: {viewNotice.audience}</span>
              <span>By: {viewNotice.createdBy}</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{viewNotice.content}</p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewNotice(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Notice Modal (Admin Only) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Publish Society Notice</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  placeholder="e.g. Lift Maintenance & Shutdown Notice"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Priority</label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm"
                  >
                    <option value="NORMAL">General Notice</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Audience</label>
                  <select
                    value={newNotice.audience}
                    onChange={(e) => setNewNotice({ ...newNotice, audience: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm"
                  >
                    <option value="All Residents">All Residents</option>
                    <option value="Owners Only">Flat Owners Only</option>
                    <option value="Tenants Only">Tenants Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notice Content *</label>
                <textarea
                  rows={4}
                  required
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  placeholder="Type official notice announcement message..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold"
                >
                  Cancel
                </button>
                <Button type="submit">Publish Circular</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
