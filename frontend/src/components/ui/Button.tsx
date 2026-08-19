import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, disabled, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.98]";
    
    const variants = {
      primary: "bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white font-bold shadow-glow border border-orange-400/30",
      secondary: "bg-[#211712] border border-[#3A2720] text-stone-200 hover:bg-[#2A1D17] hover:text-white",
      outline: "border border-[#3A2720] bg-transparent text-stone-300 hover:bg-[#211712] hover:text-white",
      ghost: "hover:bg-[#211712] text-stone-400 hover:text-white",
      glass: "bg-[#18120F] border border-[#3A2720] text-stone-100 hover:bg-[#211712] hover:border-orange-500/40",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs gap-1.5 rounded-md",
      md: "h-11 px-5 py-2.5 text-sm gap-2 rounded-lg",
      lg: "h-13 px-7 text-base gap-2.5 rounded-xl",
    };

    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.015 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props as any}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        
        {children}
        
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
