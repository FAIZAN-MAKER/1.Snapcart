"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShoppingBag, Sparkles, Star } from "lucide-react";
import Link from "next/link";

// ─── Floating star particle ───────────────────────────────────────────────────
const FloatingStar = ({ delay, x, size, duration, opacity, repeatDelay }: {
  delay: number; x: number; size: number; duration: number; opacity: number; repeatDelay: number;
}) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: `${x}%`, bottom: "-20px" }}
    initial={{ y: 0, opacity: 0, rotate: 0, scale: 0 }}
    animate={{
      y: [0, -120, -260, -400, -600],
      opacity: [0, opacity, opacity, opacity * 0.5, 0],
      rotate: [0, 45, 90, 180, 270],
      scale: [0, 1, 1, 0.8, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      repeatDelay,
      ease: "easeOut",
    }}
  >
    <Star
      fill="currentColor"
      className="text-yellow-400"
      style={{ width: size, height: size }}
    />
  </motion.div>
);

// ─── Confetti piece ───────────────────────────────────────────────────────────
const Confetti = ({ delay, x, color, rotate, moveX, duration }: { delay: number; x: number; color: string; rotate: number; moveX: number; duration: number }) => (
  <motion.div
    className="absolute pointer-events-none rounded-sm"
    style={{ left: `${x}%`, top: "-10px", width: 8, height: 12, background: color }}
    initial={{ y: -10, opacity: 1, rotate: 0, x: 0 }}
    animate={{
      y: ["0%", "110vh"],
      opacity: [1, 1, 0],
      rotate: [0, rotate],
      x: [0, moveX],
    }}
    transition={{ duration, delay, ease: "easeIn" }}
  />
);

// ─── Orbiting dot ─────────────────────────────────────────────────────────────
const OrbitDot = ({ angle, radius, color, duration }: {
  angle: number; radius: number; color: string; duration: number;
}) => (
  <motion.div
    className="absolute w-3 h-3 rounded-full pointer-events-none"
    style={{ background: color }}
    animate={{
      x: [
        Math.cos((angle * Math.PI) / 180) * radius,
        Math.cos(((angle + 360) * Math.PI) / 180) * radius,
      ],
      y: [
        Math.sin((angle * Math.PI) / 180) * radius,
        Math.sin(((angle + 360) * Math.PI) / 180) * radius,
      ],
    }}
    transition={{ duration, repeat: Infinity, ease: "linear" }}
  />
);

// ─── Pulse ring ───────────────────────────────────────────────────────────────
const PulseRing = ({ delay, scale }: { delay: number; scale: number }) => (
  <motion.div
    className="absolute inset-0 rounded-full border-2 border-green-400/40 pointer-events-none"
    initial={{ scale: 1, opacity: 0.8 }}
    animate={{ scale: scale, opacity: 0 }}
    transition={{ duration: 2, delay, repeat: Infinity, ease: "easeOut" }}
  />
);

// ─── Main Component ───────────────────────────────────────────────────────────
const OrderSuccessPage = () => {
  const [showContent, setShowContent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiColors = ["#22c55e", "#86efac", "#fbbf24", "#34d399", "#6ee7b7", "#ffffff", "#fde68a"];

  // Generate stable random values
  const stars = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 8 + Math.random() * 16,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 3,
      opacity: 0.4 + Math.random() * 0.6,
      repeatDelay: 1 + Math.random() * 2,
    }))
  );

  const confetti = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      rotate: 360 * (Math.random() > 0.5 ? 1 : -1) * 3,
      moveX: (Math.random() - 0.5) * 200,
      duration: 2.5 + Math.random() * 2,
    }))
  );

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 200);
    const t2 = setTimeout(() => setShowConfetti(true), 300);
    const t3 = setTimeout(() => setShowConfetti(false), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-950 overflow-hidden flex items-center justify-center px-4">

      {/* ── Animated background gradient ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(ellipse at 20% 50%, rgba(34,197,94,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(52,211,153,0.1) 0%, transparent 50%)",
            "radial-gradient(ellipse at 80% 50%, rgba(34,197,94,0.15) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(52,211,153,0.1) 0%, transparent 50%)",
            "radial-gradient(ellipse at 20% 50%, rgba(34,197,94,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(52,211,153,0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Grid pattern ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />

      {/* ── Floating stars (background) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.current.map((s) => (
          <FloatingStar key={s.id} x={s.x} size={s.size} delay={s.delay} duration={s.duration} opacity={s.opacity} repeatDelay={s.repeatDelay} />
        ))}
      </div>

      {/* ── Confetti burst (on load) ── */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.current.map((c) => (
              <Confetti key={c.id} x={c.x} delay={c.delay} color={c.color} rotate={c.rotate} moveX={c.moveX} duration={c.duration} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ── Glow orbs ── */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-green-500/5 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-emerald-400/5 blur-3xl pointer-events-none"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* ── Main content ── */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            className="relative z-10 flex flex-col items-center text-center max-w-md w-full gap-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring" as const, stiffness: 80, damping: 16 }}
          >

            {/* Check icon with orbiting dots + pulse rings */}
            <div className="relative flex items-center justify-center">
              {/* Pulse rings */}
              <div className="absolute w-36 h-36">
                <PulseRing delay={0} scale={2} />
                <PulseRing delay={0.6} scale={2.5} />
                <PulseRing delay={1.2} scale={3} />
              </div>

              {/* Orbiting dots */}
              <div className="absolute w-36 h-36 flex items-center justify-center">
                <OrbitDot angle={0} radius={70} color="#22c55e" duration={3} />
                <OrbitDot angle={120} radius={70} color="#fbbf24" duration={3} />
                <OrbitDot angle={240} radius={70} color="#86efac" duration={3} />
              </div>
              <div className="absolute w-36 h-36 flex items-center justify-center">
                <OrbitDot angle={60} radius={90} color="#34d399" duration={4.5} />
                <OrbitDot angle={200} radius={90} color="#fde68a" duration={4.5} />
              </div>

              {/* Main circle */}
              <motion.div
                className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/40"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring" as const, stiffness: 150, damping: 12, delay: 0.1 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" as const, stiffness: 200 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-white drop-shadow-lg" strokeWidth={2} />
                </motion.div>
              </motion.div>
            </div>

            {/* Text */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h1 className="text-4xl font-black text-white tracking-tight">Order Placed!</h1>
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-gray-400 text-base leading-relaxed max-w-xs mx-auto">
                Your groceries are being packed and will be at your door in no time!
              </p>
            </motion.div>

            {/* Info cards */}
            <motion.div
              className="w-full grid grid-cols-3 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {[
                { emoji: "📦", label: "Order", value: "Confirmed" },
                { emoji: "🚴", label: "Delivery", value: "~10 mins" },
                { emoji: "💵", label: "Payment", value: "On Delivery" },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-1 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 + i * 0.1, type: "spring" as const, stiffness: 120 }}
                  whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.08)" }}
                >
                  <span className="text-2xl">{card.emoji}</span>
                  <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">{card.label}</p>
                  <p className="text-white text-xs font-bold">{card.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Buttons */}
            <motion.div
              className="w-full flex flex-col gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              {/* My Orders */}
              <Link href="/user/my-orders" className="w-full">
                <motion.button
                  className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/10 text-gray-200 font-semibold py-4 rounded-2xl cursor-pointer text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  My Orders
                </motion.button>
              </Link>

              {/* Continue shopping */}
              <Link href="/" className="w-full">
                <motion.button
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-gray-950 font-bold py-4 rounded-2xl shadow-xl shadow-green-500/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Continue Shopping
                </motion.button>
              </Link>
            </motion.div>

            {/* Bottom sparkle text */}
            <motion.p
              className="text-gray-600 text-xs font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              ✨ Thank you for choosing SnapCart!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderSuccessPage;
