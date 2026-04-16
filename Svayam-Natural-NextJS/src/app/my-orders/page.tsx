'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { useToastStore } from '@/lib/toast';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  createdAt: string;
  totalAmount: number;
  isPaid: boolean;
  trackingStatus: string;
  lifecycleStatus?: string;
  orderItems: OrderItem[];
}

export default function MyOrdersPage() {
  const { isAuthenticated, token } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await api.get<Order[]>('/orders/myorders', token);
        setOrders(data);
      } catch (err) {
        addToast(err instanceof Error ? err.message : 'Failed to load orders', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, token, addToast]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 pt-28">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-neutral-100 pt-28 text-center px-6">
        <h1 className="mb-4 font-heading text-3xl font-bold text-forest">Please Sign In</h1>
        <p className="mb-8 text-clay">You need to be signed in to view your orders.</p>
        <Link href="/login" className="rounded-lg bg-gold px-8 py-3 font-semibold text-forest transition-colors hover:bg-gold-dark">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 pb-24 pt-28">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <h1 className="mb-8 font-heading text-3xl font-bold text-forest md:text-4xl">My Orders</h1>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-neutral-300 bg-white p-12 text-center">
            <h2 className="mb-3 font-heading text-xl font-bold text-forest">No orders yet</h2>
            <p className="mb-6 text-clay">Looks like you have not placed any orders with us.</p>
            <Link href="/products" className="rounded-lg bg-forest px-6 py-3 font-semibold text-sand transition-colors hover:bg-forest-dark">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const displayStatus = order.lifecycleStatus || order.trackingStatus || 'Processing';
              return (
              <div key={order._id} className="overflow-hidden rounded-2xl border border-neutral-300 bg-white">
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 bg-neutral-50 p-6">
                  <div>
                    <p className="text-sm font-semibold text-clay uppercase">Order Placed</p>
                    <p className="font-medium text-forest">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-clay uppercase">Total</p>
                    <p className="font-medium text-forest">₹{order.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-clay uppercase">Order #</p>
                    <p className="font-medium text-forest">{order._id.slice(-10)}</p>
                  </div>
                  <Link 
                    href={`/track-order?id=${order._id}`} 
                    className="rounded-lg border border-gold px-4 py-2 text-sm font-semibold text-gold-dark transition-colors hover:bg-gold/10"
                  >
                    Track Order
                  </Link>
                </div>

                {/* Order Status */}
                <div className="border-b border-neutral-200 px-6 py-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    displayStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 
                    displayStatus === 'Cancelled' || displayStatus === 'Refunded' ? 'bg-red-100 text-red-800' : 
                    'bg-gold/20 text-gold-dark'
                  }`}>
                    {displayStatus}
                  </span>
                </div>

                {/* Order Items */}
                <div className="divide-y divide-neutral-100 p-6">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-6 py-4 first:pt-0 last:pb-0">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-20 w-20 rounded-lg object-cover border border-neutral-200" 
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-bold text-forest">{item.name}</h3>
                        <p className="text-sm text-clay">Qty: {item.qty} × ₹{item.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-forest">₹{item.price * item.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
