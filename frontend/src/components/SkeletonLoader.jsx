import React from 'react';
import { motion } from 'framer-motion';

export function SkeletonLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-4xl mx-auto p-5 sm:p-8 rounded-2xl bg-surface-elevated border border-border-subtle shadow-elevated space-y-6"
    >
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-surface rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-32 bg-surface rounded animate-pulse" />
            <div className="h-5 w-48 bg-surface rounded animate-pulse" />
          </div>
        </div>
        <div className="h-7 w-28 bg-surface rounded-md animate-pulse" />
      </div>

      {/* Recipient Banner Skeleton */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border-subtle space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-surface-hover rounded animate-pulse" />
            <div className="h-8 w-56 bg-surface-hover rounded-lg animate-pulse" />
          </div>
          <div className="space-y-2 md:text-right">
            <div className="h-3 w-24 bg-surface-hover rounded animate-pulse md:ml-auto" />
            <div className="h-6 w-44 bg-surface-hover rounded animate-pulse md:ml-auto" />
          </div>
        </div>
      </div>

      {/* Grid details skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-3.5 rounded-lg bg-surface border border-border-subtle space-y-2">
            <div className="h-3 w-20 bg-surface-hover rounded animate-pulse" />
            <div className="h-4 w-32 bg-surface-hover rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Bottom signature skeleton */}
      <div className="p-4 rounded-xl bg-surface border border-border-subtle space-y-2">
        <div className="h-3 w-48 bg-surface-hover rounded animate-pulse" />
        <div className="h-8 w-full bg-surface-elevated rounded border border-border-subtle animate-pulse" />
      </div>
    </motion.div>
  );
}

export default SkeletonLoader;
