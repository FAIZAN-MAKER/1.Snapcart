"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, User, Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import axios, { AxiosError } from 'axios'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import Button from './ui/Button'

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."), // ✅ matches API
})

type RegisterFormData = z.infer<typeof registerSchema>
type FieldErrors = Partial<Record<keyof RegisterFormData, string>>

// ─── Field Component ─────────────────────────────────────────────────────────
const Field = ({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string
  icon: React.ElementType
  error?: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div
      className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-colors ${
        error ? "border-red-300 bg-red-50/30" : "border-gray-200 focus-within:border-green-400"
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${error ? "text-red-400" : "text-gray-400"}`} />
      {children}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          className="text-red-500 text-xs pl-1"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
const RegisterForm = ({ prevStep }: { prevStep: (step: number) => void }) => {
  const [form, setForm] = useState<RegisterFormData>({ name: "", email: "", password: "" })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")

    // ── Client-side validation ──
    const result = registerSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: FieldErrors = {}
result.error?.issues?.forEach((err) => {
        const field = err.path[0] as keyof RegisterFormData
        if (!fieldErrors[field]) fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    try {
      setIsLoading(true)
      await axios.post("/api/auth/register", result.data)
      setSuccess(true)
    } catch (err) {
      const error = err as AxiosError<{ message: string }>
      setServerError(error.response?.data?.message ?? "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 16 } },
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <motion.div
          className="w-full max-w-md text-center flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring" as const, stiffness: 120, damping: 16 }}
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <motion.svg
              className="w-10 h-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </motion.svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Account created!</h2>
            <p className="text-gray-500 text-sm mt-2">Welcome to SnapCart. You can now sign in.</p>
          </div>
          <Link
            href="/login"
            className="w-full block text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-2xl transition-colors"
          >
            Go to Sign In
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <motion.div
        className="w-full max-w-md flex flex-col gap-7"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Back button */}
        <motion.button
          variants={itemVariants}
          onClick={() => prevStep(1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors w-fit"
          whileTap={{ x: -3 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </motion.button>

        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join SnapCart and start ordering in minutes.</p>
        </motion.div>

        {/* Form */}
        <motion.form
          variants={itemVariants}
          onSubmit={handleRegister}
          className="flex flex-col gap-4"
          noValidate
        >
          <Field label="Full Name" icon={User} error={errors.name}>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-300 text-sm"
            />
          </Field>

          <Field label="Email" icon={Mail} error={errors.email}>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-300 text-sm"
            />
          </Field>

          <Field label="Password" icon={Lock} error={errors.password}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-300 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </Field>

          {/* Server error */}
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

          {/* Submit */}
          <Button type="submit" isLoading={isLoading} size="lg" className="mt-1">
            Create Account
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google placeholder */}
          <Button type="button" variant="secondary" onClick={() => signIn("google", { callbackUrl: "/" })}>
            <img src="/google.png" alt="Google" className="w-5 h-5" />
            Continue with Google
          </Button>
        </motion.form>

        {/* Sign in link */}
        <motion.p variants={itemVariants} className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 font-semibold hover:underline">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}

export default RegisterForm
