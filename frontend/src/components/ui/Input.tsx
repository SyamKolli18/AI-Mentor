import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label className="text-[10px] font-bold text-slate-300 tracking-wider uppercase select-none mb-0.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 shrink-0 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-11 bg-[#111111] border border-[#27272A] text-slate-100 rounded-lg px-3.5 text-sm transition-all focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 placeholder:text-slate-500 shadow-glass-inset disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#3F3F46]",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-slate-400 shrink-0 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <span className="text-xs text-rose-400 font-medium tracking-wide flex items-center gap-1 mt-0.5">
            {error}
          </span>
        ) : helperText ? (
          <span className="text-xs text-slate-400">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
