import React from 'react';
import { motion } from 'framer-motion';

export function SkeletonLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#0B0D14]/80 border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl space-y-6"
    >
      {/* Badge Skeleton */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800/60">
        <div className="h-8 w-36 bg-slate-800/80 rounded-full animate-pulse" />
        <div className="h-5 w-48 bg-slate-800/60 rounded-md animate-pulse" />
      </div>

      {/* Recipient & Role Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-28 bg-slate-800/60 rounded animate-pulse" />
        <div className="h-9 w-3/4 bg-slate-800/90 rounded-lg animate-pulse" />
        <div className="h-6 w-1/2 bg-slate-800/70 rounded-md animate-pulse" />
      </div>

      {/* Grid details skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-2">
            <div className="h-3 w-24 bg-slate-800/60 rounded animate-pulse" />
            <div className="h-5 w-36 bg-slate-800/80 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Bottom bar skeleton */}
      <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
        <div className="h-4 w-64 bg-slate-800/60 rounded animate-pulse" />
        <div className="h-9 w-28 bg-slate-800/80 rounded-xl animate-pulse" />
      </div>
    </motion.div>
  );
}
