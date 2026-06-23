// Shared UI configurations and styling helpers for dashboards

export interface StatusBadgeProps {
  status: 'pending' | 'active' | 'approved' | 'rejected' | 'matured' | 'paid' | 'overdue' | 'skipped' | 'withdrawn';
  size?: 'sm' | 'md';
}

export const statusColors = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
  rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
  overdue: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
  matured: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
  skipped: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800',
  withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800',
};

export const statusLabels = {
  pending: 'Pending Verification',
  active: 'Active',
  approved: 'Approved',
  paid: 'Paid',
  rejected: 'Rejected',
  overdue: 'Overdue',
  matured: 'Matured',
  skipped: 'Skipped',
  withdrawn: 'Withdrawn',
};
