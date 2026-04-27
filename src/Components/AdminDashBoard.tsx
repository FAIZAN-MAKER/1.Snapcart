"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  ArrowRight,
  Clock,
  TrendingUp,
} from "lucide-react";

const stats = [
  { label: "Total Products", value: "156", icon: <Package className="w-5 h-5" />, color: "bg-green-100 text-green-600" },
  { label: "Total Users", value: "3,847", icon: <Users className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
  { label: "Total Orders", value: "1,284", icon: <ShoppingCart className="w-5 h-5" />, color: "bg-violet-100 text-violet-600" },
  { label: "Revenue", value: "$48,250", icon: <DollarSign className="w-5 h-5" />, color: "bg-emerald-100 text-emerald-600" },
];

const recentActivity = [
  { text: "New user registered - Sara Malik", time: "5 min ago" },
  { text: "Order #1234 delivered successfully", time: "15 min ago" },
  { text: "Product 'Fresh Apples' added to inventory", time: "1 hour ago" },
  { text: "Payment of $125 received", time: "2 hours ago" },
  { text: "New order placed - Order #1235", time: "3 hours ago" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 20,
    },
  },
};
export default function AdminDashBoard() {
  return (
    <motion.div
      className="min-h-screen bg-white pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Welcome Section */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 mb-8 text-white"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome, Admin!</h1>
          <p className="text-green-100 opacity-90 max-w-lg">
            Here&apos;s an overview of your SnapCart website. Monitor products, users, and orders all in one place.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-green-100 transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  {stat.icon}
                </div>
                <span className="text-gray-500 text-sm font-medium">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/admin/manage-orders">
              <motion.div
                className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-green-200 hover:shadow-md transition-all cursor-pointer group"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-3 bg-violet-100 rounded-xl text-violet-600 group-hover:bg-violet-200 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">View Orders</p>
                  <p className="text-xs text-gray-400">Track & manage orders</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
              </motion.div>
            </Link>

            <Link href="/admin/view-grocery">
              <motion.div
                className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-green-200 hover:shadow-md transition-all cursor-pointer group"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-3 bg-orange-100 rounded-xl text-orange-600 group-hover:bg-orange-200 transition-colors">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Manage Products</p>
                  <p className="text-xs text-gray-400">Add or edit items</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
              </motion.div>
            </Link>

            <Link href="/admin/add-grocery">
              <motion.div
                className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-green-200 hover:shadow-md transition-all cursor-pointer group"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-3 bg-green-100 rounded-xl text-green-600 group-hover:bg-green-200 transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Add Product</p>
                  <p className="text-xs text-gray-400">Add new grocery item</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {recentActivity.map((activity, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gray-100 rounded-full">
                    <Clock className="w-3 h-3 text-gray-400" />
                  </div>
                  <span className="text-gray-700 text-sm">{activity.text}</span>
                </div>
                <span className="text-gray-400 text-xs">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}