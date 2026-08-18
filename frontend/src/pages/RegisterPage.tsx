import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Field } from '../components/ui/primitives'
import { Button } from '../components/ui/Button'
import { extractErrorMessage } from '../lib/api'

const BENEFITS = [
  'No credit card required',
  'Upload unlimited documents',
  'Instant AI-powered answers',
]

export function RegisterPage() {
  const { register } = useAuth()
  const navigate      = useNavigate()
  const [fullName,  setFullName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await register(email, fullName, password)
      navigate('/')
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create your account.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-paper dark:bg-paper-dark">
      {/* ── Left panel ── */}
      <div className="relative hidden lg:flex lg:w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-accent/70 p-12">
        <div className="pointer-events-none absolute -right-16 top-1/4 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-primary-300/15 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="font-display text-lg font-bold text-white tracking-tight">DocIntel</span>
        </div>

        {/* Headline */}
        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight text-white">
            Your documents.<br />Your intelligence.<br />Your answers.
          </h2>
          <p className="mt-4 font-body text-sm text-white/70 leading-relaxed max-w-xs">
            Create a free account and start getting AI-powered answers from your documents in minutes.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3 font-body text-sm text-white/85">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/30">
                  <ArrowRight className="h-3 w-3 text-white" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-[11px] uppercase tracking-widest text-white/40">
          First account becomes workspace admin
        </p>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow-sm">
              <Zap className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="font-display text-base font-bold text-ink dark:text-ink-dark">DocIntel</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-ink dark:text-ink-dark tracking-tight">
              Create your account
            </h1>
            <p className="mt-1.5 font-body text-sm text-ink/55 dark:text-ink-dark/55">
              Get started for free — no credit card needed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field
              label="Full name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              autoComplete="name"
            />
            <Field
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              hint="Must be at least 8 characters"
            />
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/8 px-3.5 py-2.5">
                <Lock className="h-3.5 w-3.5 shrink-0 text-danger" />
                <p className="font-body text-sm text-danger">{error}</p>
              </div>
            )}
            <Button type="submit" size="lg" loading={loading} className="mt-2 w-full justify-center">
              Create account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center font-body text-sm text-ink/55 dark:text-ink-dark/55">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary-600 dark:text-primary-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
