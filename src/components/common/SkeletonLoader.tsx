import React from 'react';

export interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({ className = '', ...rest }) => (
  <div className={`bg-slate-200/70 animate-pulse rounded-xl ${className}`} {...rest} />
);

export const CardSkeleton = ({ count = 1 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <Shimmer className="w-10 h-10 rounded-xl" />
          <Shimmer className="w-16 h-5 rounded-full" />
        </div>
        <Shimmer className="w-3/4 h-5" />
        <Shimmer className="w-1/2 h-4" />
        <div className="pt-2 border-t border-slate-50 flex justify-between">
          <Shimmer className="w-20 h-4" />
          <Shimmer className="w-12 h-4" />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
      <Shimmer className="w-40 h-6" />
      <Shimmer className="w-24 h-8 rounded-lg" />
    </div>
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Shimmer key={c} className={`h-4 ${c === 0 ? 'w-12' : c === 1 ? 'w-1/3' : 'w-1/4'}`} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const WidgetSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
    <div className="flex items-center justify-between">
      <Shimmer className="w-32 h-5" />
      <Shimmer className="w-6 h-6 rounded-full" />
    </div>
    <div className="space-y-2">
      <Shimmer className="w-full h-8" />
      <Shimmer className="w-2/3 h-4" />
    </div>
    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50">
      <Shimmer className="h-12 rounded-xl" />
      <Shimmer className="h-12 rounded-xl" />
    </div>
  </div>
);

export const PageSkeleton = ({ title }: { title?: string }) => (
  <div className="w-full h-full p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800">{title || 'Memuat Halaman...'}</h2>
        <Shimmer className="w-48 h-4" />
      </div>
      <Shimmer className="w-32 h-10 rounded-xl" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <Shimmer className="w-12 h-12 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Shimmer className="w-20 h-3" />
            <Shimmer className="w-28 h-6" />
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <TableSkeleton rows={5} />
      </div>
      <div className="space-y-6">
        <WidgetSkeleton />
        <WidgetSkeleton />
      </div>
    </div>
  </div>
);
