import { useState, useEffect } from 'react'
import { Trash2, AlertTriangle, X, Loader2, Tag, AlertCircle, Package } from 'lucide-react'
import { deleteItem } from '../services/items'
import { formatCurrency } from '../utils/formatters'
import { getItemTypeBadge } from '../utils/itemTypes'

function DeleteItemModal({ isOpen, item, onClose, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isDeleting, onClose])

  if (!isOpen || !item) return null

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError(null)
      await deleteItem(item.id)
      onSuccess(item.id, item)
    } catch (err) {
      console.error('Failed to delete item:', err)
      setError(err.message || 'Failed to delete item. It may be referenced by other records.')
      setIsDeleting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-item-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose()
        }
      }}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="shrink-0 relative border-b border-[#193b35]/20 bg-[#193b35] px-5 py-4 sm:px-6 sm:py-5 text-white">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d4e8a8] via-[#e69c78] to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#d4e8a8] shadow-inner">
                <Trash2 size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2
                    id="delete-item-modal-title"
                    className="text-base sm:text-lg font-bold text-white tracking-tight truncate"
                  >
                    Delete Catalog Item
                  </h2>
                  <span className="hidden sm:inline-flex rounded-md bg-[#d4e8a8]/20 px-2 py-0.5 text-[11px] font-mono font-medium text-[#d4e8a8]">
                    {item.code}
                  </span>
                </div>
                <p className="text-xs text-[#b8c9bd] truncate">
                  Item Master catalog deletion
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              aria-label="Close dialog"
              className="size-8.5 shrink-0 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-slate-800">
          <div className="flex items-start gap-3 rounded-xl border border-rose-200/90 bg-rose-50/70 p-3.5 text-xs text-rose-900 shadow-2xs">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-700 mt-0.5">
              <AlertTriangle size={15} />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-rose-950">
                Are you sure you want to delete this item?
              </p>
              <p className="text-rose-800/90 leading-relaxed">
                This item will be permanently removed from the catalog. This action cannot be undone.
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/95 p-3.5 text-xs text-amber-900 shadow-2xs animate-in fade-in duration-150">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-700" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-950">Deletion Blocked</p>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Item Details
              </span>
              <div>{getItemTypeBadge(item.type)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <span className="text-slate-500 flex items-center gap-1">
                  <Package size={12} className="text-slate-400" />
                  Item Name
                </span>
                <p className="font-semibold text-slate-900 mt-0.5 truncate text-sm">
                  {item.name}
                </p>
              </div>

              <div>
                <span className="text-slate-500 flex items-center gap-1">
                  <Tag size={12} className="text-slate-400" />
                  Item Code
                </span>
                <div className="mt-0.5">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    {item.code}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500">Unit of Measure</span>
                <p className="font-mono font-semibold text-slate-900 mt-1">
                  {item.unit_of_measure || 'pcs'}
                </p>
              </div>

              <div>
                <span className="text-slate-500">Standard Cost</span>
                <p className="font-mono font-bold text-[#193b35] mt-0.5">
                  {item.standard_cost != null ? formatCurrency(item.standard_cost) : '—'}
                </p>
              </div>

              {item.description && (
                <div className="col-span-2 border-t border-slate-200/60 pt-2">
                  <span className="text-slate-500">Description</span>
                  <p className="text-slate-600 mt-0.5 italic text-[11px] line-clamp-2">
                    {item.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex h-9.5 items-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-60 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-rose-600"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Delete Item</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteItemModal
