'use client';

import { useState, useEffect } from 'react';
import { financeApi, Transaction, FinancialStats } from '@/lib/api/finance';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  RefreshCw,
  Download,
  Search,
  Filter
} from 'lucide-react';

export default function FinanceManagementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadTransactions();
    loadStats();
  }, [searchQuery, typeFilter, statusFilter, currentPage]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const filters: any = {
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      const data = await financeApi.getTransactions(filters);
      setTransactions(data.transactions || data);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await financeApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await financeApi.exportTransactions('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting:', err);
      alert('Failed to export transactions');
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      payment: 'bg-green-100 text-green-800',
      refund: 'bg-red-100 text-red-800',
      payout: 'bg-blue-100 text-blue-800',
      adjustment: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
        <p className="text-gray-600 mt-1">Monitor payments, refunds, and financial transactions</p>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Month Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">₹{stats.monthRevenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-600">₹{stats.pendingPayments.toLocaleString()}</p>
                </div>
                <CreditCard className="h-10 w-10 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Refunds Issued</p>
                  <p className="text-2xl font-bold text-red-600">₹{stats.refundsIssued.toLocaleString()}</p>
                </div>
                <RefreshCw className="h-10 w-10 text-red-600" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="payment">Payments</option>
            <option value="refund">Refunds</option>
            <option value="payout">Payouts</option>
            <option value="adjustment">Adjustments</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Order</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Payment Method</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                      {txn.transactionId || txn.id.substring(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(txn.type)}`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {txn.orderNumber || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {txn.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(txn.status)}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
