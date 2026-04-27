"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import Link from 'next/link'

const ForgotPassword = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <motion.div
        className="w-full max-w-md flex flex-col items-center text-center gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" as const, stiffness: 100, damping: 16 }}
      >
        <motion.div
          className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" as const, stiffness: 150, damping: 14, delay: 0.1 }}
        >
          <Lock className="w-12 h-12 text-gray-400" />
        </motion.div>

        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Coming Soon</h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
            Password reset functionality will be available soon.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/login" className="flex-1">
            <motion.div
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 px-8 rounded-2xl shadow-md shadow-green-200 transition-colors"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
            >
              Back to Login
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword