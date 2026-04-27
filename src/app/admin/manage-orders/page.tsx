"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  ArrowLeft, ShoppingBag, Clock, User, Phone, MapPin,
  CreditCard, Package, ChevronDown, ChevronUp, Loader2,
  AlertCircle, CheckCircle, Truck,
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

interface OrderItem {
  grocery: string
  quantity: number
  name: string
  price: string
  image: string
  unit: string
}

interface OrderAddress {
  fullName: string
  mobile: string
  city: string
  state: string
  pinCode: string
  fullAddress: string
}

interface Order {
  _id: string
  user: { name: string; email: string } | string
  items: OrderItem[]
  totalAmount: string
  paymentMethod: "cod" | "online"
  isPaid?: boolean
  address: OrderAddress
  status: "pending" | "accepted" | "out for delivery" | "delivered"
  createdAt: string
  assignedDeliveryBoy?: {
    _id: string
    name: string
    email: string
    image?: string
    mobile?: string
  }
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 14 } },
}

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      setError("")
      const res = await axios.get("/api/admin/get-orders")
      setOrders(res.data.data || [])
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Failed to fetch orders. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const getUserName = (user: Order["user"]) => {
    if (typeof user === "object" && user !== null) {
      return user.name || "Unknown"
    }
    return "Unknown"
  }

  const getUserPhone = (user: Order["user"]) => {
    if (typeof user === "object" && user !== null) {
      return user.email || "N/A"
    }
    return "N/A"
  }

  const toggleOrder = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId))
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId)
      const res = await axios.patch(`/api/admin/manage-orders/${orderId}`, { status: newStatus })
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus as Order["status"] } : order
        )
      )
      setExpandedOrder(null)
    } catch (err) {
      console.error("Error updating order status:", err)
      setError("Failed to update order status. Please try again.")
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
        <p className="text-gray-500 font-medium">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      <motion.div className="flex flex-col gap-6" variants={containerVariants} initial="hidden" animate="show">

        {/* Back button */}
        <motion.div variants={itemVariants}>
          <Link href="/">
            <motion.div
              className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-green-400 hover:text-green-600 text-gray-600 font-semibold text-sm px-4 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:shadow-green-100 group w-fit"
              whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </motion.div>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-200 shrink-0"
              whileHover={{ rotate: -6, scale: 1.05 }}
              transition={{ type: "spring" as const, stiffness: 300 }}
            >
              <ShoppingBag className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Orders</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {orders.length} order{orders.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5 text-red-600 text-sm"
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders List */}
        {orders.length === 0 ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No orders yet</p>
            <p className="text-gray-400 text-sm">Orders will appear here when customers place them.</p>
          </motion.div>
        ) : (
          <motion.div className="flex flex-col gap-4" variants={containerVariants}>
            {orders.map((order) => (
              <motion.div
                key={order._id}
                variants={itemVariants}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Order Header - Always visible */}
                <div
                  className="px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrder(order._id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left side - Order info */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Order ID */}
                        <span className="text-xs font-bold text-gray-400 uppercase">
                          #{order._id.slice(-8)}
                        </span>
                        {/* Paid/Unpaid tag */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.isPaid
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {order.isPaid ? "PAID" : "UNPAID"}
                        </span>
                        {/* Status tag */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "accepted"
                            ? "bg-purple-100 text-purple-700"
                            : order.status === "out for delivery"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {order.status.toUpperCase().replace(" ", " ")}
                        </span>
                      </div>

                      {/* Time & User info */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>

                      {/* User details - Hidden on mobile, visible on larger */}
                      <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>{getUserName(order.user as any)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{order.address.mobile}</span>
                        </div>
                      </div>

                      {/* Address - Full show on larger */}
                      <div className="hidden sm:flex items-start gap-1.5 text-sm text-gray-500 mt-1 max-w-md">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">
                          {order.address.fullAddress}, {order.address.city}, {order.address.state} {order.address.pinCode}
                        </span>
                      </div>

                      {/* Payment method */}
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                        <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                        <span className="capitalize">
                          {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                        </span>
                      </div>
                    </div>

                    {/* Right side - Total & Expand toggle */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          Rs. {order.totalAmount}
                        </p>
                        <p className="text-xs text-gray-400 text-right">
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedOrder === order._id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Mobile-only user details - Visible on mobile */}
                  <div className="sm:hidden flex flex-col gap-1.5 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{getUserName(order.user as any)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{order.address.mobile}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                      <span>
                        {order.address.fullAddress}, {order.address.city}, {order.address.state} {order.address.pinCode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Details - Expandable */}
                <AnimatePresence>
                  {expandedOrder === order._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="border-t border-gray-100 bg-gray-50/50 overflow-hidden"
                    >
                      <div className="p-5 flex flex-col gap-4">
                        {/* Status Selector - Placeholder */}
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                            <Truck className="w-3.5 h-3.5 text-green-500" />
                            Update Status
                          </label>
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              className="w-full appearance-none px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-2xl cursor-pointer outline-none focus:border-green-400 focus:shadow-md focus:shadow-green-100 transition-all"
                              disabled={updatingStatus === order._id}
                            >
                              <option value="pending">Pending</option>
                              <option value="accepted">Accepted</option>
                              <option value="out for delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          {updatingStatus === order._id && (
                            <p className="text-xs text-gray-400">
                              Updating status...
                            </p>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="flex flex-col gap-3">
                          <p className="text-sm font-semibold text-gray-700">Order Details</p>
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100"
                            >
                              <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  {item.quantity} x Rs. {item.price} / {item.unit}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900 shrink-0">
                                Rs. {String(Number(item.price) * item.quantity)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Total */}
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                          <p className="font-semibold text-gray-700">Total Amount</p>
                          <p className="text-xl font-bold text-green-600">Rs. {order.totalAmount}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default ManageOrdersPage