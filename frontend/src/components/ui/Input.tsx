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
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase select-none mb-0.5">
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
              "w-full h-11 bg-slate-950/40 border border-white/5 text-foreground rounded-lg px-3.5 text-sm transition-all focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 placeholder:text-slate-500/80 shadow-glass-inset disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/10",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-destructive/50 focus:border-destructive/60 focus:ring-destructive/10",
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
          <span className="text-xs text-destructive font-medium tracking-wide">
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
