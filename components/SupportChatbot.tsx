'use client'

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Message = { id: string; role: 'user' | 'assistant'; content: string }
type AssistantMode = 'ai' | 'faq' | 'unknown'

const quickQuestions = [
  'Help me create my store',
  'What do the plans cost?',
  'How do customer orders work?',
]

const makeMessage = (role: Message['role'], content: string): Message => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  content,
})

export function SupportChatbot() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<AssistantMode>('unknown')
  const [messages, setMessages] = useState<Message[]>([
    makeMessage('assistant', 'Assalamu alaikum! I’m your DukaanWhats guide. I can help you set up a store, understand plans, add products, and manage orders. What would you like help with?'),
  ])
  const endOfMessages = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open) return
    endOfMessages.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy, open])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    inputRef.current?.focus()
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  if (pathname?.startsWith('/admin')) return null

  const sendMessage = async (rawText: string) => {
    const text = rawText.trim()
    if (!text || busy || text.length > 1200) return
    const history = [...messages, makeMessage('user', text)].slice(-10)
    setMessages(history)
    setInput('')
    setBusy(true)
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || typeof result?.answer !== 'string') {
        throw new Error(result?.error || 'I couldn’t answer that just now. Please try again.')
      }
      setMode(result.mode === 'ai' ? 'ai' : 'faq')
      setMessages(current => [...current, makeMessage('assistant', result.answer)])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'I couldn’t answer that just now. Please try again.'
      setMessages(current => [...current, makeMessage('assistant', message)])
    } finally {
      setBusy(false)
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage(input)
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage(input)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[120] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section role="dialog" aria-modal="false" aria-labelledby="dw-assistant-title" className="flex h-[min(640px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-[24px] border border-zinc-200 bg-white text-zinc-950 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.35)]">
          <header className="flex items-center gap-3 bg-[#0A0A0A] px-4 py-4 text-white">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[#E8FF86] text-lg text-black" aria-hidden="true">✦</span>
            <div className="min-w-0 flex-1">
              <h2 id="dw-assistant-title" className="truncate text-sm font-bold">DukaanWhats Guide</h2>
              <p className="mt-0.5 text-[11px] text-white/65">Store setup, plans, products & orders</p>
            </div>
            {mode !== 'unknown' && <span className="rounded-full border border-white/15 px-2 py-1 text-[9px] font-semibold text-white/75">{mode === 'ai' ? 'AI assistant' : 'Instant FAQ'}</span>}
            <button type="button" aria-label="Close chat" onClick={() => setOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xl text-white/75 transition hover:bg-white/10 hover:text-white">×</button>
          </header>

          <div className="flex flex-wrap gap-2 border-b border-zinc-100 px-4 py-3">
            <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-full bg-zinc-100 px-3 py-1.5 text-[10px] font-semibold text-zinc-700 hover:bg-[#E8FF86]">Set up my store</Link>
            <Link href="/pricing" onClick={() => setOpen(false)} className="rounded-full bg-zinc-100 px-3 py-1.5 text-[10px] font-semibold text-zinc-700 hover:bg-[#E8FF86]">Plans & pricing</Link>
            <Link href="/s/premiumstore" onClick={() => setOpen(false)} className="rounded-full bg-zinc-100 px-3 py-1.5 text-[10px] font-semibold text-zinc-700 hover:bg-[#E8FF86]">Demo store</Link>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#FAFAF8] px-4 py-4" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Chat messages">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p dir="auto" className={`max-w-[88%] whitespace-pre-wrap break-words rounded-[18px] px-3.5 py-3 text-[12px] leading-[1.65] ${message.role === 'user' ? 'rounded-br-md bg-black text-white' : 'rounded-bl-md border border-zinc-200/80 bg-white text-zinc-700 shadow-sm'}`}>
                  {message.content}
                </p>
              </div>
            ))}
            {messages.length === 1 && !busy && (
              <div className="flex flex-col items-start gap-2 pt-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Popular questions</span>
                {quickQuestions.map(question => <button key={question} type="button" onClick={() => void sendMessage(question)} className="max-w-full rounded-full border border-zinc-200 bg-white px-3 py-2 text-left text-[11px] font-medium text-zinc-700 transition hover:border-zinc-400">{question}</button>)}
              </div>
            )}
            {busy && <p role="status" className="w-fit rounded-[18px] rounded-bl-md border border-zinc-200 bg-white px-3.5 py-3 text-[11px] text-zinc-500">Thinking…</p>}
            <div ref={endOfMessages} />
          </div>

          <form onSubmit={submit} className="border-t border-zinc-200 bg-white p-3">
            <div className="flex items-end gap-2 rounded-[18px] border border-zinc-200 bg-zinc-50 p-2 focus-within:border-zinc-400">
              <label htmlFor="dw-assistant-input" className="sr-only">Ask the DukaanWhats guide</label>
              <textarea
                id="dw-assistant-input"
                ref={inputRef}
                value={input}
                onChange={event => setInput(event.target.value.slice(0, 1200))}
                onKeyDown={handleInputKeyDown}
                rows={1}
                maxLength={1200}
                placeholder="Ask a question…"
                disabled={busy}
                className="max-h-24 min-h-9 flex-1 resize-y bg-transparent px-2 py-2 text-xs leading-5 outline-none placeholder:text-zinc-400 disabled:opacity-60"
              />
              <button type="submit" aria-label="Send message" disabled={busy || !input.trim()} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black text-[#E8FF86] transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40">↑</button>
            </div>
            <p className="mt-2 text-center text-[9px] leading-4 text-zinc-400">When AI is enabled, messages may be processed by Google Gemini or OpenAI. Don’t share passwords, OTPs, payment details, or customer private information.</p>
          </form>
        </section>
      )}

      <button type="button" aria-label={open ? 'Close DukaanWhats help chat' : 'Open DukaanWhats help chat'} aria-expanded={open} onClick={() => setOpen(value => !value)} className="flex h-14 items-center gap-2 rounded-full bg-[#0A0A0A] px-5 text-sm font-semibold text-white shadow-[0_12px_35px_-10px_rgba(0,0,0,0.45)] transition hover:bg-zinc-800 focus-visible:outline-offset-4">
        <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-[#E8FF86] text-sm text-black">{open ? '×' : '✦'}</span>
        <span>{open ? 'Close help' : 'Ask us'}</span>
      </button>
    </div>
  )
}
