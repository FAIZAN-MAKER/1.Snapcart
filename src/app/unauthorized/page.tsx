"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldX, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

const AccessDenied = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <motion.div
        className="w-full max-w-md flex flex-col items-center text-center gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" as const, stiffness: 100, damping: 16 }}
      >
        {/* Icon */}
        <motion.div
          className="w-24 h-24 rounded-3xl bg-red-100 flex items-center justify-center"
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring" as const, stiffness: 150, damping: 14, delay: 0.1 }}
        >
          <ShieldX className="w-12 h-12 text-red-500" />
        </motion.div>

        {/* Text */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
            You don't have permission to view this page. Please contact an admin if you think this is a mistake.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/" className="flex-1">
            <motion.div
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-2xl shadow-md shadow-green-200 transition-colors"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
            >
              <Home className="w-4 h-4" />
              Go Home
            </motion.div>
          </Link>

          <motion.button
            onClick={() => window.history.back()}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3.5 rounded-2xl transition-colors"
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AccessDenied
