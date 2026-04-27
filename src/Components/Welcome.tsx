"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ShoppingBasket, Bike, Clock, Shield } from 'lucide-react'

const features = [
  { icon: Clock, text: "10-min delivery" },
  { icon: Shield, text: "100% fresh guarantee" },
  { icon: Bike, text: "Live order tracking" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 16 } },
}

const Welcome = ({ nextStep }: { nextStep: (step: number) => void }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <motion.div
        className="w-full max-w-md flex flex-col items-center gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-3xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
            <ShoppingBasket className="text-white w-10 h-10" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-green-700 tracking-tight">SnapCart</h1>
            <p className="text-green-500 text-sm font-medium mt-1 tracking-wide uppercase">
              Groceries at your door
            </p>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800 leading-snug">
            Fresh groceries,{" "}
            <span className="text-green-500">delivered in 10 minutes</span>
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
            Skip the store. We pick, pack, and deliver everything you need — fast.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full">
          {features.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 bg-white/70 backdrop-blur-sm border border-green-100 rounded-2xl px-4 py-3 shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-gray-700 text-sm font-medium">{text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants} className="w-full">
          <motion.button
            onClick={() => nextStep(2)}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-md shadow-green-200 transition-colors duration-200"
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        <motion.p variants={itemVariants} className="text-gray-400 text-xs text-center">
          By continuing, you agree to our{" "}
          <span className="text-green-500 cursor-pointer hover:underline">Terms</span> &{" "}
          <span className="text-green-500 cursor-pointer hover:underline">Privacy Policy</span>
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Welcome
