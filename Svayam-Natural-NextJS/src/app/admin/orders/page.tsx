'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useToastStore } from '@/lib/toast';
import { api } from '@/lib/api';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  sku: string;
}

interface Order {
  _id: string;
  orderId: string;
  userId: { firstName?: string; lastName?: string; email?: string; phone?: string } | string;
  items: OrderItem[];
  pricing: { subtotal: number; shipping: number; tax: number; grandTotal: number };
  shippingAddress: { firstName: string; lastName: string; city: string; state: string; pincode: string; phone: string };
  payment: { method: string; status: string; razorpayPaymentId?: string };
  status: string;
  createdAt: string;
  estimatedDelivery?: string | null;
  tracking?: { carrier?: string; trackingNumber?: string; trackingUrl?: string };
}

interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: 'text-amber-600',
  completed: 'text-green-600',
  failed: 'text-red-600',
  refunded: 'text-blue-600',
};

export default function AdminOrdersPage() {
  const token = useAuthStore((s) => s.token);
  const addToast = useToastStore((s) => s.addToast);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [creatingShipment, setCreatingShipment] = useState<string | null>(null);
  const [refunding, setRefunding] = useState<string | null>(null);
  const [bulkInvoicesLoading, setBulkInvoicesLoading] = useState(false);
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().slice(0, 10));

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const { data } = await api.get<OrdersResponse>(`/orders/admin/all?${params}`, token);
      setOrders(data.orders);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, dateFrom, dateTo, addToast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    if (!token) return;
    setUpdatingStatus(orderId);
    try {
      await api.patch(`/orders/admin/${orderId}/status`, { status: newStatus }, token);
      addToast(`Order updated to ${newStatus}`, 'success');
      fetchOrders();
      if (selectedOrder?._id === orderId) setSelectedOrder(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const createShipment = async (orderId: string) => {
    if (!token) return;
    setCreatingShipment(orderId);
    try {
      await api.post(`/shipping/create/${orderId}`, {}, token);
      addToast('Shipment created successfully', 'success');
      fetchOrders();
      if (selectedOrder?._id === orderId) setSelectedOrder(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to create shipment', 'error');
    } finally {
      setCreatingShipment(null);
    }
  };

  const refundOrder = async (orderId: string, amount?: number, reason?: string) => {
    if (!token) return;
    setRefunding(orderId);
    try {
      await api.post(`/orders/admin/${orderId}/refund`, { amount, reason }, token);
      addToast('Refund processed successfully', 'success');
      fetchOrders();
      if (selectedOrder?._id === orderId) setSelectedOrder(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to process refund', 'error');
    } finally {
      setRefunding(null);
    }
  };

  /** Trigger download via form POST so it's a direct user gesture (avoids browser blocking) */
  const triggerInvoiceDownload = (orderId: string) => {
    if (!token) return;
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/download-invoice';
    form.target = '_blank';
    form.style.display = 'none';
    const orderInput = document.createElement('input');
    orderInput.name = 'orderId';
    orderInput.value = orderId;
    const tokenInput = document.createElement('input');
    tokenInput.name = 'token';
    tokenInput.value = token;
    form.appendChild(orderInput);
    form.appendChild(tokenInput);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    addToast('Invoice downloaded', 'success');
  };

  /** Trigger bulk download via form POST so it's a direct user gesture */
  const bulkShipInvoices = () => {
    if (!token) return;
    setBulkInvoicesLoading(true);
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/download-bulk-invoices';
    form.target = '_blank';
    form.style.display = 'none';
    const dateInput = document.createElement('input');
    dateInput.name = 'date';
    dateInput.value = bulkDate;
    const tokenInput = document.createElement('input');
    tokenInput.name = 'token';
    tokenInput.value = token;
    form.appendChild(dateInput);
    form.appendChild(tokenInput);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    addToast('Shipping invoices downloaded', 'success');
    fetchOrders();
    setBulkInvoicesLoading(false);
  };

  const filteredOrders = search
    ? orders.filter((o) => {
        const s = search.toLowerCase();
        const userName = typeof o.userId === 'object'
          ? `${o.userId.firstName || ''} ${o.userId.lastName || ''} ${o.userId.email || ''}`
          : '';
        return o.orderId.toLowerCase().includes(s) || userName.toLowerCase().includes(s);
      })
    : orders;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Total Orders</p>
          <p className="mt-1 font-heading text-3xl font-bold text-forest">{total}</p>
        </div>
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Pending</p>
          <p className="mt-1 font-heading text-3xl font-bold text-amber-600">
            {orders.filter((o) => o.status === 'pending').length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Processing</p>
          <p className="mt-1 font-heading text-3xl font-bold text-blue-600">
            {orders.filter((o) => o.status === 'processing').length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Delivered</p>
          <p className="mt-1 font-heading text-3xl font-bold text-green-600">
            {orders.filter((o) => o.status === 'delivered').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold"
        >
          <option value="">All Statuses</option>
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={bulkDate}
            onChange={(e) => setBulkDate(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
          <button
            onClick={bulkShipInvoices}
            disabled={bulkInvoicesLoading}
            className="rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-sand transition-colors hover:bg-forest-dark disabled:opacity-50"
          >
            {bulkInvoicesLoading ? 'Generating…' : 'Generate shipping invoices & mark Shipped'}
          </button>
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
        <span className="text-sm text-clay">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
        <button
          onClick={() => {
            if (!token) return;
            const params = new URLSearchParams();
            if (dateFrom) params.set('dateFrom', dateFrom);
            if (dateTo) params.set('dateTo', dateTo);
            if (statusFilter) params.set('status', statusFilter);
            const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.svayamnatural.com/api/v1'}/admin/export/phones?${params}`;
            const a = document.createElement('a');
            a.href = url;
            a.download = 'customer-phones.csv';
            // Need to fetch with auth header
            fetch(url, { headers: { Authorization: `Bearer ${token}` } })
              .then(r => r.blob())
              .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                a.href = blobUrl;
                a.click();
                URL.revokeObjectURL(blobUrl);
                addToast('Phone export downloaded', 'success');
              })
              .catch(() => addToast('Failed to export phones', 'error'));
          }}
          className="rounded-lg border border-gold bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-dark transition-colors hover:bg-gold/20"
        >
          📱 Export Phones
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-300 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-300 bg-forest text-sand">
              <th className="px-5 py-3.5 font-medium">Order ID</th>
              <th className="px-5 py-3.5 font-medium">Customer</th>
              <th className="px-5 py-3.5 font-medium">Items</th>
              <th className="px-5 py-3.5 font-medium">Total</th>
              <th className="px-5 py-3.5 font-medium">Payment</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium">Date</th>
              <th className="px-5 py-3.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-neutral-200">
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 w-20 rounded bg-neutral-200 animate-shimmer" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-clay">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const customer = typeof order.userId === 'object' && order.userId
                  ? `${order.userId.firstName || ''} ${order.userId.lastName || ''}`
                  : 'Guest';

                return (
                  <tr key={order._id} className="border-b border-neutral-200 transition-colors hover:bg-neutral-100/50">
                    <td className="px-5 py-4">
                      <button onClick={() => setSelectedOrder(order)} className="font-medium text-forest hover:text-gold-dark">
                        {order.orderId.slice(-10)}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-clay">{customer.trim() || 'Guest'}</td>
                    <td className="px-5 py-4 text-clay">{order.items.length} item{order.items.length > 1 ? 's' : ''}</td>
                    <td className="px-5 py-4 font-semibold text-forest">₹{order.pricing.grandTotal}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold ${PAYMENT_COLORS[order.payment.status] || 'text-clay'}`}>
                        {order.payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-clay">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-4">
                      <select
                        value=""
                        disabled={updatingStatus === order._id}
                        onChange={(e) => { if (e.target.value) updateStatus(order._id, e.target.value); }}
                        className="rounded border border-neutral-300 px-2 py-1 text-xs outline-none focus:border-gold"
                      >
                        <option value="">Update</option>
                        {['processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-clay">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-forest disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-forest disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 z-50 bg-forest/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-300 px-6 py-4">
              <h2 className="font-heading text-lg font-bold text-forest">Order #{selectedOrder.orderId.slice(-10)}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-xl text-clay hover:text-forest">×</button>
            </div>
            <div className="space-y-6 p-6">
              <div>
                <p className="text-xs font-semibold uppercase text-clay">Status</p>
                <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[selectedOrder.status]}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-clay">Shipping</p>
                <p className="mt-1 text-sm text-forest">
                  {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                </p>
                <p className="text-sm text-clay">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} — {selectedOrder.shippingAddress.pincode}
                </p>
                <p className="text-sm text-clay">{selectedOrder.shippingAddress.phone}</p>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-clay">Items</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between border-b border-neutral-200 py-2 text-sm">
                    <span className="text-forest">{item.name} ×{item.quantity} {item.sku ? `(${item.sku})` : ''}</span>
                    <span className="font-semibold text-forest">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-clay"><span>Subtotal</span><span>₹{selectedOrder.pricing.subtotal}</span></div>
                  <div className="flex justify-between text-clay"><span>Shipping</span><span>₹{selectedOrder.pricing.shipping}</span></div>
                  <div className="flex justify-between text-clay"><span>Tax</span><span>₹{selectedOrder.pricing.tax}</span></div>
                  <div className="flex justify-between font-bold text-forest"><span>Grand Total</span><span>₹{selectedOrder.pricing.grandTotal}</span></div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-clay">Payment</p>
                <p className="mt-1 text-sm text-forest">
                  {selectedOrder.payment.method} — <span className={PAYMENT_COLORS[selectedOrder.payment.status]}>{selectedOrder.payment.status}</span>
                </p>
                {selectedOrder.payment.razorpayPaymentId && (
                  <p className="text-xs text-clay">ID: {selectedOrder.payment.razorpayPaymentId}</p>
                )}
              </div>
              {selectedOrder.tracking?.trackingNumber && (
                <div>
                  <p className="text-xs font-semibold uppercase text-clay">Tracking</p>
                  <p className="mt-1 text-sm text-forest">
                    {selectedOrder.tracking.carrier || 'Courier'} — {selectedOrder.tracking.trackingNumber}
                  </p>
                  {selectedOrder.tracking.trackingUrl && (
                    <a
                      href={selectedOrder.tracking.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-sm font-medium text-gold hover:text-gold-dark"
                    >
                      Track shipment →
                    </a>
                  )}
                </div>
              )}
              {/* Estimated Delivery Date */}
              <div>
                <p className="text-xs font-semibold uppercase text-clay">Estimated Delivery</p>
                {selectedOrder.estimatedDelivery ? (
                  <p className="mt-1 text-sm font-medium text-forest">
                    📅 {new Date(selectedOrder.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-clay">Not set</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="date"
                    id="est-delivery-date"
                    defaultValue={selectedOrder.estimatedDelivery ? new Date(selectedOrder.estimatedDelivery).toISOString().slice(0, 10) : ''}
                    min={new Date().toISOString().slice(0, 10)}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-forest outline-none focus:border-gold"
                  />
                  <button
                    onClick={async () => {
                      const dateInput = document.getElementById('est-delivery-date') as HTMLInputElement;
                      if (!dateInput?.value) return;
                      try {
                        await api.patch(`/orders/admin/${selectedOrder._id}/status`, { estimatedDelivery: dateInput.value }, token || undefined);
                        addToast('Delivery date updated!', 'success');
                        fetchOrders();
                        setSelectedOrder({ ...selectedOrder, estimatedDelivery: dateInput.value });
                      } catch (err) {
                        addToast('Failed to update delivery date', 'error');
                      }
                    }}
                    className="rounded-lg bg-gold px-3 py-1.5 text-sm font-semibold text-forest hover:bg-gold-dark"
                  >
                    Set Date
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedOrder.payment.status === 'completed' && !selectedOrder.tracking?.trackingNumber && (
                  <button
                    onClick={() => createShipment(selectedOrder._id)}
                    disabled={creatingShipment === selectedOrder._id}
                    className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-sand hover:bg-forest-dark disabled:opacity-50"
                  >
                    {creatingShipment === selectedOrder._id ? 'Creating…' : 'Create Shipment'}
                  </button>
                )}
                {selectedOrder.tracking?.trackingNumber && (
                  <span className="rounded-lg bg-neutral-200 px-4 py-2 text-sm text-clay">Already shipped</span>
                )}
                {selectedOrder.payment.status === 'completed' && selectedOrder.status !== 'cancelled' && (
                  <button
                    onClick={() => window.confirm('Process full refund for this order?') && refundOrder(selectedOrder._id)}
                    disabled={refunding === selectedOrder._id}
                    className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    {refunding === selectedOrder._id ? 'Processing…' : 'Refund'}
                  </button>
                )}
                <button
                  onClick={() => triggerInvoiceDownload(selectedOrder._id)}
                  className="rounded-lg border border-forest/30 px-4 py-2 text-sm font-semibold text-forest hover:bg-forest/5"
                >
                  Download Invoice
                </button>
              </div>
              <p className="text-xs text-clay">Created: {formatDate(selectedOrder.createdAt)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
