import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layers, ArrowRight, ShieldCheck, Database, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Field } from '../components/ui/primitives'
import { Button } from '../components/ui/Button'
import { extractErrorMessage } from '../lib/api'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/')
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid email or password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Left Column: SaaS Branding Hero */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between border-r border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-brand-600">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              DocIntel
            </span>
            <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              ENTERPRISE
            </span>
          </div>
        </div>

        <div className="max-w-md space-y-6">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Precision document intelligence with zero hallucination.
          </h1>
          <p className="font-sans text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            Ingest complex PDFs and documents into semantic vector indexes. Synthesize grounded responses with exact page-level citations.
          </p>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 font-sans text-sm text-slate-700 dark:text-slate-300">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span>Strict RAG retrieval and citation grounding</span>
            </div>
            <div className="flex items-center gap-3 font-sans text-sm text-slate-700 dark:text-slate-300">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Database className="h-4 w-4" />
              </div>
              <span>Dense vector search with FAISS embeddings</span>
            </div>
            <div className="flex items-center gap-3 font-sans text-sm text-slate-700 dark:text-slate-300">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Search className="h-4 w-4" />
              </div>
              <span>Hybrid semantic & lexical passage retrieval</span>
            </div>
          </div>
        </div>

        <div className="font-mono text-xs text-slate-400 dark:text-slate-500">
          DocIntel v2.0 · Enterprise Workspace Edition
        </div>
      </div>

      {/* Right Column: Clean Authentication Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile Brand */}
          <div className="flex items-center gap-2.5 lg:hidden mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-brand-600">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">DocIntel</span>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Sign in to your account
            </h2>
            <p className="mt-1.5 font-sans text-sm text-slate-500 dark:text-slate-400">
              Enter your credentials to access your document knowledge base.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 font-sans text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
                {error}
              </div>
            )}

            <Field
              label="Work Email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />

            <Field
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              size="lg"
              variant="primary"
              loading={loading}
              className="w-full gap-2 mt-2"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-center font-sans text-sm text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2 dark:text-brand-400"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
