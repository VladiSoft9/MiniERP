import { useEffect } from 'react'
import {
  PackageCheck,
  Lock,
  X,
  AlertTriangle,
  Loader2,
  Building2,
  Package
} from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

function DeliveryConfirmationModal({
  order,
  onConfirm,
  onCancel,
  isConfirming = false,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !isConfirming) {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, isConfirming])

  if (!order) return null

  const item = order.item || {}
  const uom = item.unit_of_measure || 'pcs'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="shrink-0 relative border-b border-[#193b35]/20 bg-[#193b35] px-5 py-4 sm:px-6 sm:py-5 text-white">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d4e8a8] via-[#e69c78] to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#d4e8a8] shadow-inner">
                <PackageCheck size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2
                    id="delivery-modal-title"
                    className="text-base sm:text-lg font-bold text-white tracking-tight truncate"
                  >
                    Confirm Order Delivery
                  </h2>
                  <span className="hidden sm:inline-flex rounded-md bg-[#d4e8a8]/20 px-2 py-0.5 text-[11px] font-mono font-medium text-[#d4e8a8]">
                    {order.order_number}
                  </span>
                </div>
                <p className="text-xs text-[#b8c9bd] truncate">
                  Sales order fulfillment confirmation
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={isConfirming}
              aria-label="Close dialog"
              className="size-8.5 shrink-0 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Permanent Lock Warning Alert */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-200/90 bg-amber-50/70 p-3.5 text-xs text-amber-900 shadow-2xs">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700">
              <AlertTriangle size={15} />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-amber-950">
                Delivered status is final!
              </p>
              <p className="text-amber-800/90 leading-relaxed">
                Once marked as <strong>Delivered</strong>, this sales order will be locked.
              </p>
            </div>
          </div>

          {/* Order Summary Snapshot */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Order Details
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 flex items-center gap-1">
                  <Building2 size={12} className="text-slate-400" />
                  Customer
                </span>
                <p className="font-semibold text-slate-900 mt-0.5 truncate">
                  {order.customer_name}
                </p>
              </div>

              <div>
                <span className="text-slate-500 flex items-center gap-1">
                  <Package size={12} className="text-slate-400" />
                  Product
                </span>
                <p className="font-semibold text-slate-900 mt-0.5 truncate">
                  {item.name || 'Unknown item'}
                </p>
              </div>

              <div>
                <span className="text-slate-500">Delivering Quantity</span>
                <p className="font-mono font-semibold text-slate-900 mt-0.5">
                  {Number(order.quantity).toLocaleString()} {uom}
                </p>
              </div>

              <div>
                <span className="text-slate-500">Total Order Value</span>
                <p className="font-mono font-bold text-[#193b35] mt-0.5">
                  {formatCurrency(order.total_value)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#193b35] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#234f47] disabled:opacity-60 transition-all cursor-pointer"
          >
            {isConfirming ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Confirming...</span>
              </>
            ) : (
              <>
                <Lock size={13} className="text-sky-300" />
                <span>Confirm as Delivered</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeliveryConfirmationModal

