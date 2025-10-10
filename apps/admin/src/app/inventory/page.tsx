'use client';

import { useState, useEffect } from 'react';
import { inventoryApi, InventoryItem, InventoryStats } from '@/lib/api/inventory';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown,
  Calendar,
  DollarSign,
  Truck,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

export default function InventoryManagementPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadInventory();
    loadStats();
  }, [searchQuery, statusFilter, currentPage]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const filters: any = {
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      const data = await inventoryApi.getItems(filters);
      setItems(data.items || data);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await inventoryApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleAdjustStock = async (id: string) => {
    const quantity = prompt('Enter adjustment quantity (use negative for decrease):');
    if (!quantity) return;
    
    const reason = prompt('Enter reason for adjustment:');
    if (!reason) return;

    try {
      await inventoryApi.adjustStock(id, parseInt(quantity), reason);
      loadInventory();
    } catch (err) {
      console.error('Error adjusting stock:', err);
      alert('Failed to adjust stock');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    
    try {
      await inventoryApi.deleteItem(id);
      loadInventory();
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await inventoryApi.exportInventory('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting:', err);
      alert('Failed to export inventory');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any }> = {
      in_stock: { color: 'bg-green-100 text-green-800', icon: Package },
      low_stock: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      out_of_stock: { color: 'bg-red-100 text-red-800', icon: TrendingDown },
      expired: { color: 'bg-gray-100 text-gray-800', icon: Calendar }
    };
    const badge = badges[status] || badges.in_stock;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Track stock levels, suppliers, and purchase orders</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Purchase Orders
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Item
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
                <Package className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
                </div>
                <Calendar className="h-10 w-10 text-orange-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">₹{stats.totalValue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-600" />
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
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="expired">Expired</option>
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

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No inventory items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Cost/Sell Price</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        {item.batchNumber && (
                          <p className="text-sm text-gray-600">Batch: {item.batchNumber}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.sku}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.quantity} {item.unit}</p>
                        <p className="text-xs text-gray-600">Reorder: {item.reorderLevel}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.location}</td>
                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-gray-600">Cost: ₹{item.costPrice}</p>
                        <p className="font-medium text-gray-900">Sell: ₹{item.sellingPrice}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAdjustStock(item.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Adjust Stock"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
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
