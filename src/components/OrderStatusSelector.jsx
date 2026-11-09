import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  ChevronDown,
  Lock,
  Check,
  Loader2,
  ShoppingCart,
  X,
} from 'lucide-react'
import {
  ORDER_STATUSES,
  getStatusConfig,
  isStatusLocked,
} from '../utils/orderStatuses'

function OrderStatusSelector({
  order,
  onStatusChange,
  onRequestDeliveryConfirm,
  isUpdating = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, openUpward: false })

  const currentStatus = order?.status || 'draft'
  const isLocked = isStatusLocked(currentStatus)
  const config = getStatusConfig(currentStatus)

  // Calculate clean dropdown position in viewport
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const menuWidth = 270
    const menuHeight = 310
    const padding = 12

    const spaceBelow = window.innerHeight - rect.bottom
    const openUpward = spaceBelow < menuHeight && rect.top > menuHeight

    const top = openUpward
      ? Math.max(padding, rect.top - menuHeight - 6)
      : Math.min(window.innerHeight - menuHeight - padding, rect.bottom + 6)

    // Constrain horizontal position within viewport
    let left = rect.left
    if (left + menuWidth > window.innerWidth - padding) {
      left = window.innerWidth - menuWidth - padding
    }
    if (left < padding) {
      left = padding
    }

    setMenuPosition({ top, left, openUpward })
  }, [])

  const handleToggle = () => {
    if (isLocked || isUpdating) return
    if (!isOpen) {
      updatePosition()
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return

    function handleMouseDown(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    function handleScrollOrResize() {
      setIsOpen(false)
    }

    document.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [isOpen])

  const handleSelect = (statusKey) => {
    setIsOpen(false)

    if (statusKey === currentStatus) return

    if (statusKey === 'delivered') {
      onRequestDeliveryConfirm(order)
      return
    }

    onStatusChange(order, statusKey)
  }

  // Delivered Order (Status is locked permanently)
  if (isLocked) {
    return (
      <div
        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium select-none bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/10 cursor-default"
        title="Delivered orders are final and cannot be modified."
      >
        <span className="size-1.5 rounded-full bg-sky-500" aria-hidden="true" />
        <span>Delivered</span>
        <Lock size={10} className="text-sky-600/80 ml-0.5" aria-hidden="true" />
      </div>
    )
  }

  // Interactive Status Selector for editable orders
  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={isUpdating}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Click to change order status"
        className={`group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer ${config.badgeClasses
          } ${isOpen
            ? 'ring-2 ring-[#193b35]/25 border-[#193b35]/40 shadow-xs'
            : 'hover:border-slate-300 hover:ring-2 hover:ring-[#193b35]/15 hover:shadow-2xs active:scale-[0.98]'
          } ${isUpdating ? 'opacity-80 cursor-wait' : ''}`}
      >
        <span
          className={`size-1.5 rounded-full shrink-0 ${config.dotClass}`}
          aria-hidden="true"
        />
        <span>{config.label}</span>

        {isUpdating ? (
          <Loader2 size={11} className="animate-spin text-slate-500 ml-0.5 shrink-0" />
        ) : (
          <ChevronDown
            size={11}
            className={`text-slate-400 transition-transform duration-150 group-hover:text-slate-600 ml-0.5 shrink-0 ${isOpen ? 'rotate-180' : ''
              }`}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Floating Dropdown Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-label="Select order status"
            style={{
              position: 'fixed',
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
            className="z-50 w-[280px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-100"
          >
            {/* Header */}
            <div className="relative shrink-0 border-b border-[#193b35]/20 bg-[#193b35] px-3.5 py-3 text-white">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d4e8a8] via-[#e69c78] to-transparent" />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#d4e8a8] shadow-inner">
                    <ShoppingCart size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white tracking-tight">
                        Change Status
                      </span>
                      <span className="rounded bg-[#d4e8a8]/20 px-1.5 py-0.2 font-mono text-[10px] font-medium text-[#d4e8a8]">
                        {order.order_number}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#b8c9bd] truncate">
                      Select a new order state
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex size-6 shrink-0 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close status menu"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Status list */}
            <div className="p-1.5 space-y-0.5">
              {ORDER_STATUSES.map((statusItem) => {
                const isCurrent = statusItem.key === currentStatus
                const isDeliveredOption = statusItem.key === 'delivered'

                return (
                  <button
                    key={statusItem.key}
                    type="button"
                    role="option"
                    aria-selected={isCurrent}
                    onClick={() => handleSelect(statusItem.key)}
                    className={`group/item flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors cursor-pointer ${isCurrent
                      ? `${statusItem.activeBg} font-semibold ring-1 ring-inset ring-slate-200/60`
                      : 'hover:bg-slate-50 text-slate-700'
                      }`}
                  >
                    {/* Status Dot */}
                    <div className="pt-1">
                      <span
                        className={`block size-2 rounded-full ${statusItem.dotClass} ring-2 ring-white shadow-2xs`}
                        aria-hidden="true"
                      />
                    </div>

                    {/* Label and description */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs ${isCurrent ? 'font-bold text-slate-900' : 'font-medium text-slate-800'
                            }`}
                        >
                          {statusItem.label}
                        </span>

                        {isDeliveredOption && (
                          <span
                            className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wide bg-sky-100/80 text-sky-700"
                            title="Marking as delivered locks the order permanently"
                          >
                            <Lock size={8} />
                            Final
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-[10px] text-slate-500 line-clamp-1">
                        {statusItem.description}
                      </p>
                    </div>

                    {/* Selected Checkmark Indicator */}
                    {isCurrent && (
                      <div className="pt-0.5 text-[#193b35]">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>,
          document.getElementById('portal')
        )}
    </>
  )
}

export default OrderStatusSelector

