import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glass?: boolean;
  animated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  hoverEffect = false,
  glass = true,
  animated = false,
  ...props
}) => {
  const CardComponent = animated ? motion.div : 'div';
  
  const cardStyles = cn(
    "relative overflow-hidden rounded-xl border border-[#3A2720] bg-[#18120F] p-6 text-stone-100 backdrop-blur-md",
    glass && "shadow-glass shadow-black/60",
    hoverEffect && "transition-all duration-300 hover:border-orange-500/40 hover:bg-[#211712] hover:shadow-glow hover:-translate-y-1",
    className
  );

  const motionProps = animated ? {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    whileHover: hoverEffect ? { y: -4 } : undefined
  } : {};

  return (
    <CardComponent className={cardStyles} {...motionProps} {...props as any}>
      {children}
    </CardComponent>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={cn("text-xl font-bold tracking-tight text-stone-50", className)} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={cn("text-sm text-stone-300", className)} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("pt-0", className)} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex items-center pt-4 border-t border-white/5 mt-4", className)} {...props} />
);
