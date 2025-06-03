import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false,
}) => {
  const baseClasses = "rounded-lg font-medium shadow focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 text-white focus:ring-blue-400 hover:from-blue-600 hover:to-blue-700",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 focus:ring-gray-300 hover:from-gray-200 hover:to-gray-300",
    outline: "bg-transparent border border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-300",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white focus:ring-red-400 hover:from-red-600 hover:to-red-700",
    success: "bg-gradient-to-r from-green-500 to-green-600 text-white focus:ring-green-400 hover:from-green-600 hover:to-green-700",
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg";

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
