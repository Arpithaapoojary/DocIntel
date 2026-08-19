import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  Send, Trash2, Copy, RefreshCw, MessageSquare, Filter, Check,
  Download, FileText, ChevronRight, Layers, Database
} from 'lucide-react'
import { askQuestion, clearHistory, extractErrorMessage, getHistory, listDocuments } from '../lib/api'
import type { ChatMessageItem, DocumentItem } from '../types'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/primitives'
import { CitationTabs } from '../components/CitationTabs'
import { ConfidenceMeter } from '../components/ConfidenceMeter'
import { MarkdownRenderer } from '../components/MarkdownRenderer'
import { useToast } from '../contexts/ToastContext'

const SAMPLE_PROMPTS = [
  { icon: FileText, text: 'Provide an executive summary of this document' },
  { icon: Layers, text: 'What are the main policies and obligations outlined?' },
  { icon: Database, text: 'Extract key statistics, metrics, and numerical dates' },
  { icon: MessageSquare, text: 'Identify the primary risk factors and next steps' },
]

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
  const inputRef = useRef<HTMLTextAreaElement>(null)

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
      notify(extractErrorMessage(err, 'Could not retrieve an answer.'), 'error')
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(question)
    }
  }

  async function handleClear() {
    if (!confirm('Clear conversation history? This cannot be undone.')) return
    try {
      await clearHistory()
      setMessages([])
      notify('Conversation history cleared.')
    } catch (err) {
      notify(extractErrorMessage(err, 'Could not clear history.'), 'error')
    }
  }

  function handleCopy(id: string, answer: string) {
    navigator.clipboard.writeText(answer)
    setCopiedId(id)
    notify('Answer copied to clipboard.')
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleDownload() {
    const text = messages
      .map((m) => `# Question:\n${m.question}\n\n## Answer:\n${m.answer}\n\nConfidence: ${m.confidence.toFixed(0)}%\nSources: ${m.sources.map(s => `${s.document_name} (p.${s.page})`).join(', ')}\n\n---\n`)
      .join('\n')
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DocIntel_Chat_${new Date().toISOString().slice(0,10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const activeDocName = availableDocs.find((d) => d.id === selectedDocId)?.original_filename

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col">
      {/* Chat Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div>
          <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            Assistant
          </h1>
          <p className="font-sans text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Grounded responses based strictly on vector-indexed documents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Document Scope Filter */}
          {availableDocs.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="bg-transparent font-sans text-xs sm:text-sm font-medium text-slate-700 focus:outline-none cursor-pointer dark:text-slate-200"
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
              <Button variant="secondary" size="sm" onClick={handleDownload} title="Export Markdown" className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleClear} title="Clear history" className="gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-1 py-6 space-y-6">
        {loading ? (
          <div className="flex flex-col gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="self-end h-11 w-72 rounded-lg" />
                <Skeleton className="h-36 w-4/5 rounded-xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          /* Empty / Welcome State */
          <div className="flex h-full flex-col items-center justify-center text-center px-4 py-8 max-w-2xl mx-auto">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 mb-4 shadow-xs">
              <MessageSquare className="h-7 w-7" />
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Ask anything about your documents
            </h2>
            <p className="mt-2 font-sans text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
              Answers are synthesized from semantic vector chunks with exact page citations and confidence scoring.
            </p>

            {activeDocName && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <FileText className="h-3.5 w-3.5" />
                <span>Scope: <strong>{activeDocName}</strong></span>
              </div>
            )}

            {/* Prompt Suggestion Cards */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {SAMPLE_PROMPTS.map((prompt, idx) => {
                const Icon = prompt.icon
                return (
                  <button
                    key={idx}
                    onClick={() => submit(prompt.text)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/80 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="h-5 w-5 shrink-0 text-slate-400" />
                      <span className="font-sans text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                        {prompt.text}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* Messages List */
          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
            {messages.map((m) => (
              <div key={m.id} className="flex flex-col gap-2.5">
                {/* User Bubble */}
                <div className="self-end max-w-[85%] rounded-xl bg-slate-900 px-4 py-3 text-white dark:bg-slate-800 shadow-xs">
                  <p className="font-sans text-sm sm:text-base leading-relaxed">{m.question}</p>
                </div>

                {/* Assistant Card */}
                <div className="self-start max-w-[96%] w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
                        DocIntel Engine
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Grounded
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(m.id, m.answer)}
                        title="Copy Answer"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                      >
                        {copiedId === m.id ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => submit(m.question)}
                        title="Regenerate answer"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Markdown Answer */}
                  <MarkdownRenderer content={m.answer} />

                  {/* Grounding Confidence */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <ConfidenceMeter value={m.confidence} />
                    <span className="font-mono text-xs text-slate-400">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Citations */}
                  <CitationTabs sources={m.sources} />
                </div>
              </div>
            ))}

            {/* Real-time Asking State */}
            {asking && (
              <div className="self-start max-w-[90%] rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-600 animate-pulse" />
                    <span className="h-2 w-2 rounded-full bg-slate-600 animate-pulse delay-100" />
                    <span className="h-2 w-2 rounded-full bg-slate-600 animate-pulse delay-200" />
                  </div>
                  <span className="font-sans text-sm text-slate-500 dark:text-slate-400">
                    Retrieving vector chunks and synthesizing grounded answer…
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Docked Input Box */}
      <div className="pt-3 shrink-0 max-w-4xl mx-auto w-full">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-3 rounded-xl border border-slate-300 bg-white p-3 shadow-xs transition-colors focus-within:border-brand-600 focus-within:ring-1 focus-within:ring-brand-600 dark:border-slate-700 dark:bg-slate-900"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedDocId
                ? `Ask about ${activeDocName}… (Press Enter)`
                : 'Ask anything about your document collection…'
            }
            className="flex-1 resize-none bg-transparent font-sans text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500 max-h-[120px] leading-relaxed p-1"
            style={{ height: '38px' }}
          />

          <Button
            type="submit"
            size="md"
            variant="primary"
            loading={asking}
            disabled={!question.trim()}
            className="shrink-0 self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-2 flex items-center justify-between px-2 font-mono text-xs text-slate-400 dark:text-slate-500">
          <span>Enter to send · Shift+Enter for newline</span>
          <span>RAG Hybrid Dense Engine</span>
        </div>
      </div>
    </div>
  )
}
