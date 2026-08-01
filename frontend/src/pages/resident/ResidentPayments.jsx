import React, { useState } from 'react';
import { CreditCard, Download, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import Button from '../../components/Button.jsx';

const MOCK_RESIDENT_PAYMENTS = [
  { id: 'INV-2026-08', period: 'August 2026', amount: 3500, dueDate: '2026-08-10', status: 'PENDING', paidOn: null },
  { id: 'INV-2026-07', period: 'July 2026', amount: 3500, dueDate: '2026-07-10', status: 'PAID', paidOn: '2026-07-04' },
  { id: 'INV-2026-06', period: 'June 2026', amount: 3500, dueDate: '2026-06-10', status: 'PAID', paidOn: '2026-06-02' },
  { id: 'INV-2026-05', period: 'May 2026', amount: 3500, dueDate: '2026-05-10', status: 'PAID', paidOn: '2026-05-05' },
];

export default function ResidentPayments() {
  const [payments, setPayments] = useState(MOCK_RESIDENT_PAYMENTS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const currentDue = payments.find((p) => p.status === 'PENDING');

  const handlePayNow = (id) => {
    setIsProcessing(true);
    setTimeout(() => {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: 'PAID', paidOn: new Date().toISOString().split('T')[0] }
            : p
        )
      );
      setIsProcessing(false);
      setSuccessMessage('Payment successful! Official receipt generated.');
      setTimeout(() => setSuccessMessage(''), 4000);
    }, 1200);
  };

  const handleDownloadReceipt = (id) => {
    setSuccessMessage(`Receipt PDF for invoice ${id} downloaded.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Maintenance & Payments
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          View monthly maintenance bills, payment history, and download tax receipts.
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Current Outstanding Bill Card */}
      {currentDue ? (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold uppercase tracking-wider inline-block mb-3">
                Due Soon — {currentDue.period}
              </span>
              <p className="text-slate-300 text-xs uppercase tracking-wider font-semibold">Total Amount Due</p>
              <p className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-1">
                ₹{currentDue.amount.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Due Date: <span className="text-slate-200 font-semibold">{currentDue.dueDate}</span> (Flat A-101)
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
              <Button
                onClick={() => handlePayNow(currentDue.id)}
                disabled={isProcessing}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {isProcessing ? 'Processing Payment...' : 'Pay Bill Now'}
              </Button>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit SSL Secure Gateway</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-900">All Dues Cleared!</h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                You have no pending maintenance dues for your flat. Thank you!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Payment History & Receipts</h3>
          <p className="text-xs text-slate-500 mt-0.5">Past billing records and downloaded receipts</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Invoice ID</th>
                <th className="px-6 py-3.5">Billing Period</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Paid On</th>
                <th className="px-6 py-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-indigo-600">{p.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{p.period}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    {p.status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{p.paidOn || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    {p.status === 'PAID' ? (
                      <button
                        onClick={() => handleDownloadReceipt(p.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Receipt
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Available after payment</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
