import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
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
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(extractErrorMessage(err, 'Incorrect email or password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 dark:bg-paper-dark">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="citation-tab px-2.5 py-1.5">
            <BookOpen className="h-4 w-4" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
            Welcome back
          </h1>
          <p className="font-body text-sm text-ink/60 dark:text-ink-dark/60">
            Sign in to ask questions about your documents.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Field
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && <p className="font-body text-sm text-flag dark:text-flag-light">{error}</p>}
          <Button type="submit" loading={loading} className="mt-2 w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-ink/60 dark:text-ink-dark/60">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-signal hover:underline dark:text-signal-dark">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
