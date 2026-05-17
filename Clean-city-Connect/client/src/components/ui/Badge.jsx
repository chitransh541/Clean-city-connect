import React from 'react';

/**
 * Badge component for complaint statuses.
 * Supports: pending, resolved, rejected
 */
export default function Badge({ status, className = '' }) {
  const statusMap = {
    pending: { label: 'Pending', cls: 'badge--pending' },
    resolved: { label: 'Resolved', cls: 'badge--resolved' },
    rejected: { label: 'Rejected', cls: 'badge--rejected' },
  };

  const { label, cls } = statusMap[status] || statusMap.pending;

  return (
    <span className={`badge ${cls} ${className}`}>
      {label}
    </span>
  );
}
