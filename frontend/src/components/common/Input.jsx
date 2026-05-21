import React from 'react'

const Input = React.forwardRef(({ className = '', type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-none 
        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export { Input } 