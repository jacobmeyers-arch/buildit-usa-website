import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { createInvoice, fetchInvoices, getInvoicePdfUrl } from '../lib/api';

export default function InvoiceManager() {
  const { currentUser, setAppScreen } = useProject();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [dueDate, setDueDate] = useState('');

  // QR code modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (currentUser?.id) loadInvoices();
  }, [currentUser?.id]);

  async function loadInvoices() {
    try {
      setLoading(true);
      const data = await fetchInvoices(currentUser.id);
      setInvoices(data.invoices);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateInvoice(e) {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(amount);
    if (!description.trim() || isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a description and valid amount');
      return;
    }

    try {
      setCreating(true);
      const data = await createInvoice({
        userId: currentUser.id,
        description: description.trim(),
        amountDollars: amountNum,
        customerName: customerName.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        dueDate: dueDate || undefined,
      });

      setInvoices(prev => [data.invoice, ...prev]);
      setSelectedInvoice(data.invoice);
      setShowForm(false);
      setDescription('');
      setAmount('');
      setCustomerName('');
      setCustomerEmail('');
      setDueDate('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function formatCurrency(cents) {
    return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    paid: 'bg-green-500/20 text-green-300 border-green-500/40',
    cancelled: 'bg-red-500/20 text-red-300 border-red-500/40',
    expired: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
  };

  return (
    <div className="min-h-screen bg-workshop px-4 py-6 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAppScreen('dashboard')}
              className="text-parchment/60 hover:text-parchment text-sm"
            >
              &larr; Back
            </button>
            <h1 className="font-pencil-hand text-3xl text-parchment">Invoices</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-brass min-h-[44px] px-5 py-2 text-sm font-semibold"
          >
            {showForm ? 'Cancel' : '+ New Invoice'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-muted-red/20 border border-muted-red/40 rounded-lg p-3 text-sm text-parchment/80">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
          </div>
        )}

        {/* Create Invoice Form */}
        {showForm && (
          <form onSubmit={handleCreateInvoice} className="bg-iron/30 border border-iron/50 rounded-lg p-5 space-y-4">
            <h2 className="font-pencil-hand text-xl text-brass">Create Invoice</h2>

            <div>
              <label className="block text-parchment/70 text-xs font-semibold uppercase mb-1">
                Description *
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Kitchen remodel - Phase 1 deposit"
                className="w-full bg-workshop border border-iron/50 rounded px-3 py-2 text-parchment text-sm focus:border-brass focus:outline-none min-h-[44px]"
                required
              />
            </div>

            <div>
              <label className="block text-parchment/70 text-xs font-semibold uppercase mb-1">
                Amount (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="100000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-workshop border border-iron/50 rounded px-3 py-2 text-parchment text-sm focus:border-brass focus:outline-none min-h-[44px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-parchment/70 text-xs font-semibold uppercase mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full bg-workshop border border-iron/50 rounded px-3 py-2 text-parchment text-sm focus:border-brass focus:outline-none min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-parchment/70 text-xs font-semibold uppercase mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="john@email.com"
                  className="w-full bg-workshop border border-iron/50 rounded px-3 py-2 text-parchment text-sm focus:border-brass focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-parchment/70 text-xs font-semibold uppercase mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-workshop border border-iron/50 rounded px-3 py-2 text-parchment text-sm focus:border-brass focus:outline-none min-h-[44px]"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="btn-brass w-full min-h-[44px] py-2 text-base font-semibold disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Invoice & Generate QR Code'}
            </button>
          </form>
        )}

        {/* QR Code Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-workshop border border-brass/30 rounded-xl max-w-sm w-full p-6 space-y-4">
              <div className="text-center">
                <h2 className="font-pencil-hand text-2xl text-brass">
                  {selectedInvoice.invoiceNumber || selectedInvoice.invoice_number}
                </h2>
                <p className="text-parchment/60 text-sm mt-1">{selectedInvoice.description}</p>
                <p className="text-parchment text-2xl font-bold mt-2">
                  {formatCurrency(selectedInvoice.amountCents || selectedInvoice.amount_cents)}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <img
                  src={selectedInvoice.qrCodeDataUrl || selectedInvoice.qr_code_data_url}
                  alt="Payment QR Code"
                  className="w-56 h-56 rounded-lg"
                />
              </div>

              <p className="text-center text-parchment/50 text-xs">
                Scan with phone camera to pay via Apple Pay, Google Pay, or card
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={getInvoicePdfUrl(selectedInvoice.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-iron-light flex-1 min-h-[44px] py-2 text-sm text-center"
                >
                  Download PDF
                </a>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="btn-brass flex-1 min-h-[44px] py-2 text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-brass"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-parchment/50 text-sm">No invoices yet. Create your first one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map(inv => (
              <button
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className="w-full bg-iron/20 border border-iron/40 rounded-lg p-4 text-left hover:border-brass/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-parchment text-sm font-semibold truncate">
                        {inv.invoice_number}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[inv.status]}`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-parchment/60 text-xs mt-1 truncate">{inv.description}</p>
                    {inv.customer_name && (
                      <p className="text-parchment/40 text-xs mt-0.5">{inv.customer_name}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-parchment text-sm font-bold">{formatCurrency(inv.amount_cents)}</p>
                    <p className="text-parchment/40 text-xs">{formatDate(inv.created_at)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
