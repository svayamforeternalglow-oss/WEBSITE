'use client';

import { useEffect, useState, useCallback } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useAuthStore } from '@/lib/auth';
import { useToastStore } from '@/lib/toast';
import { api } from '@/lib/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

interface RevenuePoint { _id: string; revenue: number; orders: number }
interface OrderStatusPoint { _id: string; count: number }
interface PaymentPoint { _id: string; completed: number; failed: number; pending: number }

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  processing: '#6366F1',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
  expired: '#9CA3AF',
};

export default function AdminDashboardPage() {
  const token = useAuthStore((s) => s.token);
  const addToast = useToastStore((s) => s.addToast);

  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStatusPoint[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [revRes, ordRes, payRes] = await Promise.all([
        api.get<{ data: RevenuePoint[] }>('/admin/stats/revenue?period=daily', token),
        api.get<{ data: OrderStatusPoint[] }>('/admin/stats/orders', token),
        api.get<{ data: PaymentPoint[] }>('/admin/stats/payments?period=daily', token),
      ]);
      setRevenue(revRes.data);
      setOrderStats(ordRes.data);
      setPaymentStats(payRes.data);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, addToast]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const totalRevenue = revenue.reduce((s, r) => s + r.revenue, 0);
  const totalOrders = orderStats.reduce((s, o) => s + o.count, 0);

  const revenueChartData = {
    labels: revenue.map((r) => r._id.slice(5)),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: revenue.map((r) => r.revenue),
        borderColor: '#C2A25D',
        backgroundColor: 'rgba(194, 162, 93, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#C2A25D',
      },
    ],
  };

  const orderChartData = {
    labels: orderStats.map((o) => o._id.charAt(0).toUpperCase() + o._id.slice(1)),
    datasets: [
      {
        data: orderStats.map((o) => o.count),
        backgroundColor: orderStats.map((o) => STATUS_COLORS[o._id] || '#9CA3AF'),
        borderWidth: 0,
      },
    ],
  };

  const paymentChartData = {
    labels: paymentStats.map((p) => p._id.slice(5)),
    datasets: [
      { label: 'Completed', data: paymentStats.map((p) => p.completed), backgroundColor: '#10B981' },
      { label: 'Failed', data: paymentStats.map((p) => p.failed), backgroundColor: '#EF4444' },
      { label: 'Pending', data: paymentStats.map((p) => p.pending), backgroundColor: '#F59E0B' },
    ],
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-white border border-neutral-300 animate-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Total Revenue</p>
          <p className="mt-1 font-heading text-3xl font-bold text-forest">₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Total Orders</p>
          <p className="mt-1 font-heading text-3xl font-bold text-forest">{totalOrders}</p>
        </div>
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Avg Order Value</p>
          <p className="mt-1 font-heading text-3xl font-bold text-forest">
            ₹{totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString('en-IN') : 0}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Completion Rate</p>
          <p className="mt-1 font-heading text-3xl font-bold text-green-600">
            {totalOrders > 0 ? Math.round(((orderStats.find((o) => o._id === 'delivered')?.count || 0) / totalOrders) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 rounded-xl border border-neutral-300 bg-white p-6">
          <h3 className="mb-4 font-heading text-lg font-bold text-forest">Revenue (Last 30 Days)</h3>
          <div className="h-64">
            <Line
              data={revenueChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, ticks: { callback: (v) => `₹${v}` } },
                  x: { ticks: { maxTicksLimit: 10 } },
                },
              }}
            />
          </div>
        </div>

        {/* Order Status Doughnut */}
        <div className="rounded-xl border border-neutral-300 bg-white p-6">
          <h3 className="mb-4 font-heading text-lg font-bold text-forest">Order Status</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={orderChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } } },
                cutout: '60%',
              }}
            />
          </div>
        </div>

        {/* Payment Stats */}
        <div className="xl:col-span-2 rounded-xl border border-neutral-300 bg-white p-6">
          <h3 className="mb-4 font-heading text-lg font-bold text-forest">Payment Success/Failure</h3>
          <div className="h-64">
            <Bar
              data={paymentChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { boxWidth: 12 } } },
                scales: {
                  x: { stacked: true, ticks: { maxTicksLimit: 10 } },
                  y: { stacked: true, beginAtZero: true },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
