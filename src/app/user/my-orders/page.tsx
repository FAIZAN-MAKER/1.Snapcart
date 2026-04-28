"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Package, ShoppingBag, CreditCard,
  Banknote, Clock, Truck, CheckCircle2, ChevronDown, ChevronUp,
  Navigation,
} from "lucide-react";
import axios from "axios";
import { getSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  _id: string;
  name: string;
  price: string;
  image: string;
  unit: string;
  quantity: number;
}

interface OrderAddress {
  fullName: string;
  mobile: string;
  city: string;
  state: string;
  pinCode: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
}

interface Order {
  _id: string;
  orderId?: string;
  items: OrderItem[];
  totalAmount: string;
  paymentMethod: "cod" | "online";
  isPaid: boolean;
  address: OrderAddress;
  status: "pending" | "accepted" | "out for delivery" | "delivered";
  createdAt: string;
  updatedAt: string;
  assignedDeliveryBoy?: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    mobile?: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

const statusConfig = {
  pending: {
    label: "Pending",
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    bg: "bg-purple-100",
    text: "text-purple-700",
    dot: "bg-purple-500",
    icon: Truck,
  },
  "out for delivery": {
    label: "Out for Delivery",
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
    icon: CheckCircle2,
  },
};

// ─── Delivery Boy Badge ───────────────────────────────────────────────
const DeliveryBoyBadge = ({ deliveryBoy }: { deliveryBoy?: Order["assignedDeliveryBoy"] }) => {
  if (!deliveryBoy) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl"
    >
      {deliveryBoy.image ? (
        <img src={deliveryBoy.image} alt={deliveryBoy.name} className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
          <Truck className="w-4 h-4 text-purple-600" />
        </div>
      )}
      <div>
        <p className="text-xs font-semibold text-purple-700">Delivery Partner</p>
        <p className="text-xs text-purple-600">{deliveryBoy.name}</p>
      </div>
    </motion.div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: Order["status"] }) => {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order, index }: { order: Order; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const canTrack = order.status === "accepted" || order.status === "out for delivery";
  const hasAddressCoords = order.address.latitude && order.address.longitude;

  const handleTrackOrder = () => {
    router.push(`/user/track-order?orderId=${order._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-green-100 transition-all duration-300"
    >
      {/* Card header */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Order meta */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              #{order.orderId || order._id.slice(-8).toUpperCase()}
            </p>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          {/* Total */}
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400 font-medium mb-0.5">Total</p>
            <p className="text-2xl font-black text-gray-900">Rs. {order.totalAmount}</p>
          </div>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2 mb-4">
          <StatusBadge status={order.status} />

          <DeliveryBoyBadge deliveryBoy={order.assignedDeliveryBoy} />

          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
            order.isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}>
            <span className={`w-2 h-2 rounded-full ${order.isPaid ? "bg-green-500" : "bg-red-500"}`} />
            {order.isPaid ? "Paid" : "Unpaid"}
          </span>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            {order.paymentMethod === "cod"
              ? <><Banknote className="w-3.5 h-3.5" /> Cash on Delivery</>
              : <><CreditCard className="w-3.5 h-3.5" /> Online</>
            }
          </span>
        </div>

        {/* Track Order button */}
        {canTrack && hasAddressCoords && (
          <button
            onClick={handleTrackOrder}
            className="w-full flex items-center justify-center gap-2 mb-4 px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all"
          >
            <Navigation className="w-4 h-4" />
            Track Order
          </button>
        )}

        {/* Product thumbnails */}
        <div className="flex items-center gap-2 mb-4">
          {order.items.slice(0, 4).map((item, i) => (
            <motion.div
              key={item._id || i}
              className="relative w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0"
              whileHover={{ scale: 1.08, zIndex: 10 }}
            >
              <Image src={item.image} alt={item.name} fill className="object-contain p-1.5" />
            </motion.div>
          ))}
          {order.items.length > 4 && (
            <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-green-600">+{order.items.length - 4}</span>
            </div>
          )}
          <p className="text-sm text-gray-400 ml-1 font-medium">
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Address */}
        <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800">{order.address.fullName}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
              {order.address.fullAddress}, {order.address.city}, {order.address.state} — {order.address.pinCode}
            </p>
          </div>
        </div>

        {/* Expand toggle */}
        <motion.button
          onClick={() => setExpanded((p) => !p)}
          className="w-full flex items-center justify-center gap-2 mt-4 text-xs font-semibold text-gray-400 hover:text-green-600 transition-colors py-1"
          whileTap={{ scale: 0.97 }}
        >
          {expanded ? (
            <><ChevronUp className="w-4 h-4" /> Hide items</>
          ) : (
            <><ChevronDown className="w-4 h-4" /> View all items</>
          )}
        </motion.button>
      </div>

      {/* Expandable items list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring" as const, stiffness: 200, damping: 24 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="px-5 sm:px-6 py-4 space-y-2 bg-gray-50/50">
              {order.items.map((item, i) => (
                <motion.div
                  key={item._id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-100"
                >
                  <div className="relative w-11 h-11 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-1.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Rs. {item.price} / {item.unit} · ×{item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 shrink-0">
                    Rs. {(parseFloat(item.price) * item.quantity).toFixed(0)}
                  </p>
                </motion.div>
              ))}
              {/* Subtotal row */}
              <div className="flex justify-between items-center pt-2 px-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order Total</span>
                <span className="text-base font-black text-green-600">Rs. {order.totalAmount}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-gray-100 rounded-full" />
            <div className="h-4 w-28 bg-gray-100 rounded-full" />
          </div>
          <div className="h-8 w-24 bg-gray-100 rounded-xl" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-24 bg-gray-100 rounded-full" />
          <div className="h-7 w-16 bg-gray-100 rounded-full" />
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((j) => (
            <div key={j} className="w-12 h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="h-16 bg-gray-50 rounded-2xl" />
      </div>
    ))}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-20 flex flex-col items-center gap-5"
  >
    <motion.div
      className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <ShoppingBag className="w-12 h-12 text-green-300" />
    </motion.div>
    <div>
      <h2 className="text-2xl font-bold text-gray-800">No orders yet</h2>
      <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">
        Your order history will appear here once you place your first order.
      </p>
    </div>
    <Link href="/">
      <motion.button
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-green-200 transition-colors"
      >
        Start Shopping
      </motion.button>
    </Link>
  </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/user/my-orders");
        const data = res.data;
        if (Array.isArray(data)) setOrders(data);
        else if (data._id) setOrders([data]);
        else setOrders([]);
      } catch {
        setError("Failed to load orders. Please try again.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    const socket = getSocket();
    const isDev = process.env.NODE_ENV === "development";

    if (socket) {
      socket.on("order-status-changed", (data: { orderId: string; status: string }) => {
        if (isDev) console.log("Real-time order update:", data);
        fetchOrders();
      });
    }

    return () => {
      socket?.off("order-status-changed");
    };
  }, []); // <-- this was missing
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/60 to-white pb-20 pt-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 120, damping: 16 }}
        >
          <Link href="/">
            <motion.button
              whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-green-300 px-4 py-2.5 rounded-2xl text-gray-700 font-medium text-sm transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-green-600" />
              Back
            </motion.button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Orders</h1>
              {!loading && orders.length > 0 && (
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  {orders.length} order{orders.length !== 1 ? "s" : ""} placed
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <Skeleton key="skeleton" />
          ) : orders.length === 0 ? (
            <EmptyState key="empty" />
          ) : (
            <motion.div key="orders" className="space-y-4">
              {orders.map((order, i) => (
                <OrderCard key={order._id} order={order} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}