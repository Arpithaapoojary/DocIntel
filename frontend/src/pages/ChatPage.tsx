import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Send, Trash2, Copy, RefreshCw, MessageSquareText, Filter } from 'lucide-react'
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
  const bottomRef = useRef<HTMLDivElement>(null)

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
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submit(question)
  }

  async function handleClear() {
    if (!confirm('Clear your entire conversation history? This cannot be undone.')) return
    await clearHistory()
    setMessages([])
    notify('Conversation cleared.')
  }

  function handleCopy(answer: string) {
    navigator.clipboard.writeText(answer)
    notify('Answer copied to clipboard.')
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
      <div className="flex flex-wrap items-center justify-between pb-4 gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">Ask</h1>
          <p className="mt-1 font-body text-sm text-ink/60 dark:text-ink-dark/60">
            Answers are grounded strictly in your uploaded documents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {availableDocs.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-ink/70 dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark/70">
              <Filter className="h-3.5 w-3.5 text-ink/40 dark:text-ink-dark/40" />
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="bg-transparent font-body focus:outline-none cursor-pointer"
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

      <div className="flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<MessageSquareText className="h-8 w-8" />}
            title="No questions yet"
            description='Try asking something like "What does this document say about pricing?"'
          />
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((m) => (
              <div key={m.id} className="flex flex-col gap-3">
                <div className="self-end max-w-[80%] rounded-lg rounded-br-sm bg-signal px-4 py-2.5 font-body text-sm text-white dark:bg-signal-dark dark:text-paper-dark shadow-sm">
                  {m.question}
                </div>
                <div className="max-w-[85%] rounded-lg rounded-bl-sm border border-line bg-surface px-4 py-3.5 dark:border-line-dark dark:bg-surface-dark shadow-sm">
                  <MarkdownRenderer content={m.answer} />
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-line/40 pt-2.5 dark:border-line-dark/40">
                    <ConfidenceMeter value={m.confidence} />
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleCopy(m.answer)}
                        aria-label="Copy answer"
                        className="rounded p-1.5 text-ink/40 hover:bg-paper hover:text-ink dark:text-ink-dark/40 dark:hover:bg-paper-dark dark:hover:text-ink-dark transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => submit(m.question)}
                        aria-label="Regenerate answer"
                        className="rounded p-1.5 text-ink/40 hover:bg-paper hover:text-ink dark:text-ink-dark/40 dark:hover:bg-paper-dark dark:hover:text-ink-dark transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <CitationTabs sources={m.sources} />
                </div>
              </div>
            ))}
            {asking && (
              <div className="max-w-[85%] rounded-lg rounded-bl-sm border border-line bg-surface px-4 py-3.5 dark:border-line-dark dark:bg-surface-dark">
                <div className="flex items-center gap-2 text-ink/50 dark:text-ink-dark/50 font-body text-sm">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-signal dark:bg-signal-dark" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-signal [animation-delay:0.15s] dark:bg-signal-dark" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-signal [animation-delay:0.3s] dark:bg-signal-dark" />
                  </div>
                  <span>Searching documents and generating response…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 border-t border-line pt-4 dark:border-line-dark">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={
            selectedDocId
              ? `Ask about ${availableDocs.find((d) => d.id === selectedDocId)?.original_filename}…`
              : 'Ask a question about your documents…'
          }
          className="flex-1 rounded-md border border-line bg-surface px-3.5 py-2.5 font-body text-sm text-ink placeholder:text-ink/40 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark dark:placeholder:text-ink-dark/40"
        />
        <Button type="submit" loading={asking} disabled={!question.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

