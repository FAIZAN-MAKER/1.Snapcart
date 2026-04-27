"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ShoppingBasket } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import Button from '@/Components/ui/Button'

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

type LoginFormData = z.infer<typeof loginSchema>
type FieldErrors = Partial<Record<keyof LoginFormData, string>>

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

const LoginPage = () => {
  const router = useRouter()
  const [form, setForm] = useState<LoginFormData>({ email: "", password: "" })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")

    const result = loginSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: FieldErrors = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof LoginFormData
        if (!fieldErrors[field]) fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    try {
      setIsLoading(true)
      const res = await signIn("credentials", {
        email: result.data.email,
        password: result.data.password,
        redirect: false,
      })

      if (res?.error) {
        setServerError("Invalid email or password. Please try again.")
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setServerError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 16 } },
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <motion.div
        className="w-full max-w-md flex flex-col gap-7"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
            <ShoppingBasket className="text-white w-8 h-8" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your SnapCart account</p>
          </div>
        </motion.div>

        <motion.form
          variants={itemVariants}
          onSubmit={handleLogin}
          className="flex flex-col gap-4"
          noValidate
        >
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
              placeholder="Your password"
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

          <div className="flex justify-end -mt-2">
            <Link href="/forgot-password" className="text-green-600 text-xs hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

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

          <Button type="submit" isLoading={isLoading} size="lg" className="mt-1">
            Sign In
          </Button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Button type="button" variant="secondary" onClick={() => signIn("google", { callbackUrl: "/" })}>
            <img src="/google.png" alt="Google" className="w-5 h-5" />
            Continue with Google
          </Button>
        </motion.form>

        <motion.p variants={itemVariants} className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/register" className="text-green-600 font-semibold hover:underline">
            Create one
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}

export default LoginPage