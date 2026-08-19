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
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Chat Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div>
          <h1 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            Assistant
          </h1>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
            Grounded responses based strictly on vector-indexed documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Document Scope Filter */}
          {availableDocs.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <Filter className="h-3 w-3 text-slate-400" />
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="bg-transparent font-sans text-xs font-medium text-slate-700 focus:outline-none cursor-pointer dark:text-slate-200"
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
              <Button variant="secondary" size="xs" onClick={handleDownload} title="Export Markdown">
                <Download className="h-3 w-3" />
                Export
              </Button>
              <Button variant="outline" size="xs" onClick={handleClear} title="Clear history">
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-1 py-4 space-y-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="self-end h-9 w-64 rounded-lg" />
                <Skeleton className="h-28 w-3/4 rounded-xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          /* Empty / Welcome State */
          <div className="flex h-full flex-col items-center justify-center text-center px-4 py-8 max-w-xl mx-auto">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 mb-3">
              <MessageSquare className="h-5 w-5" />
            </div>

            <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Ask anything about your documents
            </h2>
            <p className="mt-1 font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Answers are generated from semantic vector chunks with exact page citations and confidence scoring.
            </p>

            {activeDocName && (
              <div className="mt-2.5 inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <FileText className="h-3 w-3" />
                <span>Scope: <strong>{activeDocName}</strong></span>
              </div>
            )}

            {/* Prompt Suggestion Cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-left">
              {SAMPLE_PROMPTS.map((prompt, idx) => {
                const Icon = prompt.icon
                return (
                  <button
                    key={idx}
                    onClick={() => submit(prompt.text)}
                    className="flex items-center justify-between gap-2.5 rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/80 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="font-sans text-xs text-slate-700 dark:text-slate-200">
                        {prompt.text}
                      </span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* Messages List */
          <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
            {messages.map((m) => (
              <div key={m.id} className="flex flex-col gap-2">
                {/* User Bubble */}
                <div className="self-end max-w-[85%] rounded-lg bg-slate-900 px-3.5 py-2.5 text-white dark:bg-slate-800 shadow-xs">
                  <p className="font-sans text-xs sm:text-sm leading-relaxed">{m.question}</p>
                </div>

                {/* Assistant Card */}
                <div className="self-start max-w-[95%] w-full rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  {/* Header: AI Badge */}
                  <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-xs font-bold text-slate-900 dark:text-slate-100">
                        DocIntel Engine
                      </span>
                      <span className="rounded bg-slate-100 px-1 py-0.2 font-mono text-[9px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Grounded
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(m.id, m.answer)}
                        title="Copy Answer"
                        className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                      >
                        {copiedId === m.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        onClick={() => submit(m.question)}
                        title="Regenerate answer"
                        className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Markdown Answer */}
                  <MarkdownRenderer content={m.answer} />

                  {/* Grounding Confidence */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <ConfidenceMeter value={m.confidence} />
                    <span className="font-mono text-[10px] text-slate-400">
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
              <div className="self-start max-w-[90%] rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-pulse" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-pulse delay-100" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-pulse delay-200" />
                  </div>
                  <span className="font-sans text-xs text-slate-500 dark:text-slate-400">
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
      <div className="pt-2 shrink-0 max-w-3xl mx-auto w-full">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 rounded-lg border border-slate-300 bg-white p-2 shadow-xs transition-colors focus-within:border-brand-600 focus-within:ring-1 focus-within:ring-brand-600 dark:border-slate-700 dark:bg-slate-900"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedDocId
                ? `Ask about ${activeDocName}… (Press Enter)`
                : 'Ask anything about your document collection…'
            }
            className="flex-1 resize-none bg-transparent font-sans text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500 max-h-[100px] leading-relaxed p-1"
            style={{ height: '34px' }}
          />

          <Button
            type="submit"
            size="sm"
            variant="primary"
            loading={asking}
            disabled={!question.trim()}
            className="shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>

        <div className="mt-1.5 flex items-center justify-between px-1 font-mono text-[10px] text-slate-400 dark:text-slate-500">
          <span>Enter to send · Shift+Enter for newline</span>
          <span>RAG Hybrid Dense Engine</span>
        </div>
      </div>
    </div>
  )
}
