"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, MapPin, Clock, CheckCircle, XCircle,
  Loader2, RefreshCw, Phone, CheckCircle2, Map,
  ChevronDown, AlertCircle,
} from "lucide-react";
import axios from "axios";
import { getSocket } from "@/lib/socket";
import dynamic from "next/dynamic";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  grocery: string;
  quantity: number;
  name: string;
  price: string;
  image: string;
  unit: string;
}

interface OrderAddress {
  fullName: string;
  mobile: string;
  city: string;
  state: string;
  pinCode: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
}

interface Order {
  _id: string;
  user: { name: string; email: string } | string;
  items: OrderItem[];
  totalAmount: string;
  paymentMethod: "cod" | "online";
  isPaid: boolean;
  address: OrderAddress;
  status: string;
  createdAt: string;
}

type NotificationType = "success" | "error" | "info";

interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

interface DeliveryBoyProps {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

// ─── Dynamic import ───────────────────────────────────────────────────────────

const DeliveryMap = dynamic(() => import("./DeliveryMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
    </div>
  ),
});

// ─── Constants & helpers ──────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5000;

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function itemSubtotal(item: OrderItem): number {
  return Number(item.price) * item.quantity;
}

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 140, damping: 18 } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function NotificationToast({ notification }: { notification: Notification }) {
  const styles: Record<NotificationType, string> = {
    success: "bg-emerald-500 text-white",
    error: "bg-rose-500 text-white",
    info: "bg-sky-500 text-white",
  };
  const icons: Record<NotificationType, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4 shrink-0" />,
    error: <XCircle className="w-4 h-4 shrink-0" />,
    info: <AlertCircle className="w-4 h-4 shrink-0" />,
  };

  return (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, y: -24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      transition={{ type: "spring" as const, stiffness: 200, damping: 20 }}
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold ${styles[notification.type]}`}
    >
      {icons[notification.type]}
      {notification.message}
    </motion.div>
  );
}

interface OrderCardProps {
  order: Order;
  isAccepted: boolean;
  isExpanded: boolean;
  actionLoading: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

function OrderCard({
  order,
  isAccepted,
  isExpanded,
  actionLoading,
  onAccept,
  onReject,
  onToggleExpand,
}: OrderCardProps) {
  const firstItem = order.items[0];
  const extraCount = order.items.length - 1;

  return (
    <motion.article
      variants={fadeUp}
      layout
      className={`bg-white rounded-3xl shadow-md border overflow-hidden transition-shadow hover:shadow-lg ${
        isAccepted ? "border-emerald-300 ring-2 ring-emerald-100" : "border-gray-100"
      }`}
    >
      {/* ── Header ── */}
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold font-mono">
                #{order._id.slice(-6).toUpperCase()}
              </span>
              {isAccepted && (
                <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Accepted
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {formatDate(order.createdAt)}
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              order.paymentMethod === "cod"
                ? "bg-amber-100 text-amber-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}
          </span>
        </div>

        {/* ── Item preview ── */}
        {firstItem && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
            <img
              src={firstItem.image}
              alt={firstItem.name}
              className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate text-sm">{firstItem.name}</p>
              {extraCount > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  +{extraCount} more item{extraCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
            <p className="text-base font-bold text-gray-900 shrink-0">
              Rs.&nbsp;{order.totalAmount}
            </p>
          </div>
        )}

        {/* ── Address ── */}
        <div className="flex items-start gap-2.5 p-3 bg-emerald-50/70 rounded-2xl">
          <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm">{order.address.fullName}</p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{order.address.fullAddress}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {order.address.city}, {order.address.state} {order.address.pinCode}
            </p>
          </div>
        </div>

        {/* ── Actions ── */}
        {!isAccepted && (
          <div className="flex gap-3">
            <ActionButton
              onClick={() => onReject(order._id)}
              loading={actionLoading}
              variant="reject"
              label="Reject"
              icon={<XCircle className="w-4 h-4" />}
            />
            <ActionButton
              onClick={() => onAccept(order._id)}
              loading={actionLoading}
              variant="accept"
              label="Accept"
              icon={<CheckCircle className="w-4 h-4" />}
            />
          </div>
        )}
      </div>

      {/* ── Expand toggle ── */}
      <button
        onClick={() => onToggleExpand(order._id)}
        aria-expanded={isExpanded}
        className="w-full py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-1.5 text-sm text-gray-500 font-medium hover:bg-gray-100 transition-colors"
      >
        {isExpanded ? "Hide Details" : "View Details"}
        <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      {/* ── Expanded details ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-4">
              {/* Contact */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="font-semibold text-gray-900">{order.address.fullName}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{order.address.mobile}</p>
                </div>
              </div>

              {/* All items */}
              <div className="flex flex-col gap-2">
                {order.items.map((item, idx) => (
                  <div
                    key={`${item.grocery}-${idx}`}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.quantity} × Rs. {item.price} / {item.unit}
                      </p>
                    </div>
                    <p className="font-bold text-gray-800 text-sm shrink-0">
                      Rs. {itemSubtotal(item)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  loading: boolean;
  variant: "accept" | "reject";
  label: string;
  icon: React.ReactNode;
}

function ActionButton({ onClick, loading, variant, label, icon }: ActionButtonProps) {
  const base = "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all disabled:opacity-50";
  const styles = {
    accept: "bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95",
    reject: "bg-red-50 border-2 border-red-200 text-red-600 hover:bg-red-100 active:scale-95",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${base} ${styles[variant]}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-emerald-400" />
      </div>
      <p className="font-semibold text-gray-600">No orders available</p>
      <p className="text-sm text-gray-400 mt-1">Pull to refresh or check back soon</p>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DeliveryBoy({ user }: DeliveryBoyProps) {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]);
  const [hasActiveDelivery, setHasActiveDelivery] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const notifCounterRef = useRef(0);

  // ── Data fetching ──

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await axios.get<Order[]>("/api/delivery-boy/orders");
      const hasAccepted = data.some((o) => o.status === "accepted");
      setAvailableOrders(
        hasAccepted ? [] : data.filter((o) => o.status === "out for delivery")
      );
      setAcceptedOrders(data.filter((o) => o.status === "accepted"));
      setHasActiveDelivery(hasAccepted);
    } catch (err) {
      console.error("[DeliveryBoy] fetchOrders failed:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
  const socket = getSocket();
  if (!socket) return;
  
  socket.emit("join-delivery-room");
  socket.on("order-status-changed", fetchOrders);
  return () => {
    socket.off("order-status-changed", fetchOrders);
  };
}, [fetchOrders]);

  // ── Notifications ──

  const showNotification = useCallback((type: NotificationType, message: string) => {
    const id = ++notifCounterRef.current;
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  // ── Handlers ──

  const handleAccept = async (orderId: string) => {
    if (hasActiveDelivery) {
      showNotification("error", "Complete your current delivery first!");
      return;
    }
    try {
      setActionLoadingId(orderId);
      await axios.post(`/api/delivery-boy/orders/${orderId}/accept`);
      showNotification("success", "Order accepted! Start your delivery.");
      await fetchOrders();
    } catch (err: any) {
      showNotification("error", err?.response?.data?.message ?? "Failed to accept order");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      await axios.post(`/api/delivery-boy/orders/${orderId}/reject`);
      showNotification("info", "Order rejected");
      await fetchOrders();
    } catch {
      showNotification("error", "Failed to reject order");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOrders();
  };

  const handleToggleExpand = (id: string) =>
    setExpandedOrderId((prev) => (prev === id ? null : id));

  const handleDelivered = useCallback(async () => {
    showNotification("success", "🎉 Order delivered successfully!");
    await fetchOrders();
  }, [fetchOrders, showNotification]);

  // ── Loading screen ──

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Loading deliveries…</p>
      </div>
    );
  }

  const activeOrder = acceptedOrders[0] ?? null;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* ── Notifications ── */}
      <AnimatePresence>
        {notifications.map((n) => (
          <NotificationToast key={n.id} notification={n} />
        ))}
      </AnimatePresence>

      <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">

        {/* ── Hero header ── */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200 p-3">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {availableOrders.length} available · {acceptedOrders.length} accepted
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh orders"
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </motion.div>

        {/* ── Active delivery map ── */}
        {activeOrder && (
          <motion.section variants={fadeUp} className="bg-white rounded-3xl shadow-xl border-2 border-emerald-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-gray-800 text-sm">Active Delivery</h2>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full font-mono">
                #{activeOrder._id.slice(-6).toUpperCase()}
              </span>
            </div>

            <DeliveryMap
              orderId={activeOrder._id}
              destination={{
                latitude: activeOrder.address.latitude,
                longitude: activeOrder.address.longitude,
                address: `${activeOrder.address.fullAddress}, ${activeOrder.address.city}`,
              }}
              isPaid={activeOrder.isPaid}
              onDelivered={handleDelivered}
            />

            <div className="px-5 py-4 bg-gray-50 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {activeOrder.address.fullName}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{activeOrder.address.fullAddress}</p>
              </div>
              <p className="text-lg font-bold text-emerald-600 shrink-0">
                Rs. {activeOrder.totalAmount}
              </p>
            </div>
          </motion.section>
        )}

        {/* ── Accepted orders list ── */}
        {acceptedOrders.length > 0 && (
          <motion.section variants={fadeUp}>
            <SectionHeading
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              title="Accepted Orders"
              count={acceptedOrders.length}
            />
            <motion.div variants={stagger} className="flex flex-col gap-4 mt-3">
              {acceptedOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  isAccepted
                  isExpanded={expandedOrderId === order._id}
                  actionLoading={actionLoadingId === order._id}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onToggleExpand={handleToggleExpand}
                />
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* ── Available orders list ── */}
        <motion.section variants={fadeUp}>
          <SectionHeading
            title="Available Orders"
            count={availableOrders.length}
          />
          <motion.div variants={stagger} className="flex flex-col gap-4 mt-3">
            {availableOrders.length === 0 ? (
              <EmptyState />
            ) : (
              availableOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  isAccepted={false}
                  isExpanded={expandedOrderId === order._id}
                  actionLoading={actionLoadingId === order._id}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onToggleExpand={handleToggleExpand}
                />
              ))
            )}
          </motion.div>
        </motion.section>
      </motion.div>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  count,
}: {
  icon?: React.ReactNode;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="font-bold text-gray-800">{title}</h2>
      <span className="ml-auto text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
        {count}
      </span>
    </div>
  );
}