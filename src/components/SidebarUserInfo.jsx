import { useState } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { useAuth } from '../context/useAuth'

function SidebarUserInfo() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
    } catch (err) {
      console.error('Error signing out:', err)
    } finally {
      setLoading(false)
    }
  }

  const email = user?.email || 'User'
  const displayName = user?.user_metadata?.full_name || email.split('@')[0]
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="w-full">
      <p className="mb-2 pl-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a7b9ad]">
        User Profile:
      </p>
      <div className="flex items-center justify-between gap-3 rounded-xl bg-[#132c28]/80 p-2.5 ring-1 ring-white/10 shadow-sm backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative shrink-0">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#d4e8a8] text-sm font-bold text-[#183b36] shadow-inner">
              {initial}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[#193b35] bg-emerald-400"
              title="Online"
              aria-label="Online status"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white" title={displayName}>
              {displayName}
            </p>
            <p className="truncate text-[11px] text-[#a7b9ad]" title={email}>
              {email}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={loading}
          title="Sign Out"
          aria-label="Sign Out"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#c3d0c7] transition-colors hover:bg-rose-500/20 hover:text-rose-300 focus-visible:outline-2 focus-visible:outline-[#e69c78] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <LogOut size={16} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  )
}

export default SidebarUserInfo
