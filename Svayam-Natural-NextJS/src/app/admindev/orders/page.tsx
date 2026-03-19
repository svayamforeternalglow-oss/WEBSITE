'use client';

import { useState, useMemo } from 'react';
import { useToastStore } from '@/lib/toast';

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
  tracking?: { carrier?: string; trackingNumber?: string; trackingUrl?: string };
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

const MOCK_ORDERS: Order[] = [
  {
    _id: 'dev-o1',
    orderId: 'ORD-DEV-001',
    userId: { firstName: 'Dev', lastName: 'User', email: 'dev@example.com', phone: '9876543210' },
    items: [
      { name: 'Organic Honey 500g', quantity: 2, price: 450, sku: 'HNY-500' },
      { name: 'Cold Pressed Oil 1L', quantity: 1, price: 599, sku: 'OIL-1L' },
    ],
    pricing: { subtotal: 1499, shipping: 80, tax: 158, grandTotal: 1737 },
    shippingAddress: { firstName: 'Dev', lastName: 'User', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', phone: '9876543210' },
    payment: { method: 'razorpay', status: 'completed', razorpayPaymentId: 'pay_dev_1' },
    status: 'processing',
    createdAt: '2025-03-04T10:30:00.000Z',
  },
  {
    _id: 'dev-o2',
    orderId: 'ORD-DEV-002',
    userId: { firstName: 'Test', lastName: 'Guest', email: 'guest@test.com', phone: '9123456789' },
    items: [{ name: 'Ghee 1kg', quantity: 1, price: 899, sku: 'GHE-1K' }],
    pricing: { subtotal: 899, shipping: 80, tax: 98, grandTotal: 1077 },
    shippingAddress: { firstName: 'Test', lastName: 'Guest', city: 'Delhi', state: 'Delhi', pincode: '110001', phone: '9123456789' },
    payment: { method: 'razorpay', status: 'completed' },
    status: 'shipped',
    createdAt: '2025-03-03T14:00:00.000Z',
    tracking: { carrier: 'Shiprocket', trackingNumber: 'SR-DEV-123', trackingUrl: 'https://shiprocket.co/tracking/SR-DEV-123' },
  },
  {
    _id: 'dev-o3',
    orderId: 'ORD-DEV-003',
    userId: 'Guest',
    items: [
      { name: 'Turmeric Powder 200g', quantity: 3, price: 199, sku: 'TUR-200' },
    ],
    pricing: { subtotal: 597, shipping: 80, tax: 68, grandTotal: 745 },
    shippingAddress: { firstName: 'Guest', lastName: 'Buyer', city: 'Bangalore', state: 'Karnataka', pincode: '560001', phone: '9988776655' },
    payment: { method: 'razorpay', status: 'pending' },
    status: 'pending',
    createdAt: '2025-03-05T09:15:00.000Z',
  },
  {
    _id: 'dev-o4',
    orderId: 'ORD-DEV-004',
    userId: { firstName: 'Demo', lastName: 'User', email: 'demo@example.com' },
    items: [
      { name: 'Organic Honey 500g', quantity: 1, price: 450, sku: 'HNY-500' },
      { name: 'Ghee 1kg', quantity: 1, price: 899, sku: 'GHE-1K' },
    ],
    pricing: { subtotal: 1349, shipping: 80, tax: 143, grandTotal: 1572 },
    shippingAddress: { firstName: 'Demo', lastName: 'User', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', phone: '9876123456' },
    payment: { method: 'razorpay', status: 'completed' },
    status: 'delivered',
    createdAt: '2025-03-01T11:00:00.000Z',
  },
  {
    _id: 'dev-o5',
    orderId: 'ORD-DEV-005',
    userId: { firstName: 'Sample', lastName: 'Customer' },
    items: [{ name: 'Cold Pressed Oil 1L', quantity: 2, price: 599, sku: 'OIL-1L' }],
    pricing: { subtotal: 1198, shipping: 80, tax: 128, grandTotal: 1406 },
    shippingAddress: { firstName: 'Sample', lastName: 'Customer', city: 'Pune', state: 'Maharashtra', pincode: '411001', phone: '9765432109' },
    payment: { method: 'razorpay', status: 'completed' },
    status: 'processing',
    createdAt: '2025-03-05T08:00:00.000Z',
  },
];

const PAGE_SIZE = 20;

export default function AdminDevOrdersPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [orders, setOrders] = useState<Order[]>(() => [...MOCK_ORDERS]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().slice(0, 10));
  const [bulkInvoicesLoading, setBulkInvoicesLoading] = useState(false);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (statusFilter) list = list.filter((o) => o.status === statusFilter);
    if (dateFrom) list = list.filter((o) => o.createdAt >= `${dateFrom}T00:00:00.000Z`);
    if (dateTo) list = list.filter((o) => o.createdAt <= `${dateTo}T23:59:59.999Z`);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((o) => {
        const userName = typeof o.userId === 'object'
          ? `${o.userId.firstName || ''} ${o.userId.lastName || ''} ${o.userId.email || ''}`
          : '';
        return o.orderId.toLowerCase().includes(s) || userName.toLowerCase().includes(s);
      });
    }
    return list;
  }, [orders, statusFilter, dateFrom, dateTo, search]);

  const total = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginatedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
    setSelectedOrder((prev) => (prev && prev._id === orderId ? { ...prev, status: newStatus } : prev));
    addToast('Updated (dev only)', 'success');
  };

  const simulateCreateShipment = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId
          ? { ...o, status: 'shipped' as const, tracking: { carrier: 'Shiprocket', trackingNumber: 'SR-DEV-123', trackingUrl: 'https://shiprocket.co/tracking/SR-DEV-123' } }
          : o
      )
    );
    setSelectedOrder(null);
    addToast('Simulated: Shipment created (dev only)', 'success');
  };

  const simulateRefund = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: 'cancelled' as const } : o))
    );
    setSelectedOrder(null);
    addToast('Simulated: Refund processed (dev only)', 'success');
  };

  const simulateDownloadInvoice = () => {
    addToast('Simulated: Invoice download (dev only)', 'success');
  };

  const simulateBulkInvoices = () => {
    setBulkInvoicesLoading(true);
    setTimeout(() => {
      setBulkInvoicesLoading(false);
      addToast('Simulated: Bulk invoices downloaded (dev only)', 'success');
    }, 500);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
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
            onClick={simulateBulkInvoices}
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
      </div>

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
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-clay">
                  No orders found
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => {
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
                    <td className="px-5 py-4 text-clay">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
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
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedOrder.payment.status === 'completed' && !selectedOrder.tracking?.trackingNumber && (
                  <button
                    onClick={() => simulateCreateShipment(selectedOrder._id)}
                    className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-sand hover:bg-forest-dark"
                  >
                    Create Shipment
                  </button>
                )}
                {selectedOrder.tracking?.trackingNumber && (
                  <span className="rounded-lg bg-neutral-200 px-4 py-2 text-sm text-clay">Already shipped</span>
                )}
                {selectedOrder.payment.status === 'completed' && selectedOrder.status !== 'cancelled' && (
                  <button
                    onClick={() => window.confirm('Process full refund? (dev only)') && simulateRefund(selectedOrder._id)}
                    className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                  >
                    Refund
                  </button>
                )}
                <button
                  onClick={simulateDownloadInvoice}
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
