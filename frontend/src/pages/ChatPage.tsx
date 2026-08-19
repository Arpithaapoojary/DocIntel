import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  Send, Trash2, Copy, RefreshCw, MessageSquareText, Filter, Check,
  Zap, Sparkles, Download, FileText, Layers, ChevronRight
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
  { icon: Sparkles, text: 'Provide an executive summary of the entire document' },
  { icon: Layers, text: 'What are the main policies, obligations, and guidelines?' },
  { icon: FileText, text: 'Extract key numerical metrics, statistics, and dates' },
  { icon: MessageSquareText, text: 'What are the primary risk factors and next steps?' },
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
    if (!confirm('Clear your conversation history? This cannot be undone.')) return
    try {
      await clearHistory()
      setMessages([])
      notify('Conversation cleared.')
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
      {/* ── Chat Header Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-accent text-white shadow-glow-sm">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              AI Knowledge Assistant
            </h1>
            <p className="font-body text-xs text-slate-500 dark:text-slate-400">
              Grounded strictly on your uploaded files with verified citations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Document Scope Filter */}
          {availableDocs.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <Filter className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="bg-transparent font-body text-xs font-medium text-slate-700 focus:outline-none cursor-pointer dark:text-slate-200"
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
              <Button variant="secondary" size="sm" onClick={handleDownload} title="Export conversation as Markdown">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleClear} title="Clear chat history">
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Conversation Message Stream ── */}
      <div className="flex-1 overflow-y-auto px-1 py-6 space-y-6">
        {loading ? (
          <div className="flex flex-col gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="self-end max-w-sm w-full">
                  <Skeleton className="h-12 rounded-2xl" />
                </div>
                <Skeleton className="h-36 w-4/5 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          /* Empty / Welcome State */
          <div className="flex h-full flex-col items-center justify-center text-center px-4 py-8 max-w-2xl mx-auto animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/15 via-indigo-500/10 to-accent-500/15 border border-primary-500/20 shadow-glow-sm mb-4">
              <Sparkles className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>

            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
              Ask anything about your documents
            </h2>
            <p className="mt-2 font-body text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              DocIntel parses your documents into semantic vector chunks and provides exact source citations for every synthesized insight.
            </p>

            {/* Document Context Chip */}
            {activeDocName && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 font-body text-xs font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-950/60 dark:text-primary-300">
                <FileText className="h-3.5 w-3.5" />
                <span>Focused on: <strong>{activeDocName}</strong></span>
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
                    className="group flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 text-left transition-all duration-200 hover:border-primary/40 hover:bg-primary-50/30 hover:shadow-card-hover hover:-translate-y-0.5 dark:border-slate-800/90 dark:bg-slate-900 dark:hover:border-primary/50 dark:hover:bg-slate-800/80 shadow-xs"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-primary-100 group-hover:text-primary-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-primary-950 dark:group-hover:text-primary-300 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                        {prompt.text}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-primary-500 transition-colors" />
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* Messages List */
          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
            {messages.map((m) => (
              <div key={m.id} className="flex flex-col gap-3 animate-fade-in-up">
                {/* User Message Bubble */}
                <div className="self-end max-w-[80%]">
                  <div className="bubble-user">
                    <p className="font-body text-sm leading-relaxed">{m.question}</p>
                  </div>
                </div>

                {/* Assistant Message Bubble */}
                <div className="self-start max-w-[92%] w-full">
                  <div className="bubble-assistant">
                    {/* Header: AI Badge */}
                    <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-accent text-white shadow-xs">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-display text-xs font-bold text-slate-900 dark:text-slate-100">
                          DocIntel Intelligence
                        </span>
                        <span className="rounded bg-emerald-50 px-1.5 py-0.2 font-mono text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Grounded
                        </span>
                      </div>

                      {/* Quick Copy / Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(m.id, m.answer)}
                          title="Copy Answer"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                        >
                          {copiedId === m.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => submit(m.question)}
                          title="Regenerate answer"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Markdown Answer Content */}
                    <MarkdownRenderer content={m.answer} />

                    {/* Footer: Confidence Meter */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <ConfidenceMeter value={m.confidence} />
                      <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Grounded Citation Tabs */}
                    <CitationTabs sources={m.sources} />
                  </div>
                </div>
              </div>
            ))}

            {/* Real-time Asking State */}
            {asking && (
              <div className="self-start max-w-[90%] animate-fade-in">
                <div className="bubble-assistant">
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="font-body text-xs font-medium text-slate-500 dark:text-slate-400">
                      Searching vector store & synthesizing grounded answer…
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Bottom Floating Dock Input ── */}
      <div className="pt-3 pb-1 shrink-0 max-w-4xl mx-auto w-full">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-3 rounded-2xl border border-slate-300/90 bg-white p-3 shadow-lg transition-all duration-200 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10 dark:border-slate-700/80 dark:bg-slate-900 dark:focus-within:border-primary-500"
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
                : 'Ask anything about your document collection… (Enter to send)'
            }
            className="flex-1 resize-none bg-transparent font-body text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500 max-h-[120px] leading-relaxed"
            style={{ height: '38px' }}
          />

          <Button
            type="submit"
            size="md"
            variant="glow"
            loading={asking}
            disabled={!question.trim()}
            className="shrink-0 self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-2 flex items-center justify-between px-2 font-mono text-[10px] text-slate-400 dark:text-slate-500">
          <span>Shift+Enter for newline · Enter to ask</span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary-500" />
            AI RAG Synthesizer v2.4
          </span>
        </div>
      </div>
    </div>
  )
}
