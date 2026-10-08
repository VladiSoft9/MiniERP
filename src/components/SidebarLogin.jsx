import { useState } from 'react'
import { LogIn, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/useAuth'

function SidebarLogin() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: signInError } = await signIn(email, password)
      if (signInError) {
        setError(signInError.message)
      }
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl bg-[#132c28]/80 p-3.5 ring-1 ring-white/10 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded-md bg-white/10 text-[#d4e8a8]">
          <Lock size={13} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xs font-semibold text-white">Sign In</h2>
          <p className="text-[10px] text-[#a7b9ad]">Access ERP workspace</p>
        </div>
      </div>

      {error && (
        <div className="mb-2.5 flex items-start gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/15 p-2 text-rose-200">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-rose-400" aria-hidden="true" />
          <span className="text-[11px] leading-tight break-words">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <Mail size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7f948a]" aria-hidden="true" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-[#2d4d46] bg-[#0d221f] py-1.5 pl-8 pr-2.5 text-xs text-white placeholder:text-[#6a8075] focus:border-[#d4e8a8] focus:outline-none focus:ring-1 focus:ring-[#d4e8a8]"
          />
        </div>

        <div className="relative">
          <Lock size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7f948a]" aria-hidden="true" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-[#2d4d46] bg-[#0d221f] py-1.5 pl-8 pr-2.5 text-xs text-white placeholder:text-[#6a8075] focus:border-[#d4e8a8] focus:outline-none focus:ring-1 focus:ring-[#d4e8a8]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#d4e8a8] py-1.5 px-3 text-xs font-semibold text-[#183b36] transition-colors hover:bg-[#c2dc93] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin" aria-hidden="true" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <LogIn size={13} aria-hidden="true" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default SidebarLogin
