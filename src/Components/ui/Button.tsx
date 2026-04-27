"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'onAnimationEnd' | 'onAnimationIteration'
> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = 'flex items-center justify-center gap-2 font-semibold rounded-2xl transition-colors disabled:cursor-not-allowed'

  const sizeStyles = {
    sm: 'py-3 px-5 text-sm',
    md: 'py-3.5 px-6 text-sm',
    lg: 'py-4 px-6 text-base',
  }

  const variantStyles = {
    primary: 'bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white shadow-md shadow-green-200',
    secondary: 'bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50',
    outline: 'bg-white border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white',
  }

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      whileHover={disabled || isLoading ? {} : { scale: 1.01 }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  )
}

export default Button