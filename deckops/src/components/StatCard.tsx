import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  className?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, className = '', icon }: StatCardProps) {
  return (
    <div className={`flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 ${className}`}>
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold">{typeof value === 'number' ? value.toFixed(1) : value}</p>
      </div>
    </div>
  );
}