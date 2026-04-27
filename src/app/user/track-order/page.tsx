"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Navigation, Loader2, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const TrackOrderMap = dynamic(() => import("./TrackOrderMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  ),
});

interface OrderData {
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

// ✅ Inner component uses useSearchParams — must be inside Suspense
function TrackOrderContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/user/orders/${orderId}`);
        if (!res.ok) throw new Error("Order not found");
        const data = await res.json();
        setOrderData({
          destination: {
            latitude: data.address.latitude,
            longitude: data.address.longitude,
            address: `${data.address.fullAddress}, ${data.address.city}`,
          },
        });
      } catch (err) {
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50/60 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50/60 to-white flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-500 font-medium mb-4">{error || "Order not found"}</p>
          <Link
            href="/user/my-orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/60 to-white pb-20 pt-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/user/my-orders">
            <button className="flex items-center gap-2 bg-white border border-gray-200 hover:border-green-300 px-4 py-2.5 rounded-2xl text-gray-700 font-medium text-sm transition-colors shadow-sm">
              <ArrowLeft className="w-4 h-4 text-green-600" />
              Back
            </button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Track Order</h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                #{orderId?.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
        </motion.div>

        <TrackOrderMap orderId={orderId!} destination={orderData.destination} />

        <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-start gap-3">
            <Home className="w-5 h-5 text-emerald-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Delivery Address</p>
              <p className="text-xs text-gray-500 mt-1">
                {orderData.destination.address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Outer default export wraps everything in Suspense
export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-green-50/60 to-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}