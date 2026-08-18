import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Send, Trash2, Copy, RefreshCw, MessageSquareText, Filter, CheckCheck } from 'lucide-react'
import { askQuestion, clearHistory, extractErrorMessage, getHistory, listDocuments } from '../lib/api'
import type { ChatMessageItem, DocumentItem } from '../types'
import { Button } from '../components/ui/Button'
import { EmptyState, Skeleton } from '../components/ui/primitives'
import { CitationTabs } from '../components/CitationTabs'
import { ConfidenceMeter } from '../components/ConfidenceMeter'
import { MarkdownRenderer } from '../components/MarkdownRenderer'
import { useToast } from '../contexts/ToastContext'

export function ChatPage() {
  const { notify } = useToast()
  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [question, setQuestion] = useState('')
  const [availableDocs, setAvailableDocs] = useState<DocumentItem[]>([])
  const [selectedDocId, setSelectedDocId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [asking, setAsking] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    Promise.all([getHistory(), listDocuments()])
      .then(([h, d]) => {
        setMessages(h.reverse())
        setAvailableDocs(d.documents.filter((doc) => doc.status === 'ready'))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, asking])

  async function submit(q: string) {
    if (!q.trim() || asking) return
    setAsking(true)
    setQuestion('')
    const docIds = selectedDocId ? [selectedDocId] : undefined
    try {
      const res = await askQuestion(q, docIds)
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          question: q,
          answer: res.answer,
          confidence: res.confidence,
          sources: res.sources,
          created_at: new Date().toISOString(),
        },
      ])
    } catch (err) {
      notify(extractErrorMessage(err, 'Could not get an answer.'), 'error')
      setQuestion(q)
    } finally {
      setAsking(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submit(question)
  }

  // Allow Shift+Enter for newline, Enter to submit
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(question)
    }
  }

  async function handleClear() {
    if (!confirm('Clear your entire conversation history? This cannot be undone.')) return
    await clearHistory()
    setMessages([])
    notify('Conversation cleared.')
  }

  function handleCopy(id: string, answer: string) {
    navigator.clipboard.writeText(answer)
    setCopiedId(id)
    notify('Answer copied to clipboard.')
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleDownload() {
    const text = messages
      .map((m) => `Q: ${m.question}\nA: ${m.answer}\nConfidence: ${m.confidence.toFixed(0)}%\n`)
      .join('\n---\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'conversation.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between pb-5 gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink dark:text-ink-dark tracking-tight">
            Ask <span className="gradient-text">Anything</span>
          </h1>
          <p className="mt-1 font-body text-sm text-ink/55 dark:text-ink-dark/55">
            Answers are grounded strictly in your uploaded documents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {availableDocs.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-line/60 bg-surface px-3 py-2 text-xs dark:border-line-dark dark:bg-surface-dark shadow-sm">
              <Filter className="h-3.5 w-3.5 text-primary/60" />
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="bg-transparent font-body text-sm text-ink/80 focus:outline-none cursor-pointer dark:text-ink-dark/80"
              >
                <option value="">All Documents ({availableDocs.length})</option>
                {availableDocs.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.original_filename}
                  </option>
                ))}
              </select>
            </div>
          )}
          {messages.length > 0 && (
            <>
              <Button variant="secondary" size="sm" onClick={handleDownload}>
                Download
              </Button>
              <Button variant="secondary" size="sm" onClick={handleClear}>
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto pr-1 pb-2">
        {loading ? (
          <div className="flex flex-col gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="self-end">
                  <Skeleton className="h-10 w-56" />
                </div>
                <Skeleton className="h-28 w-4/5" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={<MessageSquareText className="h-7 w-7" />}
              title="No questions yet"
              description='Try asking something like "What does this document say about pricing?"'
            />
          </div>
        ) : (
          <div className="flex flex-col gap-7">
            {messages.map((m) => (
              <div key={m.id} className="flex flex-col gap-3 animate-fade-in-up">
                {/* User bubble */}
                <div className="self-end max-w-[78%]">
                  <div className="bubble-user font-body text-sm leading-relaxed">
                    {m.question}
                  </div>
                </div>

                {/* Assistant bubble */}
                <div className="max-w-[88%]">
                  <div className="bubble-assistant">
                    <MarkdownRenderer content={m.answer} />

                    {/* Footer: confidence + actions */}
                    <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-line/40 pt-3 dark:border-line-dark/40">
                      <ConfidenceMeter value={m.confidence} />
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => handleCopy(m.id, m.answer)}
                          aria-label="Copy answer"
                          title="Copy answer"
                          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-ink/40 hover:bg-primary/8 hover:text-primary dark:text-ink-dark/40 dark:hover:bg-primary/12 dark:hover:text-primary-300 transition-all duration-150"
                        >
                          {copiedId === m.id
                            ? <CheckCheck className="h-3.5 w-3.5 text-success" />
                            : <Copy className="h-3.5 w-3.5" />
                          }
                        </button>
                        <button
                          onClick={() => submit(m.question)}
                          aria-label="Regenerate answer"
                          title="Regenerate"
                          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-ink/40 hover:bg-primary/8 hover:text-primary dark:text-ink-dark/40 dark:hover:bg-primary/12 dark:hover:text-primary-300 transition-all duration-150"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <CitationTabs sources={m.sources} />
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {asking && (
              <div className="max-w-[88%] animate-fade-in">
                <div className="bubble-assistant">
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="font-body text-sm text-ink/50 dark:text-ink-dark/50">
                      Searching documents…
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="pt-4">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-3 rounded-2xl border border-line/60 bg-surface p-3 shadow-card transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-glow-sm dark:border-line-dark dark:bg-surface-dark dark:focus-within:border-primary/40"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value)
              // Auto-grow: reset and then set to scrollHeight
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedDocId
                ? `Ask about ${availableDocs.find((d) => d.id === selectedDocId)?.original_filename}…`
                : 'Ask a question about your documents… (Enter to send)'
            }
            className="flex-1 resize-none bg-transparent font-body text-sm text-ink placeholder:text-ink/35 focus:outline-none dark:text-ink-dark dark:placeholder:text-ink-dark/35 max-h-[120px] leading-relaxed"
            style={{ height: '36px' }}
          />
          <Button
            type="submit"
            size="md"
            loading={asking}
            disabled={!question.trim()}
            className="shrink-0 self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-1.5 text-center font-mono text-[10px] text-ink/30 dark:text-ink-dark/30">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  )
}
