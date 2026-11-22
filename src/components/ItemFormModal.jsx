import { useState, useEffect } from 'react'
import {
  X,
  Package,
  PackageCheck,
  Layers,
  Boxes,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  Pencil,
} from 'lucide-react'
import { createItem, updateItem } from '../services/items'

const UOM_OPTIONS = [
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'pair', label: 'Pair (pair)' },
  { value: 'set', label: 'Set (set)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'm', label: 'Meters (m)' },
  { value: 'l', label: 'Liters (l)' },
]

function ItemFormModal({ isOpen, onClose, onSuccess, item = null }) {
  const isEdit = Boolean(item && item.id)

  const [type, setType] = useState(item?.type || 'finished_good')
  const [code, setCode] = useState(item?.code || '')
  const [name, setName] = useState(item?.name || '')
  const [unitOfMeasure, setUnitOfMeasure] = useState(item?.unit_of_measure || 'pcs')
  const [standardCost, setStandardCost] = useState(
    item?.standard_cost != null ? String(item.standard_cost) : ''
  )
  const [description, setDescription] = useState(item?.description || '')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    const trimmedCode = code.trim().toUpperCase()
    const trimmedName = name.trim()

    if (!trimmedCode) {
      setFormError('Item code is required.')
      return
    }

    if (!trimmedName) {
      setFormError('Item name is required.')
      return
    }

    const parsedCost = parseFloat(standardCost)
    if (isNaN(parsedCost) || parsedCost < 0) {
      setFormError('Standard cost must be a valid non-negative number.')
      return
    }

    const payload = {
      code: trimmedCode,
      name: trimmedName,
      type,
      unit_of_measure: unitOfMeasure.trim() || 'pcs',
      standard_cost: parsedCost,
      description: description.trim() || null,
    }

    try {
      setIsSubmitting(true)
      let result
      if (isEdit) {
        result = await updateItem(item.id, payload)
      } else {
        result = await createItem(payload)
      }
      onSuccess(result, isEdit ? 'updated' : 'created')
      onClose()
    } catch (err) {
      console.error('Error saving item:', err)
      setFormError(err.message || 'Failed to save item. Please check your data and connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCodePlaceholder = () => {
    if (type === 'finished_good') return 'e.g. FG-BIKE-PRO'
    if (type === 'semi_finished') return 'e.g. SF-FRAME-29'
    return 'e.g. RAW-ALUM-6061'
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-form-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose()
        }
      }}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 relative border-b border-[#193b35]/20 bg-[#193b35] px-5 py-4 sm:px-6 sm:py-5 text-white">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d4e8a8] via-[#e69c78] to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#d4e8a8] shadow-inner">
                {isEdit ? <Pencil size={20} /> : <Package size={20} />}
              </div>
              <div className="min-w-0">
                <h2
                  id="item-form-modal-title"
                  className="text-base sm:text-lg font-bold text-white tracking-tight truncate"
                >
                  {isEdit ? `Edit Item: ${item.code}` : 'Add New Item'}
                </h2>
                <p className="text-xs text-[#b8c9bd] truncate">
                  {isEdit
                    ? 'Modify catalog item properties and standard cost'
                    : 'Register a product, sub-assembly, or raw material in the catalog'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close dialog"
              className="size-8.5 shrink-0 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-slate-800">
            {formError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/95 p-3.5 text-xs text-rose-800 shadow-2xs animate-in fade-in duration-150">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
                <span className="leading-relaxed font-medium">{formError}</span>
              </div>
            )}

            {/* Classification Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                Item Classification *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setType('finished_good')}
                  className={`flex flex-col items-start gap-2 rounded-xl p-3 text-left border transition-all cursor-pointer ${type === 'finished_good'
                      ? 'border-[#193b35] bg-[#f5f8f3] ring-2 ring-[#193b35]/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${type === 'finished_good'
                          ? 'bg-[#193b35] text-white'
                          : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      <PackageCheck size={16} />
                    </div>
                    {type === 'finished_good' && (
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#193b35] text-white">
                        <Check size={10} />
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-900 block">Finished Good</span>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                      Saleable final products
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setType('semi_finished')}
                  className={`flex flex-col items-start gap-2 rounded-xl p-3 text-left border transition-all cursor-pointer ${type === 'semi_finished'
                      ? 'border-[#8f4724] bg-[#fdf8f4] ring-2 ring-[#8f4724]/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${type === 'semi_finished'
                          ? 'bg-[#8f4724] text-white'
                          : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      <Layers size={16} />
                    </div>
                    {type === 'semi_finished' && (
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#8f4724] text-white">
                        <Check size={10} />
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-900 block">Semi-Finished</span>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                      Sub-assemblies & parts
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setType('raw_material')}
                  className={`flex flex-col items-start gap-2 rounded-xl p-3 text-left border transition-all cursor-pointer ${type === 'raw_material'
                      ? 'border-sky-700 bg-sky-50/50 ring-2 ring-sky-700/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${type === 'raw_material'
                          ? 'bg-sky-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      <Boxes size={16} />
                    </div>
                    {type === 'raw_material' && (
                      <span className="flex size-4 items-center justify-center rounded-full bg-sky-700 text-white">
                        <Check size={10} />
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-900 block">Raw Material</span>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                      Purchased supplies
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Item Code & Name Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="item-code-input"
                  className="block text-[11px] font-semibold text-slate-700 mb-1"
                >
                  Item Code *
                </label>
                <input
                  id="item-code-input"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder={getCodePlaceholder()}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs uppercase text-slate-800 placeholder:text-slate-400 focus:border-[#193b35] focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Unique identifier (e.g. SKU / Part #)
                </span>
              </div>

              <div>
                <label
                  htmlFor="item-name-input"
                  className="block text-[11px] font-semibold text-slate-700 mb-1"
                >
                  Item Name *
                </label>
                <input
                  id="item-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Aero 29er Mountain Bike"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#193b35] focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Descriptive product title
                </span>
              </div>
            </div>

            {/* Unit of Measure & Standard Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="item-uom-input"
                  className="block text-[11px] font-semibold text-slate-700 mb-1"
                >
                  Unit of Measure *
                </label>
                <div className="relative">
                  <select
                    id="item-uom-input"
                    value={unitOfMeasure}
                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs text-slate-800 focus:border-[#193b35] focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors cursor-pointer"
                  >
                    {UOM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="item-cost-input"
                  className="block text-[11px] font-semibold text-slate-700 mb-1"
                >
                  Standard Cost (€) *
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    €
                  </span>
                  <input
                    id="item-cost-input"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={standardCost}
                    onChange={(e) => setStandardCost(e.target.value)}
                    placeholder="0.00"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-[#193b35] focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Description / Notes */}
            <div>
              <label
                htmlFor="item-desc-input"
                className="block text-[11px] font-semibold text-slate-700 mb-1"
              >
                Description / Technical Notes{' '}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="item-desc-input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add specification details, dimensions, material alloy, or supplier notes..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#193b35] focus:outline-none focus:ring-1 focus:ring-[#193b35] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 px-6 py-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex h-9.5 items-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-9.5 items-center gap-2 rounded-xl bg-[#193b35] px-5 text-xs font-semibold text-white shadow-xs hover:bg-[#234f47] transition-all cursor-pointer disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#193b35]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{isEdit ? 'Saving Changes...' : 'Creating Item...'}</span>
                </>
              ) : isEdit ? (
                <>
                  <Check size={14} />
                  <span>Update Item</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Add Item</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ItemFormModal
