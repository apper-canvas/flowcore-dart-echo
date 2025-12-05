import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md",
  children, 
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary hover:bg-blue-700 text-white shadow-sm hover:shadow-md focus:ring-primary",
    secondary: "border border-gray-300 hover:border-gray-400 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500",
    success: "bg-success hover:bg-green-700 text-white shadow-sm hover:shadow-md focus:ring-success",
    warning: "bg-warning hover:bg-yellow-600 text-white shadow-sm hover:shadow-md focus:ring-warning",
    error: "bg-error hover:bg-red-700 text-white shadow-sm hover:shadow-md focus:ring-error",
    ghost: "text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded",
    md: "px-4 py-2 text-sm rounded-md",
    lg: "px-6 py-3 text-base rounded-lg"
  };
  
  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;