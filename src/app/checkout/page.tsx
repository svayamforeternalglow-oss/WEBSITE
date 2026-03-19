'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart';
import { useAuthStore } from '@/lib/auth';
import { useToastStore } from '@/lib/toast';
import { api } from '@/lib/api';
import { openRazorpayCheckout } from '@/lib/razorpay';

const STEPS = ['Shipping', 'Review', 'Payment'] as const;

interface ShippingForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const INITIAL_SHIPPING: ShippingForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

interface OrderResponse {
  success: boolean;
  data: {
    orderId: string;
    orderNumber: string;
    razorpayOrderId: string;
    amount: number;
    razorpayKeyId: string;
  };
}

interface VerifyResponse {
  success: boolean;
  data: {
    orderId: string;
    orderNumber: string;
    status: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const { items, getSubtotal, getShipping, getTax, getTotal, clearCart } = useCartStore();
  const { addToast } = useToastStore();

  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState<ShippingForm>(INITIAL_SHIPPING);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ShippingForm>>({});

  if (items.length === 0) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-neutral-100 pt-28 pb-24">
        <div className="text-center">
          <h1 className="mb-2 font-heading text-3xl font-bold text-forest">No items to checkout</h1>
          <p className="mb-8 text-clay">Add some products to your cart first.</p>
          <Link
            href="/products"
            className="inline-block rounded-full bg-gold px-8 py-3.5 font-semibold text-forest hover:bg-gold-dark"
          >
            Browse Products
          </Link>
        </div>
      </section>
    );
  }

  const validateShipping = (): boolean => {
    const errs: Partial<ShippingForm> = {};
    if (!shipping.fullName.trim()) errs.fullName = 'Name is required';
    if (!shipping.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email))
      errs.email = 'Valid email is required';
    if (!shipping.phone.trim() || !/^[6-9]\d{9}$/.test(shipping.phone))
      errs.phone = 'Valid 10-digit phone number required';
    if (!shipping.address.trim()) errs.address = 'Address is required';
    if (!shipping.city.trim()) errs.city = 'City is required';
    if (!shipping.state.trim()) errs.state = 'State is required';
    if (!shipping.pincode.trim() || !/^[1-9][0-9]{5}$/.test(shipping.pincode))
      errs.pincode = 'Valid 6-digit pincode required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleShippingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep(1);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        orderItems: items.map((i) => ({ 
          product: i.productId,
          productId: i.productId,
          slug: i.slug,
          qty: i.quantity,
          quantity: i.quantity 
        })),
        shippingAddress: {
          fullName: shipping.fullName,
          email: shipping.email,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          pincode: shipping.pincode,
        },
        paymentMethod: 'Razorpay',
        totalAmount: getTotal()
      };

      // If authenticated, use private endpoint, otherwise use guest endpoint
      const endpoint = isAuthenticated ? '/orders' : '/orders/guest/create';
      const response = await api.post<any>(endpoint, isAuthenticated ? orderData : { items: orderData.orderItems.map(i => ({ ...i, slug: items.find(ci => ci.productId === i.productId)?.slug })), shippingAddress: orderData.shippingAddress }, token || undefined);
      
      const data = response.data || response;

      await openRazorpayCheckout({
        orderId: data.orderNumber || data._id,
        razorpayOrderId: data.razorpayOrderId || (data.paymentStatus && data.paymentStatus.razorpayOrderId),
        amount: data.amount || data.totalAmount,
        razorpayKeyId: data.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SSZQo0ldhC6rPT',
        customerName: shipping.fullName,
        customerEmail: shipping.email,
        customerPhone: shipping.phone,
        onSuccess: async (razorpayResponse) => {
          try {
            const verifyEndpoint = isAuthenticated ? '/orders/verify-payment' : '/orders/guest/verify-payment';
            await api.post<any>(verifyEndpoint, {
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpaySignature: razorpayResponse.razorpay_signature,
            }, token || undefined);

            clearCart();
            addToast('Payment successful! Order confirmed.', 'success');
            router.push(`/order-success?order=${data.orderNumber || data._id}`);
          } catch (err) {
            console.error("Verification error:", err);
            addToast('Payment verification failed. Contact support if charged.', 'error', 8000);
          }
          setLoading(false);
        },
        onDismiss: () => {
          addToast('Payment cancelled. Your order is saved for 30 minutes.', 'warning');
          setLoading(false);
        },
      });
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to create order', 'error');
      setLoading(false);
    }
  };

  const subtotal = getSubtotal();
  const shippingCost = getShipping();
  const tax = getTax();
  const total = getTotal();

  return (
    <section className="bg-neutral-100 pt-28 pb-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Step Indicator */}
        <div className="mb-12 flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  i <= step
                    ? 'bg-gold text-forest'
                    : 'bg-neutral-300 text-clay'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </button>
              <span className={`text-sm font-medium ${i <= step ? 'text-forest' : 'text-clay'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 h-[2px] w-10 rounded ${i < step ? 'bg-gold' : 'bg-neutral-300'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Step 0: Shipping */}
            {step === 0 && (
              <form onSubmit={handleShippingSubmit} className="rounded-2xl border border-neutral-300 bg-white p-6 md:p-8">
                <h2 className="mb-6 font-heading text-2xl font-bold text-forest">Shipping Address</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {([
                    { key: 'fullName', label: 'Full Name', type: 'text', span: 2 },
                    { key: 'email', label: 'Email', type: 'email', span: 1 },
                    { key: 'phone', label: 'Phone', type: 'tel', span: 1 },
                    { key: 'address', label: 'Address', type: 'text', span: 2 },
                    { key: 'city', label: 'City', type: 'text', span: 1 },
                    { key: 'state', label: 'State', type: 'text', span: 1 },
                    { key: 'pincode', label: 'Pincode', type: 'text', span: 1 },
                  ] as const).map((field) => (
                    <div key={field.key} className={field.span === 2 ? 'md:col-span-2' : ''}>
                      <label className="mb-1 block text-sm font-medium text-forest">{field.label}</label>
                      <input
                        type={field.type}
                        value={shipping[field.key]}
                        onChange={(e) => setShipping({ ...shipping, [field.key]: e.target.value })}
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-forest outline-none transition-colors focus:border-gold ${
                          errors[field.key] ? 'border-red-400' : 'border-neutral-300'
                        }`}
                      />
                      {errors[field.key] && (
                        <p className="mt-1 text-xs text-red-500">{errors[field.key]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  className="mt-6 w-full rounded-full bg-gold py-3.5 font-semibold text-forest transition-colors hover:bg-gold-dark"
                >
                  Continue to Review
                </button>
              </form>
            )}

            {/* Step 1: Review */}
            {step === 1 && (
              <div className="rounded-2xl border border-neutral-300 bg-white p-6 md:p-8">
                <h2 className="mb-6 font-heading text-2xl font-bold text-forest">Review Order</h2>

                <div className="mb-6 rounded-xl border border-neutral-300 bg-neutral-100 p-4">
                  <h3 className="mb-2 text-sm font-bold text-forest">Shipping To</h3>
                  <p className="text-sm text-clay">{shipping.fullName}</p>
                  <p className="text-sm text-clay">{shipping.address}, {shipping.city}</p>
                  <p className="text-sm text-clay">{shipping.state} — {shipping.pincode}</p>
                  <p className="text-sm text-clay">{shipping.phone} · {shipping.email}</p>
                  <button onClick={() => setStep(0)} className="mt-2 text-xs font-semibold text-gold-dark hover:text-gold">
                    Edit Address
                  </button>
                </div>

                <h3 className="mb-3 text-sm font-bold text-forest">Items ({items.length})</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.slug} className="flex gap-3 rounded-lg border border-neutral-300 p-3">
                      <div className="relative h-16 w-16 shrink-0 rounded-lg bg-neutral-200">
                        <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain p-1" />
                      </div>
                      <div className="flex flex-1 items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-forest">{item.name}</p>
                          <p className="text-xs text-clay">Qty: {item.quantity} · {item.weight}</p>
                        </div>
                        <p className="text-sm font-bold text-forest">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="mt-6 w-full rounded-full bg-gold py-3.5 font-semibold text-forest transition-colors hover:bg-gold-dark"
                >
                  Proceed to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="rounded-2xl border border-neutral-300 bg-white p-6 md:p-8">
                <h2 className="mb-4 font-heading text-2xl font-bold text-forest">Payment</h2>
                <p className="mb-6 text-sm text-clay">
                  You will be redirected to Razorpay&apos;s secure payment gateway. We support UPI, Credit/Debit cards, Net Banking, and Wallets.
                </p>

                <div className="mb-6 flex items-center gap-2 rounded-xl border border-sage/40 bg-sage/10 px-4 py-3">
                  <span className="text-lg">🔒</span>
                  <p className="text-xs text-forest">Your payment is secured by Razorpay with PCI DSS Level 1 compliance.</p>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full rounded-full bg-gold py-4 text-lg font-bold text-forest transition-colors hover:bg-gold-dark disabled:cursor-wait disabled:opacity-60"
                >
                  {loading ? 'Processing...' : `Pay ₹${total}`}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 rounded-2xl border border-neutral-300 bg-white p-6">
              <h2 className="mb-4 font-heading text-lg font-bold text-forest">Order Summary</h2>
              <div className="space-y-2 border-b border-neutral-300 pb-4 text-sm">
                <div className="flex justify-between text-clay">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-clay">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? 'text-green-700 font-medium' : ''}>
                    {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between text-clay">
                  <span>Tax (18% GST)</span>
                  <span>₹{tax}</span>
                </div>
              </div>
              <div className="flex justify-between pt-4 text-lg font-bold text-forest">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
