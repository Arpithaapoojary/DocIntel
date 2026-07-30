import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Field } from '../components/ui/primitives'
import { Button } from '../components/ui/Button'
import { extractErrorMessage } from '../lib/api'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 dark:bg-paper-dark">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="citation-tab px-2.5 py-1.5">
            <BookOpen className="h-4 w-4" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
            Create your account
          </h1>
          <p className="font-body text-sm text-ink/60 dark:text-ink-dark/60">
            The first account registered becomes the workspace admin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
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
            autoComplete="new-password"
          />
          {error && <p className="font-body text-sm text-flag dark:text-flag-light">{error}</p>}
          <Button type="submit" loading={loading} className="mt-2 w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-ink/60 dark:text-ink-dark/60">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-signal hover:underline dark:text-signal-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
