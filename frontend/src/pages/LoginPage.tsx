import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, ArrowRight, Eye, EyeOff, Layers, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Field } from '../components/ui/primitives'
import { Button } from '../components/ui/Button'
import { extractErrorMessage } from '../lib/api'

const HIGHLIGHTS = [
  'Automatic vector chunking and dense semantic embeddings',
  'Multi-document grounded Q&A with verifiable page citations',
  'Hybrid semantic similarity and exact keyword search',
  'Isolated tenant repository and local SQLite vector storage',
]

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(extractErrorMessage(err, 'Incorrect email or password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Left Feature Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between border-r border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-brand-600">
            <Layers className="h-4 w-4" />
          </div>
          <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            DocIntel
          </span>
          <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Platform
          </span>
        </div>

        {/* Value Props */}
        <div className="my-auto py-12 max-w-md">
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Grounded intelligence for your document repository.
          </h2>
          <p className="mt-3 font-sans text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Extract insights and synthesize answers across hundreds of pages with verified source citations and zero hallucinations.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {HIGHLIGHTS.map((h, i) => (
              <li key={i} className="flex items-center gap-2.5 font-sans text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Local Embeddings · Tenant Isolation · AES Protection</span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile Brand */}
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-brand-600">
              <Layers className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
              DocIntel
            </span>
          </div>

          <div className="mb-6">
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
              Sign in to your account
            </h1>
            <p className="mt-1 font-sans text-xs text-slate-500 dark:text-slate-400">
              Enter your credentials to access the workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <Field
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="name@company.com"
            />

            <Field
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
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
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 dark:border-rose-900/50 dark:bg-rose-950/40">
                <Lock className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <p className="font-sans text-xs font-medium text-rose-600 dark:text-rose-300">{error}</p>
              </div>
            )}

            <Button type="submit" size="md" variant="primary" loading={loading} className="mt-1 w-full justify-center">
              Sign in
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </form>

          <p className="mt-6 text-center font-sans text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
