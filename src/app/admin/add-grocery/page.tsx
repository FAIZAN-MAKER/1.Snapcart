"use client"

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ShoppingBasket, Tag, Layers, Weight,
  DollarSign, ImagePlus, Trash2, Loader2, CheckCircle2,
  AlertCircle, Sparkles, ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import axios, { AxiosError } from 'axios'

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Rice, Atta & Grains",
  "Snacks & Buiscuits",
  "Spices & Masalas",
  "Beverages & Drinks",
  "Personal Care",
  "Household Essentials",
  "Instant & Packaged Food",
  "Baby & Pet Care",
]

const UNITS = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "l", label: "Litre (l)" },
  { value: "ml", label: "Millilitre (ml)" },
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "pack", label: "Pack" },
]

// ─── Animation Variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 90, damping: 15 } },
}

// ─── Field Wrapper ────────────────────────────────────────────────────────────
const Field = ({
  label, icon: Icon, error, children, required,
}: {
  label: string; icon: React.ElementType; error?: string; children: React.ReactNode; required?: boolean
}) => (
  <motion.div variants={itemVariants} className="flex flex-col gap-2">
    <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
      <Icon className="w-3.5 h-3.5 text-green-500" />
      {label}
      {required && <span className="text-green-500">*</span>}
    </label>
    <div className={`rounded-2xl border-2 transition-all duration-200 bg-white overflow-hidden ${
      error ? "border-red-300 shadow-sm shadow-red-100" : "border-gray-200 focus-within:border-green-400 focus-within:shadow-md focus-within:shadow-green-100"
    }`}>
      {children}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p className="flex items-center gap-1.5 text-red-500 text-xs font-medium pl-1"
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </motion.p>
      )}
    </AnimatePresence>
  </motion.div>
)

// ─── Custom Select ────────────────────────────────────────────────────────────
const CustomSelect = ({
  value, onChange, options, placeholder, error,
}: {
  value: string; onChange: (val: string) => void
  options: { value: string; label: string }[] | string[]; placeholder: string; error?: string
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const normalized = options.map((o) => typeof o === "string" ? { value: o, label: o } : o)
  const selected = normalized.find((o) => o.value === value)

  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((p) => !p)} className={`w-full flex items-center justify-between px-4 py-3.5 text-sm cursor-pointer transition-all duration-200 rounded-2xl border-2 bg-white ${
        error ? "border-red-300" : open ? "border-green-400 shadow-md shadow-green-100" : "border-gray-200 hover:border-green-300"
      }`}>
        <span className={selected ? "text-gray-900 font-medium" : "text-gray-400"}>{selected ? selected.label : placeholder}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            className="absolute z-30 top-full mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/10 overflow-hidden max-h-56 overflow-y-auto"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
          >
            {normalized.map((opt, i) => (
              <motion.li key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                  opt.value === value ? "bg-green-50 text-green-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                }`}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025 }}
              >
                {opt.label}
                {opt.value === value && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Image Upload Zone ────────────────────────────────────────────────────────
const ImageUpload = ({
  preview, onFileSelect, onRemove, error,
}: {
  preview: string | null; onFileSelect: (f: File) => void; onRemove: () => void; error?: string
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith("image/")) onFileSelect(file)
  }, [onFileSelect])

  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-2">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
        <ImagePlus className="w-3.5 h-3.5 text-green-500" />
        Product Image <span className="text-green-500">*</span>
      </label>

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div key="preview"
            className="relative rounded-2xl overflow-hidden border-2 border-green-300 shadow-md shadow-green-100"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring" as const, stiffness: 200, damping: 20 }}
          >
            <img src={preview} alt="Preview" className="w-full h-52 object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/35 transition-all duration-200 flex items-center justify-center group">
              <motion.button type="button" onClick={onRemove}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg"
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-4 h-4" /> Remove Image
              </motion.button>
            </div>
            <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
              <CheckCircle2 className="w-3 h-3" /> Ready to upload
            </div>
          </motion.div>
        ) : (
          <motion.div key="dropzone"
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
              error ? "border-red-300 bg-red-50/40"
                : dragging ? "border-green-400 bg-green-50 scale-[1.01] shadow-md shadow-green-100"
                : "border-gray-300 bg-gray-50/50 hover:border-green-300 hover:bg-green-50/30"
            }`}
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-4 py-14 px-6 text-center select-none">
              <motion.div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-green-100" : "bg-gray-100"}`}
                animate={dragging ? { scale: 1.12, rotate: -6 } : { scale: 1, rotate: 0 }}
                transition={{ type: "spring" as const, stiffness: 300 }}
              >
                <ImagePlus className={`w-7 h-7 transition-colors ${dragging ? "text-green-500" : "text-gray-400"}`} />
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-gray-700">{dragging ? "Drop it right here!" : "Click or drag & drop image"}</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
              </div>
              <motion.span
                className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full cursor-pointer hover:bg-green-100 transition-colors"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              >
                Browse Files
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect(f) }} />

      <AnimatePresence>
        {error && (
          <motion.p className="flex items-center gap-1.5 text-red-500 text-xs font-medium pl-1"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AlertCircle className="w-3 h-3" />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type FormState = { name: string; category: string; unit: string; price: string }
type FormErrors = Partial<Record<keyof FormState | "image", string>>

const AddGroceryPage = () => {
  const [form, setForm] = useState<FormState>({ name: "", category: "", unit: "", price: "" })
  const [errors, setErrors] = useState<FormErrors>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState(false)
  const [successName, setSuccessName] = useState("")

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }))
  }

  const handleFileSelect = (file: File) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    if (errors.image) setErrors((p) => ({ ...p, image: undefined }))
  }

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.name.trim()) e.name = "Grocery name is required."
    if (!form.category) e.category = "Please select a category."
    if (!form.unit) e.unit = "Please select a unit."
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = "Enter a valid price greater than 0."
    if (!imageFile) e.image = "Please upload a product image."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")
    if (!validate()) return

    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append("name", form.name.trim())
      formData.append("category", form.category)
      formData.append("unit", form.unit)   // ✅ string — matches model
      formData.append("price", form.price) // ✅ string — matches model
      formData.append("image", imageFile!)

      await axios.post("/api/admin/add-grocery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setSuccessName(form.name.trim())
      setSuccess(true)
    } catch (err) {
      const error = err as AxiosError<{ error: string }>
      setServerError(error.response?.data?.error ?? "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setForm({ name: "", category: "", unit: "", price: "" })
    setImageFile(null)
    setImagePreview(null)
    setErrors({})
    setServerError("")
    setSuccess(false)
    setSuccessName("")
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div className="flex flex-col items-center gap-7 text-center max-w-sm w-full"
          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring" as const, stiffness: 120, damping: 16 }}
        >
          <motion.div
            className="w-28 h-28 rounded-3xl bg-green-100 flex items-center justify-center shadow-lg shadow-green-200"
            initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring" as const, stiffness: 150, damping: 14, delay: 0.1 }}
          >
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </motion.div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-gray-900">Grocery Added! 🎉</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              <span className="font-bold text-green-600">"{successName}"</span> has been added to your store inventory.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <motion.button onClick={resetForm}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-colors cursor-pointer shadow-md shadow-green-200"
              whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}
            >
              Add Another
            </motion.button>
            <Link href="/" className="flex-1">
              <motion.div
                className="w-full flex items-center justify-center bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-4 rounded-2xl transition-colors cursor-pointer"
                whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}
              >
                Go Home
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Main Form ──
  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 max-w-2xl mx-auto">
      <motion.div className="flex flex-col gap-8" variants={containerVariants} initial="hidden" animate="show">

        <motion.div variants={itemVariants}>
          <Link href="/">
            <motion.div
              className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-green-400 hover:text-green-600 text-gray-600 font-semibold text-sm px-4 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:shadow-green-100 group w-fit"
              whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back to Home</span>
            </motion.div>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-200 shrink-0"
              whileHover={{ rotate: -8, scale: 1.08 }}
              transition={{ type: "spring" as const, stiffness: 300 }}
            >
              <ShoppingBasket className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Grocery</h1>
                <motion.div
                  animate={{ rotate: [0, 15, -10, 15, 0] }}
                  transition={{ duration: 1.2, delay: 1, repeat: Infinity, repeatDelay: 5 }}
                >
                  <Sparkles className="w-5 h-5 text-green-400" />
                </motion.div>
              </div>
              <p className="text-gray-500 text-sm mt-0.5">Fill out the details below to add a new grocery item.</p>
            </div>
          </div>
          {/* Progress bar decoration */}
          <motion.div className="h-1 bg-gray-100 rounded-full overflow-hidden"
            initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.9, ease: "easeOut" }}
          >
            <div className="h-full w-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
          </motion.div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

          {/* Grocery Name */}
          <Field label="Grocery Name" icon={Tag} error={errors.name} required>
            <input type="text" value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Organic Basmati Rice"
              className="w-full px-4 py-3.5 bg-transparent outline-none text-gray-800 placeholder:text-gray-300 text-sm font-medium"
            />
          </Field>


          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <Layers className="w-3.5 h-3.5 text-green-500" />
              Category <span className="text-green-500">*</span>
            </label>
            <CustomSelect value={form.category} onChange={(v) => handleChange("category", v)}
              options={CATEGORIES} placeholder="Select a category" error={errors.category} />
            <AnimatePresence>
              {errors.category && (
                <motion.p className="flex items-center gap-1.5 text-red-500 text-xs font-medium pl-1"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <AlertCircle className="w-3 h-3" />{errors.category}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Unit + Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                <Weight className="w-3.5 h-3.5 text-green-500" />
                Unit <span className="text-green-500">*</span>
              </label>
              <CustomSelect value={form.unit} onChange={(v) => handleChange("unit", v)}
                options={UNITS} placeholder="Select unit" error={errors.unit} />
              <AnimatePresence>
                {errors.unit && (
                  <motion.p className="flex items-center gap-1.5 text-red-500 text-xs font-medium pl-1"
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <AlertCircle className="w-3 h-3" />{errors.unit}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <Field label="Price (PKR)" icon={DollarSign} error={errors.price} required>
              <div className="flex items-center">
                <span className="pl-4 text-gray-400 text-sm font-bold select-none">₨</span>
                <input type="number" value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="0.00" min="0" step="0.01"
                  className="flex-1 px-3 py-3.5 bg-transparent outline-none text-gray-800 placeholder:text-gray-300 text-sm font-medium"
                />
              </div>
            </Field>
          </div>

          {/* Image Upload */}
          <ImageUpload
            preview={imagePreview}
            onFileSelect={handleFileSelect}
            onRemove={() => { setImageFile(null); setImagePreview(null) }}
            error={errors.image}
          />

          {/* Server Error */}
          <AnimatePresence>
            {serverError && (
              <motion.div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5 text-red-600 text-sm"
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{serverError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.div variants={itemVariants} className="pt-1">
            <motion.button type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-green-200 transition-colors cursor-pointer text-base"
              whileHover={!isLoading ? { scale: 1.01, y: -1 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Uploading & Saving…</>
              ) : (
                <><ShoppingBasket className="w-5 h-5" />Add Grocery</>
              )}
            </motion.button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Image is uploaded to Cloudinary. All fields marked <span className="text-green-500 font-bold">*</span> are required.
            </p>
          </motion.div>
        </form>
      </motion.div>
    </div>
  )
}

export default AddGroceryPage
