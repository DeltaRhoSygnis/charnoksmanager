import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAnimations } from '@/hooks/useAnimations';

interface AnimatedButtonProps extends ButtonProps {
  ripple?: boolean;
  lift?: boolean;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, ripple = true, lift = true, onClick, children, ...props }, ref) => {
    const { addRippleEffect } = useAnimations();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple) {
        addRippleEffect(event);
      }
      onClick?.(event);
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'btn-animated transition-all duration-200',
          lift && 'hover:transform hover:-translate-y-0.5 hover:shadow-lg',
          'active:transform active:translate-y-0 active:shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';