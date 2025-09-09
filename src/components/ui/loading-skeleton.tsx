import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3, className = "" }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden bg-muted rounded-2xl p-4 border-2 border-muted"
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col space-y-2">
              <div className="h-5 w-20 bg-muted-foreground/20 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-muted-foreground/20 rounded animate-pulse"></div>
            </div>
            <div className="text-right">
              <div className="h-5 w-16 bg-muted-foreground/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const BillerLoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 5, className = "" }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden w-full h-16 border border-border rounded-lg bg-muted"
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="flex justify-between items-center p-4 h-full">
            <div className="h-4 w-32 bg-muted-foreground/20 rounded animate-pulse"></div>
            <div className="h-5 w-5 bg-muted-foreground/20 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};