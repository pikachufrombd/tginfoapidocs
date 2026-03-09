
import { useEffect, useMemo, useState } from "react"
import { motion, useScroll, useSpring } from "framer-motion"
import {
  ShieldCheck,
  Link as LinkIcon,
  Copyright,
  Send,
  Copy,
  Check,
  Play,
} from "lucide-react"

const baseUrl = "https://tgusernameinfo.shahadathassan.workers.dev/"
const exampleUrl = `${baseUrl}?username=@listkiss&key=TGINFO-6129625814-466242`

const jsonResponse = `{
  "ok": true,
  "remaining_lookups": 3.2456789087654323e+114,
  "target": "@listkiss",
  "data": {
    "id": "6129625814",
    "country": "Bangladesh",
    "number": "+8801861214924",
    "join": "team_sixtynine.t.me",
    "batch": 13,
    "username": "listkiss",
    "full_name": "Shahadat Hassan",
    "last_seen": "HIDDEN"
  }
}`

function buildLookupUrl(username: string, apiKey: string) {
  const params = new URLSearchParams({
    username,
    key: apiKey,
  })
  return `${baseUrl}?${params.toString()}`
}

function normalizeUsername(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`
}

function copyWithExecCommand(text: string) {
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "true")
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  textarea.style.pointerEvents = "none"
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  let copied = false
  try {
    copied = document.execCommand("copy")
  } catch {
    copied = false
  }

  document.body.removeChild(textarea)
  return copied
}

async function safeCopyText(text: string) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {}

  return copyWithExecCommand(text)
}

function JsonHighlighter({ json }: { json: string }) {
  const html = useMemo(() => {
    const escaped = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

    return escaped.replace(
      /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"\s*:?)|(\btrue\b|\bfalse\b|\bnull\b)|(-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?)/g,
      (match) => {
        if (/^".*":$/.test(match)) {
          return `<span class="text-violet-300">${match}</span>`
        }
        if (/^".*"$/.test(match)) {
          return `<span class="text-emerald-300">${match}</span>`
        }
        if (/true|false|null/.test(match)) {
          return `<span class="text-sky-300">${match}</span>`
        }
        return `<span class="text-amber-300">${match}</span>`
      }
    )
  }, [json])

  return (
    <pre className="overflow-x-auto px-4 py-4 text-xs leading-7 text-white/90 sm:px-5 sm:text-sm">
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  )
}

function LoadingScreen() {
  const [progress, setProgress] = useState(8)

  useEffect(() => {
    const steps = [18, 32, 49, 67, 82, 96, 100]
    let index = 0

    const timer = setInterval(() => {
      setProgress(steps[index])
      index += 1
      if (index >= steps.length) clearInterval(timer)
    }, 120)

    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <div className="w-[88%] max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/45">Loading</p>
            <h2 className="text-lg font-semibold text-white">Preparing API docs</h2>
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-white/55">
          <span>Rendering components</span>
          <span>{progress}%</span>
        </div>
      </div>
    </motion.div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.25em] text-white/40 sm:text-sm">
      {children}
    </p>
  )
}

function CopyButton({
  label,
  copied,
  onClick,
  compact = false,
}: {
  label: string
  copied: boolean
  onClick: () => void
  compact?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 text-white/75 transition hover:text-white ${compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-xs sm:text-sm"}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  )
}

export default function TGInfoLookupDocs() {
  const [copied, setCopied] = useState("")
  const [copyNotice, setCopyNotice] = useState("")
  const [username, setUsername] = useState("@listkiss")
  const [apiKey, setApiKey] = useState("TGINFO-6129625814-466242")
  const [liveResult, setLiveResult] = useState<string | null>(null)
  const [liveLoading, setLiveLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 20,
    restDelta: 0.001,
  })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1100)
    return () => clearTimeout(timer)
  }, [])

  const showCopiedState = (id: string, ok: boolean) => {
    if (ok) {
      setCopied(id)
      setCopyNotice("Copied to clipboard")
      window.setTimeout(() => setCopied(""), 1500)
    } else {
      setCopyNotice("Clipboard unavailable")
    }
    window.setTimeout(() => setCopyNotice(""), 2200)
  }

  const handleCopy = async (text: string, id: string) => {
    const ok = await safeCopyText(text)
    showCopiedState(id, ok)
  }

  const runLive = async () => {
    const safeUsername = normalizeUsername(username)

    if (!safeUsername || !apiKey.trim()) {
      setLiveResult(JSON.stringify({ error: "Username and API key required" }, null, 2))
      return
    }

    setLiveLoading(true)

    try {
      const url = buildLookupUrl(safeUsername, apiKey.trim())
      const res = await fetch(url)
      const data = await res.json()
      setLiveResult(JSON.stringify(data, null, 2))
    } catch {
      setLiveResult(JSON.stringify({ error: "Request failed" }, null, 2))
    } finally {
      setLiveLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 right-0 top-0 z-40 h-1 origin-left bg-white"
      />

      {loading && <LoadingScreen />}

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-24">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="mb-5 text-xs uppercase tracking-[0.3em] text-white/50 sm:text-sm">
                TG Info Lookup API
              </p>

              <h1 className="max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Telegram username info lookup,
                <span className="block text-white/60">clean and simple.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                A lightweight API that returns Telegram account lookup details from a username.
                Send a username and API key, get structured JSON back.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <a
                href="#quickstart"
                className="rounded-full border border-white/20 px-4 py-3 text-sm font-medium transition hover:border-white/40 hover:bg-white hover:text-black sm:px-5"
              >
                Read docs
              </a>
              <a
                href="#response"
                className="rounded-full border border-white/10 px-4 py-3 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white sm:px-5"
              >
                View response
              </a>
            </div>
          </div>

          {copyNotice && (
            <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/75">
              {copyNotice}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-12 md:gap-12 md:px-10 md:py-16 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-white/40">
              Contents
            </p>
            <nav className="grid grid-cols-2 gap-3 text-sm text-white/70 sm:grid-cols-3 lg:grid-cols-1">
              <a className="hover:text-white" href="#overview">Overview</a>
              <a className="hover:text-white" href="#quickstart">Quickstart</a>
              <a className="hover:text-white" href="#endpoint">Endpoint</a>
              <a className="hover:text-white" href="#parameters">Parameters</a>
              <a className="hover:text-white" href="#response">Response</a>
            </nav>
          </div>
        </aside>

        <main className="min-w-0 space-y-12 sm:space-y-14 md:space-y-16">
          <section id="overview" className="space-y-4">
            <SectionLabel>Overview</SectionLabel>
            <h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
              One endpoint. Straight to the point.
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8 md:text-lg">
              The API returns Telegram-related lookup data from a username and access key.
              This page includes a live request runner, copy helpers, and formatted JSON output.
            </p>
          </section>

          <section id="endpoint" className="space-y-4">
            <SectionLabel>Endpoint</SectionLabel>
            <h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl">Base URL</h2>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <code className="break-all text-xs text-white/90 sm:text-sm">{baseUrl}</code>
            </div>
          </section>

          <section id="parameters" className="space-y-4">
            <SectionLabel>Parameters</SectionLabel>
            <h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl">Required query params</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="font-medium">username</span>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-white/55">required</span>
                </div>
                <p className="text-sm leading-7 text-white/70">Telegram username. The live tester will add <code>@</code> automatically if missing.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="font-medium">key</span>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-white/55">required</span>
                </div>
                <p className="text-sm leading-7 text-white/70">Your TG Info API key.</p>
              </div>
            </div>
          </section>

          <section id="quickstart" className="space-y-4">
            <SectionLabel>Quickstart</SectionLabel>
            <h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
              Make your first request
            </h2>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 sm:text-xs">
                  GET request
                </span>
                <CopyButton
                  label="Copy URL"
                  copied={copied === "url"}
                  onClick={() => handleCopy(exampleUrl, "url")}
                />
              </div>

              <pre className="overflow-x-auto px-4 py-4 text-xs leading-7 text-white/90 sm:px-5 sm:text-sm">
                <code>{exampleUrl}</code>
              </pre>

              <div className="border-t border-white/10 p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wider text-white/50">Try live</p>
                  <div className="text-xs text-white/45">Live API runner</div>
                </div>

                <div className="grid gap-2 md:grid-cols-3">
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username"
                    className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="API key"
                    className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
                  />
                  <button
                    onClick={runLive}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white py-2 text-sm font-medium text-black"
                  >
                    <Play className="h-4 w-4" />
                    {liveLoading ? "Loading..." : "Run Request"}
                  </button>
                </div>

                {liveResult && (
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs text-white/50">
                      <span>Live response</span>
                      <CopyButton
                        label="Copy"
                        copied={copied === "live"}
                        onClick={() => handleCopy(liveResult, "live")}
                        compact
                      />
                    </div>
                    <JsonHighlighter json={liveResult} />
                  </div>
                )}
              </div>
            </div>
          </section>

          <section id="response" className="space-y-4">
            <SectionLabel>Response</SectionLabel>
            <h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
              Success response
            </h2>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/40 sm:text-xs">
                  <LinkIcon className="h-3.5 w-3.5" />
                  application/json
                </div>
                <CopyButton
                  label="Copy JSON"
                  copied={copied === "json"}
                  onClick={() => handleCopy(jsonResponse, "json")}
                />
              </div>
              <JsonHighlighter json={jsonResponse} />
            </div>
          </section>
        </main>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-white/55 sm:px-6 md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex items-center gap-2">
            <Copyright className="h-4 w-4" />
            <span>By Team SixtyNine</span>
          </div>
          <a
            href="https://t.me/Team_sixtynine"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-white/75 transition hover:text-white"
          >
            <Send className="h-4 w-4" />
            t.me/Team_sixtynine
          </a>
        </div>
      </footer>
    </div>
  )
}
