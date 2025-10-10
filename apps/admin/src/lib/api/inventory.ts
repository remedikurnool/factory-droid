import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Types
export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  reorderQuantity: number;
  unit: string;
  location: string;
  expiryDate?: string;
  batchNumber?: string;
  costPrice: number;
  sellingPrice: number;
  supplier?: Supplier;
  supplierId?: string;
  lastRestocked?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gst?: string;
  rating?: number;
  productsSupplied: number;
  totalOrders: number;
  activeOrders: number;
  isActive: boolean;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier?: Supplier;
  orderDate: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  notes?: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface StockMovement {
  id: string;
  type: 'in' | 'out' | 'adjustment';
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  referenceNumber?: string;
  performedBy: string;
  createdAt: string;
}

export interface InventoryStats {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringSoon: number;
  totalValue: number;
  totalSuppliers: number;
}

export interface InventoryFilters {
  search?: string;
  status?: string;
  location?: string;
  supplierId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// API Client
export const inventoryApi = {
  // Inventory items
  getItems: async (filters: InventoryFilters = {}) => {
    const response = await axios.get(`${API_URL}/admin/inventory`, { params: filters });
    return response.data;
  },

  getItemById: async (id: string): Promise<InventoryItem> => {
    const response = await axios.get(`${API_URL}/admin/inventory/${id}`);
    return response.data;
  },

  createItem: async (data: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await axios.post(`${API_URL}/admin/inventory`, data);
    return response.data;
  },

  updateItem: async (id: string, data: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await axios.patch(`${API_URL}/admin/inventory/${id}`, data);
    return response.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/admin/inventory/${id}`);
  },

  adjustStock: async (id: string, quantity: number, reason: string): Promise<InventoryItem> => {
    const response = await axios.post(`${API_URL}/admin/inventory/${id}/adjust`, {
      quantity,
      reason
    });
    return response.data;
  },

  getLowStockItems: async () => {
    const response = await axios.get(`${API_URL}/admin/inventory/low-stock`);
    return response.data;
  },

  getExpiringItems: async (days: number = 30) => {
    const response = await axios.get(`${API_URL}/admin/inventory/expiring`, {
      params: { days }
    });
    return response.data;
  },

  // Suppliers
  getSuppliers: async (filters: any = {}) => {
    const response = await axios.get(`${API_URL}/admin/suppliers`, { params: filters });
    return response.data;
  },

  getSupplierById: async (id: string): Promise<Supplier> => {
    const response = await axios.get(`${API_URL}/admin/suppliers/${id}`);
    return response.data;
  },

  createSupplier: async (data: Partial<Supplier>): Promise<Supplier> => {
    const response = await axios.post(`${API_URL}/admin/suppliers`, data);
    return response.data;
  },

  updateSupplier: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    const response = await axios.patch(`${API_URL}/admin/suppliers/${id}`, data);
    return response.data;
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/admin/suppliers/${id}`);
  },

  // Purchase Orders
  getPurchaseOrders: async (filters: any = {}) => {
    const response = await axios.get(`${API_URL}/admin/purchase-orders`, { params: filters });
    return response.data;
  },

  getPurchaseOrderById: async (id: string): Promise<PurchaseOrder> => {
    const response = await axios.get(`${API_URL}/admin/purchase-orders/${id}`);
    return response.data;
  },

  createPurchaseOrder: async (data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await axios.post(`${API_URL}/admin/purchase-orders`, data);
    return response.data;
  },

  updatePurchaseOrder: async (id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await axios.patch(`${API_URL}/admin/purchase-orders/${id}`, data);
    return response.data;
  },

  sendPurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    const response = await axios.post(`${API_URL}/admin/purchase-orders/${id}/send`);
    return response.data;
  },

  receivePurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    const response = await axios.post(`${API_URL}/admin/purchase-orders/${id}/receive`);
    return response.data;
  },

  cancelPurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    const response = await axios.post(`${API_URL}/admin/purchase-orders/${id}/cancel`);
    return response.data;
  },

  // Stock Movements
  getStockMovements: async (filters: any = {}) => {
    const response = await axios.get(`${API_URL}/admin/stock-movements`, { params: filters });
    return response.data;
  },

  createStockMovement: async (data: Partial<StockMovement>): Promise<StockMovement> => {
    const response = await axios.post(`${API_URL}/admin/stock-movements`, data);
    return response.data;
  },

  // Statistics
  getStats: async (): Promise<InventoryStats> => {
    const response = await axios.get(`${API_URL}/admin/inventory/stats`);
    return response.data;
  },

  // Export
  exportInventory: async (format: 'csv' | 'excel' = 'csv') => {
    const response = await axios.get(`${API_URL}/admin/inventory/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }
};
