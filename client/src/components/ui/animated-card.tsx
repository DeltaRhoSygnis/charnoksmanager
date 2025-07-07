import React, { forwardRef } from 'react';
import { Card, CardProps } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps extends CardProps {
  hover?: boolean;
  scale?: boolean;
  lift?: boolean;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, hover = true, scale = true, lift = true, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'transition-all duration-300 ease-out',
          hover && 'hover:shadow-xl',
          scale && 'hover:scale-[1.02]',
          lift && 'hover:-translate-y-1',
          'card-animated',
          className
        )}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';