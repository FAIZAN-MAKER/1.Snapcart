"use client"

import { Leaf, Smartphone, Truck, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const slides = [
  {
    id: 1,
    icon: <Leaf className="w-20 h-20 sm:w-28 sm:h-28 text-green-400 drop-shadow-lg" />,
    title: "Fresh Organic Groceries",
    emoji: "🥦",
    subtitle: "Farm-fresh fruits, vegetables, and daily essentials delivered straight to your door.",
    btnText: "Shop Now",
    bg: "/fruit-vegetable.jpg",
    accent: "from-green-600/80 to-green-900/60",
    dot: "bg-green-400",
  },
  {
    id: 2,
    icon: <Truck className="w-20 h-20 sm:w-28 sm:h-28 text-yellow-400 drop-shadow-lg" />,
    title: "Fast & Reliable Delivery",
    emoji: "🚚",
    subtitle: "We ensure your groceries reach your doorstep in under 10 minutes.",
    btnText: "Order Now",
    bg: "/fast-delivery.jpg",
    accent: "from-yellow-600/80 to-yellow-900/60",
    dot: "bg-yellow-400",
  },
  {
    id: 3,
    icon: <Smartphone className="w-20 h-20 sm:w-28 sm:h-28 text-blue-400 drop-shadow-lg" />,
    title: "Shop Anytime, Anywhere",
    emoji: "📱",
    subtitle: "Easy and seamless online grocery shopping — on any device, any time.",
    btnText: "Get Started",
    bg: "/grocery.jpg",
    accent: "from-blue-600/80 to-blue-900/60",
    dot: "bg-blue-400",
  },
]

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1)
  const isHovered = useRef(false) // ✅ ref = no re-renders on hover

  const goTo = (index: number, dir: number) => {
    setDirection(dir)
    setCurrentSlide(index)
  }

  const next = () => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prev = () => {
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  // ✅ Stable interval with empty deps — checks ref to skip when hovered
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovered.current) {
        setDirection(1)
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const slide = slides[currentSlide]

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  }

  return (
    <section
      className="relative w-full h-[480px] sm:h-[560px] overflow-hidden"
      onMouseEnter={() => { isHovered.current = true }}
      onMouseLeave={() => { isHovered.current = false }}
    >
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring" as const, stiffness: 80, damping: 20 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.bg})` }} />
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          <div className="relative h-full flex flex-col items-center justify-center text-center px-6 gap-5">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring" as const, stiffness: 180, damping: 14, delay: 0.15 }}
            >
              {slide.icon}
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-5xl font-bold text-white leading-tight max-w-2xl"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {slide.title} <span>{slide.emoji}</span>
            </motion.h1>

            <motion.p
              className="text-white/80 text-sm sm:text-base max-w-md leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {slide.subtitle}
            </motion.p>

            <motion.button
              className="flex items-center gap-2 bg-white text-green-700 font-semibold px-6 py-3 rounded-2xl shadow-lg hover:bg-green-50 transition-colors"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              {slide.btnText}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {slides.map((s, i) => (
          <motion.button
            key={s.id}
            onClick={() => goTo(i, i > currentSlide ? 1 : -1)}
            className={`rounded-full transition-all duration-300 ${
              i === currentSlide ? `w-6 h-2.5 ${s.dot}` : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
            }`}
            whileTap={{ scale: 0.85 }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/10 z-10">
        <motion.div
          key={currentSlide}
          className="h-full bg-white/60"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
        />
      </div>
    </section>
  )
}

export default HeroSection
