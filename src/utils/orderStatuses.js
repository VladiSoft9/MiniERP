export const ORDER_STATUSES = [
  {
    key: 'draft',
    label: 'Draft',
    description: 'Initial draft, pending verification or approval',
    badgeClasses: 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-400/15',
    dotClass: 'bg-slate-400',
    activeBg: 'bg-slate-50',
    isFinal: false,
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    description: 'Order confirmed with customer & ready for scheduling',
    badgeClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/15',
    dotClass: 'bg-emerald-500',
    activeBg: 'bg-emerald-50/60',
    isFinal: false,
  },
  {
    key: 'in_production',
    label: 'In Production',
    description: 'Manufacturing, assembly or preparation underway',
    badgeClasses: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/15',
    dotClass: 'bg-amber-500',
    activeBg: 'bg-amber-50/60',
    isFinal: false,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Fulfilled & delivered to client (Status locked)',
    badgeClasses: 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/15',
    dotClass: 'bg-sky-500',
    activeBg: 'bg-sky-50/60',
    isFinal: true, // Delivered orders are final and cannot be modified
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    description: 'Order cancelled or voided',
    badgeClasses: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/15',
    dotClass: 'bg-rose-500',
    activeBg: 'bg-rose-50/60',
    isFinal: false,
  },
]

export function isStatusLocked(status) {
  return status === 'delivered'
}

export function getStatusConfig(status) {
  return (
    ORDER_STATUSES.find((s) => s.key === status) || {
      key: status || 'unknown',
      label: status || 'Unknown',
      description: 'Custom status',
      badgeClasses: 'bg-slate-100 text-slate-600 border-slate-200 ring-1 ring-slate-400/10',
      dotClass: 'bg-slate-400',
      activeBg: 'bg-slate-50',
      isFinal: false,
    }
  )
}
