"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ShoppingBasket, Plus, Minus,
  Trash2, ChevronRight, ShoppingBag, Tag, Truck,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartSubtotal,
  selectDeliveryFee,
  selectFinalTotal,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
} from "@/redux/cartSlice"; // ✅ fixed import path

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyCart = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-[2rem] p-14 text-center shadow-sm border border-dashed border-gray-200 flex flex-col items-center gap-6"
  >
    <motion.div
      className="w-28 h-28 bg-green-50 rounded-full flex items-center justify-center"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <ShoppingBag size={52} className="text-green-300" />
    </motion.div>
    <div className="space-y-2">
      <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
      <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
        Looks like you haven&apos;t added any groceries yet. Let&apos;s fix that!
      </p>
    </div>
    <Link href="/">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-green-200 transition-colors"
      >
        Continue Shopping
        <ChevronRight size={20} />
      </motion.button>
    </Link>
  </motion.div>
);

// ─── Cart Item Row ────────────────────────────────────────────────────────────
const CartItem = ({ item }: { item: ReturnType<typeof selectCartItems>[number] }) => {
  const dispatch = useDispatch();
  const id = item._id?.toString() ?? item.name;
  const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, scale: 0.95 }}
      transition={{ type: "spring" as const, stiffness: 200, damping: 22 }}
      className="bg-white rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-100 transition-all duration-300 group"
    >
      {/* Image */}
      <div className="relative w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Info */}
      <div className="flex-1 text-center sm:text-left min-w-0">
        <div className="flex items-center gap-1.5 justify-center sm:justify-start mb-1">
          <Tag size={10} className="text-green-500 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 truncate">
            {item.category}
          </span>
        </div>
        <h3 className="text-base font-bold text-gray-800 leading-snug line-clamp-2">{item.name}</h3>
        <p className="text-gray-500 text-sm font-medium mt-0.5">
          Rs. {item.price}
          <span className="text-gray-400 font-normal"> / {item.unit}</span>
        </p>
      </div>

      {/* Quantity stepper */}
      <div className="flex items-center bg-gray-100 rounded-2xl p-1.5 border border-gray-200 shrink-0">
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => dispatch(decrementQuantity(id))}
          className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-600"
        >
          <Minus size={16} />
        </motion.button>
        <motion.span
          key={item.quantity}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-9 text-center font-bold text-base text-gray-800"
        >
          {item.quantity}
        </motion.span>
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => dispatch(incrementQuantity(id))}
          className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-green-600"
        >
          <Plus size={16} />
        </motion.button>
      </div>

      {/* Item total */}
      <div className="text-center sm:text-right shrink-0 min-w-[90px]">
        <p className="text-xs text-gray-400 font-medium mb-0.5">Total</p>
        <motion.p
          key={itemTotal}
          initial={{ scale: 1.15, color: "#22c55e" }}
          animate={{ scale: 1, color: "#111827" }}
          transition={{ duration: 0.3 }}
          className="text-xl font-black"
        >
          Rs. {itemTotal}
        </motion.p>
      </div>

      {/* Remove */}
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => dispatch(removeFromCart(id))}
        className="p-2.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all shrink-0"
        aria-label="Remove item"
      >
        <Trash2 size={20} />
      </motion.button>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const CartPage = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const deliveryFee = useSelector(selectDeliveryFee);
  const finalTotal = useSelector(selectFinalTotal);
  const freeDeliveryThreshold = 300;
  const remaining = freeDeliveryThreshold - subtotal;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/60 to-white pb-24 pt-8">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 120, damping: 16 }}
        >
          <Link href="/">
            <motion.button
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 text-gray-700 font-medium transition-all hover:border-green-200"
            >
              <ArrowLeft size={18} className="text-green-600" />
              <span className="hidden sm:block">Back</span>
            </motion.button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2.5 rounded-xl">
              <ShoppingBasket className="text-green-600" size={22} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Your Cart
              {items.length > 0 && (
                <span className="ml-2 text-lg font-semibold text-gray-400">
                  ({items.length} {items.length === 1 ? "item" : "items"})
                </span>
              )}
            </h1>
          </div>

          {/* Clear cart */}
          <AnimatePresence>
            {items.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dispatch(clearCart())}
                className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-all font-medium"
              >
                <Trash2 size={15} />
                <span className="hidden sm:block">Clear all</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Items list */}
          <div className="lg:col-span-8 space-y-3">
            <AnimatePresence mode="popLayout">
              {items.length > 0 ? (
                items.map((item) => <CartItem key={item._id?.toString() ?? item.name} item={item} />)
              ) : (
                <EmptyCart key="empty" />
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 sticky top-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: "spring" as const, stiffness: 120, damping: 16 }}
              className="bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative"
            >
              {/* BG glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 blur-3xl -mr-10 -mt-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl -ml-10 -mb-10 pointer-events-none" />

              <h2 className="text-xl font-bold mb-7 relative">Order Summary</h2>

              <div className="space-y-5 relative">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Subtotal</span>
                  <motion.span
                    key={subtotal}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white font-bold text-lg"
                  >
                    Rs. {subtotal.toFixed(0)}
                  </motion.span>
                </div>

                {/* Delivery */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Truck size={15} className="text-gray-500" />
                    <span className="text-gray-400 font-medium">Delivery</span>
                  </div>
                  <motion.span
                    key={deliveryFee}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`font-bold text-lg ${deliveryFee === 0 && subtotal > 0 ? "text-green-400" : "text-white"}`}
                  >
                    {subtotal === 0 ? "—" : deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}
                  </motion.span>
                </div>

                {/* Free delivery progress */}
                {subtotal > 0 && subtotal < freeDeliveryThreshold && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-white/5 rounded-2xl p-3.5 space-y-2"
                  >
                    <p className="text-xs text-gray-400 font-medium">
                      Add <span className="text-green-400 font-bold">Rs. {remaining.toFixed(0)}</span> more for free delivery
                    </p>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((subtotal / freeDeliveryThreshold) * 100, 100)}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                )}

                <div className="h-px bg-white/10" />

                {/* Total */}
                <div className="flex justify-between items-end pt-1">
                  <div>
                    <p className="text-gray-400 font-medium text-sm">Total</p>
                    <p className="text-xs text-green-400 mt-0.5">Inclusive of all taxes</p>
                  </div>
                  <motion.span
                    key={finalTotal}
                    initial={{ scale: 1.08, color: "#4ade80" }}
                    animate={{ scale: 1, color: "#ffffff" }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl font-black"
                  >
                    Rs. {finalTotal.toFixed(0)}
                  </motion.span>
                </div>

                {/* Checkout button */}
                <Link href={items.length > 0 ? "/user/checkout" : "#"}>
                  <motion.button
                    disabled={items.length === 0}
                    whileHover={items.length > 0 ? { scale: 1.02 } : {}}
                    whileTap={items.length > 0 ? { scale: 0.98 } : {}}
                    className={`w-full py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 mt-1 ${
                      items.length > 0
                        ? "bg-green-500 hover:bg-green-400 text-gray-950 shadow-xl shadow-green-500/20"
                        : "bg-gray-800 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    Proceed to Checkout
                    <ChevronRight size={20} />
                  </motion.button>
                </Link>

                {/* Continue shopping */}
                {items.length > 0 && (
                  <Link href="/">
                    <p className="text-center text-xs text-gray-500 hover:text-gray-300 transition-colors mt-1 cursor-pointer font-medium">
                      ← Continue Shopping
                    </p>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
