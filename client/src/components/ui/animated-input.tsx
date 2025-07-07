import React, { forwardRef } from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AnimatedInputProps extends InputProps {
  glow?: boolean;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, glow = true, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          'input-animated focus-ring transition-all duration-200',
          glow && 'focus:shadow-lg focus:shadow-blue-500/25',
          'hover:border-opacity-60',
          className
        )}
        {...props}
      />
    );
  }
);

AnimatedInput.displayName = 'AnimatedInput';