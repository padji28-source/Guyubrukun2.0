import React from 'react';

export const SkeletonLoader = ({ lines = 4, className = "" }: { lines?: number; className?: string }) => {
  return (
    <div className={`p-4 space-y-4 animate-pulse ${className}`}>
      <div className="h-7 bg-slate-200 rounded-lg w-1/3"></div>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-2.5">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            <div className="h-3 bg-slate-100 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded w-28"></div>
        <div className="w-8 h-8 rounded-full bg-slate-200"></div>
      </div>
      <div className="h-7 bg-slate-200 rounded w-36"></div>
      <div className="h-3 bg-slate-100 rounded w-20"></div>
    </div>
  );
};
