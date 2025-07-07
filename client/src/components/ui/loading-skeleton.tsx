import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  width = 'w-full',
  height = 'h-4',
  rounded = true,
  count = 1
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={cn(
        'skeleton-animated bg-gray-200 dark:bg-gray-700',
        width,
        height,
        rounded ? 'rounded' : '',
        className
      )}
    />
  ));

  return count === 1 ? skeletons[0] : <div className="space-y-2">{skeletons}</div>;
};

export const CardSkeleton: React.FC = () => (
  <div className="card-animated p-6 bg-white dark:bg-gray-800 rounded-lg border">
    <div className="space-y-4">
      <LoadingSkeleton height="h-6" width="w-3/4" />
      <LoadingSkeleton height="h-4" width="w-full" count={3} />
      <div className="flex space-x-2">
        <LoadingSkeleton height="h-8" width="w-20" />
        <LoadingSkeleton height="h-8" width="w-20" />
      </div>
    </div>
  </div>
);

export const ProductSkeleton: React.FC = () => (
  <div className="card-animated p-4 bg-white dark:bg-gray-800 rounded-lg border">
    <LoadingSkeleton height="h-32" width="w-full" className="mb-4" />
    <LoadingSkeleton height="h-6" width="w-full" className="mb-2" />
    <LoadingSkeleton height="h-4" width="w-3/4" className="mb-2" />
    <LoadingSkeleton height="h-8" width="w-1/2" />
  </div>
);