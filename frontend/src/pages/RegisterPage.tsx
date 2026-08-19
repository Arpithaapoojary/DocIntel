import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Lock, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Field } from '../components/ui/primitives'
import { Button } from '../components/ui/Button'
import { extractErrorMessage } from '../lib/api'

const BENEFITS = [
  'Automatic vector embeddings for PDFs, DOCX, and TXT',
  'Strict grounding with zero hallucination guarantee',
  'Multi-document synthesis with page citations',
  'First registered user receives workspace Administrator role',
]

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      {/* ── Left Hero Branding Panel ── */}
      <div className="relative hidden lg:flex lg:w-[48%] flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-950 to-primary-950 p-12 text-white">
        <div className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />

        {/* Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-indigo-500 to-accent text-white shadow-glow-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              DocIntel
            </span>
            <span className="ml-2 rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-accent-300">
              ENTERPRISE
            </span>
          </div>
        </div>

        {/* Headline & Value Props */}
        <div className="relative z-10 my-auto py-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-medium text-accent-300 border border-white/10 mb-4">
            <Zap className="h-3.5 w-3.5" />
            <span>Create Your Enterprise Workspace</span>
          </div>

          <h2 className="font-display text-4xl font-extrabold leading-tight text-white tracking-tight">
            Grounded AI intelligence for your entire document library.
          </h2>

          <p className="mt-4 font-body text-sm leading-relaxed text-slate-300 max-w-md">
            Start questioning your document collection with instant citations, high-dimensional vector search, and confidence scoring.
          </p>

          <ul className="mt-8 flex flex-col gap-3.5">
            {BENEFITS.map((b, i) => (
              <li key={i} className="flex items-center gap-3 font-body text-xs font-medium text-slate-200">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 flex items-center gap-2 font-mono text-[11px] text-slate-400 border-t border-white/10 pt-6">
          <Shield className="h-4 w-4 text-emerald-400" />
          <span>Tenant Data Isolation · Strict Grounding Guarantee</span>
        </div>
      </div>

      {/* ── Right Auth Form Panel ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent text-white shadow-glow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
              DocIntel
            </span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Create your account
            </h1>
            <p className="mt-1.5 font-body text-sm text-slate-500 dark:text-slate-400">
              Get started with your free DocIntel intelligence vault.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field
              label="Full Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Johnson"
              autoComplete="name"
            />

            <Field
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="alex@company.com"
            />

            <Field
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              hint="Must be at least 8 characters long"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/40">
                <Lock className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <p className="font-body text-xs font-medium text-red-600 dark:text-red-300">{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" variant="glow" loading={loading} className="mt-2 w-full justify-center">
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-8 text-center font-body text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-primary-600 hover:underline dark:text-primary-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
