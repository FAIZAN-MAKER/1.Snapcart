"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bike, User, UserCog, Phone, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios, { AxiosError } from 'axios'

// ─── Types ────────────────────────────────────────────────────────────────────
type RoleId = "admin" | "user" | "deliveryBoy"

interface RoleOption {
  label: string
  id: RoleId
  icon: React.ElementType
  description: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const roles: RoleOption[] = [
  {
    label: "Customer",
    id: "user",
    icon: User,
    description: "Browse and order groceries",
  },
  {
    label: "Delivery Boy",
    id: "deliveryBoy",
    icon: Bike,
    description: "Pick up and deliver orders",
  },
  {
    label: "Admin",
    id: "admin",
    icon: UserCog,
    description: "Manage the platform",
  },
]

// ─── Animation Variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 16 } },
}

// ─── Main Component ───────────────────────────────────────────────────────────
const EditRoleMobile = () => {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<RoleId | "">("")
  const [mobile, setMobile] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState(false)
  const [adminExists, setAdminExists] = useState(false)
  const [loadingAdmin, setLoadingAdmin] = useState(true)

  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const res = await axios.get("/api/admin/exists")
        setAdminExists(res.data.adminExists)
      } catch (err) {
        console.error("Error checking admin:", err)
      } finally {
        setLoadingAdmin(false)
      }
    }
    checkAdminExists()
  }, [])

  const availableRoles = roles.filter((role) => {
    if (role.id === "admin" && adminExists) return false
    return true
  })

  const isMobileValid = mobile.replace(/\D/g, "").length === 10
  const isFormValid = selectedRole !== "" && isMobileValid && !loadingAdmin

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, max 10
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
    setMobile(digits)
    if (serverError) setServerError("")
  }

  const handleSubmit = async () => {
    if (!isFormValid) return
    setServerError("")

    try {
      setIsLoading(true)
      await axios.post("/api/user/edit-role-mobile", {
        role: selectedRole,
        mobile,
      })
      setSuccess(true)
      setTimeout(() => router.push("/"), 1500)
    } catch (err) {
      const error = err as AxiosError<{ message: string }>
      setServerError(
        error.response?.data?.message ?? "Something went wrong. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <motion.div
          className="flex flex-col items-center gap-5 text-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring" as const, stiffness: 120, damping: 16 }}
        >
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All set!</h2>
            <p className="text-gray-500 text-sm mt-1">Taking you home…</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-14">
      <motion.div
        className="w-full max-w-md flex flex-col gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500 shadow-lg shadow-green-200 mb-4">
            <UserCog className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Almost there!</h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Tell us who you are and how to reach you.
          </p>
        </motion.div>

        {/* Role Selection */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
            Select your role
          </p>
          <div className="flex flex-col gap-3">
            {availableRoles.map((role) => {
              const isSelected = selectedRole === role.id
              return (
                <motion.button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-colors duration-200 ${
                    isSelected
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/40"
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${
                      isSelected ? "bg-green-500" : "bg-gray-100"
                    }`}
                  >
                    <role.icon
                      className={`w-5 h-5 transition-colors duration-200 ${
                        isSelected ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${isSelected ? "text-green-700" : "text-gray-800"}`}>
                      {role.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{role.description}</p>
                  </div>

                  {/* Selected indicator */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring" as const, stiffness: 200, damping: 15 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Mobile Number */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
            Mobile number
          </p>
          <div
            className={`flex items-center gap-3 bg-white border-2 rounded-2xl px-4 py-3.5 transition-colors duration-200 ${
              mobile.length > 0 && !isMobileValid
                ? "border-red-300"
                : mobile.length === 10
                ? "border-green-400"
                : "border-gray-200 focus-within:border-green-400"
            }`}
          >
            <Phone className={`w-4 h-4 shrink-0 ${isMobileValid ? "text-green-500" : "text-gray-400"}`} />
            <input
              type="tel"
              value={mobile}
              onChange={handleMobileChange}
              placeholder="10-digit mobile number"
              maxLength={10}
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-300 text-sm tracking-wider"
            />
            <span className={`text-xs font-medium tabular-nums ${mobile.length === 10 ? "text-green-500" : "text-gray-300"}`}>
              {mobile.length}/10
            </span>
          </div>
          <AnimatePresence>
            {mobile.length > 0 && !isMobileValid && (
              <motion.p
                className="text-red-500 text-xs pl-1"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                Please enter a valid 10-digit number.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Server Error */}
        <AnimatePresence>
          {serverError && (
            <motion.div
              className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {serverError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Button */}
        <motion.div variants={itemVariants}>
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-2xl transition-all duration-200 ${
              isFormValid
                ? "bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            whileTap={isFormValid ? { scale: 0.97 } : {}}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                Go to Home
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>

          {/* Helper hint */}
          <AnimatePresence>
            {!isFormValid && (
              <motion.p
                className="text-center text-xs text-gray-400 mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {!selectedRole
                  ? "Select a role to continue"
                  : "Enter your 10-digit mobile number"}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default EditRoleMobile
