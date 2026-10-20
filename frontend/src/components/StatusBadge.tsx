import React from 'react';
import { CheckCircle2, Clock, AlertOctagon, RefreshCw, XCircle, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

  let styles = 'bg-zinc-100 text-zinc-800 border-zinc-200';
  let icon = <Clock className="w-3.5 h-3.5 text-zinc-500" />;
  let label = status;

  switch (normalized) {
    case 'DONE':
    case 'COMPLETED':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      label = 'Completed';
      break;
    case 'APPROVED':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      label = 'Approved';
      break;
    case 'REJECTED':
      styles = 'bg-red-50 text-red-800 border-red-300 font-bold';
      icon = <XCircle className="w-3.5 h-3.5 text-red-600" />;
      label = 'Rejected';
      break;
    case 'LOW':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      label = 'Low Risk';
      break;
    case 'MEDIUM':
      styles = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      label = 'Medium Risk';
      break;
    case 'HIGH':
      styles = 'bg-red-50 text-red-800 border-red-300 font-bold';
      icon = <ShieldAlert className="w-3.5 h-3.5 text-red-600" />;
      label = 'High Risk';
      break;
    case 'PROCESSING':
      styles = 'bg-red-50 text-red-800 border-red-200';
      icon = <RefreshCw className="w-3.5 h-3.5 text-red-600 animate-spin" />;
      label = 'Processing';
      break;
    case 'UPLOADED':
      styles = 'bg-zinc-100 text-zinc-900 border-zinc-300 font-medium';
      icon = <Clock className="w-3.5 h-3.5 text-zinc-600" />;
      label = 'Uploaded';
      break;
    case 'FAILED':
      styles = 'bg-red-50 text-red-800 border-red-300 font-bold';
      icon = <AlertOctagon className="w-3.5 h-3.5 text-red-600" />;
      label = 'Failed';
      break;
    case 'PENDING':
      styles = 'bg-zinc-100 text-zinc-700 border-zinc-200';
      icon = <Clock className="w-3.5 h-3.5 text-zinc-500" />;
      label = 'Pending';
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1 font-medium' : 'px-2.5 py-1 text-xs font-semibold gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs ${styles} ${sizeClasses}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
