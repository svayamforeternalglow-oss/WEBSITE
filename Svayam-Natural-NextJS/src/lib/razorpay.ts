'use client';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface CheckoutParams {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  razorpayKeyId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: RazorpayResponse) => void;
  onDismiss?: () => void;
}

export async function openRazorpayCheckout(params: CheckoutParams) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error('Failed to load Razorpay. Please check your internet connection.');
  }

  const options: RazorpayOptions = {
    key: params.razorpayKeyId,
    amount: params.amount,
    currency: 'INR',
    name: 'Svayam Natural',
    description: `Order #${params.orderId}`,
    order_id: params.razorpayOrderId,
    handler: params.onSuccess,
    prefill: {
      name: params.customerName,
      email: params.customerEmail,
      contact: params.customerPhone,
    },
    theme: { color: '#0F2E1F' },
    modal: { ondismiss: params.onDismiss },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
