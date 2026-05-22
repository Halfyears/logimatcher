'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'

type Phase = 'hero' | 'quiz' | 'chat' | 'thinking' | 'results' | 'contact' | 'done'
type Answers = Record<string, string | string[]>

const LogoSVG = ({ height = 40, dark = false }: { height?: number; dark?: boolean }) => (
  <svg height={height} viewBox="0 0 200 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    <defs>
      <linearGradient id="lb1" x1="0" y1="0" x2="28" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor={dark ? '#7AABFF' : '#5B86F5'}/><stop offset="1" stopColor={dark ? '#4F7CF5' : '#3563E9'}/>
      </linearGradient>
      <linearGradient id="lt1" x1="10" y1="12" x2="44" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor={dark ? '#56D4BA' : '#4BBDA4'}/><stop offset="1" stopColor="#3FA38C"/>
      </linearGradient>
      <linearGradient id="lov" x1="12" y1="8" x2="30" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3A8EC0" stopOpacity="0.9"/><stop offset="1" stopColor="#2A8278" stopOpacity="0.95"/>
      </linearGradient>
      <linearGradient id="lck" x1="12" y1="36" x2="42" y2="8" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF"/><stop offset="0.5" stopColor={dark ? '#CEFFF4' : '#E0FFF8'}/><stop offset="1" stopColor={dark ? '#8AFFE8' : '#AAFFF0'}/>
      </linearGradient>
    </defs>
    <path d="M2 4C2 2 4 1 7 2L25 3C29 3 31 6 29 10L22 23C21 26 18 27 15 26L4 19C1 18 0 15 2 11Z" fill="url(#lb1)"/>
    <path d="M4 19C1 18 0 15 2 11L3 20C3 25 6 29 10 31L14 32C10 29 6 25 4 19Z" fill={dark ? '#3460D8' : '#2A4DD0'} opacity="0.85"/>
    <path d="M44 40C44 42 42 43 39 42L21 41C17 41 15 38 17 34L24 21C25 18 28 17 31 18L43 25C46 26 47 29 45 33Z" fill="url(#lt1)"/>
    <path d="M43 25C46 26 47 29 45 33L44 24C43 19 40 14 35 13L30 12C34 15 39 19 43 25Z" fill={dark ? '#3AAA96' : '#3A9688'} opacity="0.85"/>
    <path d="M17 34C15 38 17 41 21 41L24 41C21 38 20 33 22 30L24 21C22 25 19 29 17 34Z" fill="url(#lov)" opacity="0.75"/>
    <path d="M29 10C31 6 29 3 25 3L22 3C25 6 26 11 25 14L22 23C23 19 26 15 29 10Z" fill="url(#lov)" opacity="0.65"/>
    <path d="M12 30L20 40L43 10" stroke="rgba(255,255,255,0.22)" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M12 30L20 40L43 10" stroke="rgba(255,255,255,0.55)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M13 29L21 39L43 9" stroke="url(#lck)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <text x="54" y="30" fontFamily="DM Sans,system-ui,sans-serif" fontSize="22" fontWeight="700" letterSpacing="-0.8" fill={dark ? '#7AABFF' : '#3563E9'}>Logi</text>
    <text x="96" y="30" fontFamily="DM Sans,system-ui,sans-serif" fontSize="22" fontWeight="800" letterSpacing="-0.8" fill={dark ? '#4BBDA4' : '#3FA38C'}>Matcher</text>
  </svg>
)

function Nav({ onStart }: { onStart?: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 68, background: scrolled ? '#fff' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', boxShadow: scrolled ? '0 1px 12px rgba(15,23,42,0.08)' : 'none', borderBottom: '1px solid #E2E8F2', transition: 'all 0.2s' }}>
      <a href="/" style={{ textDecoration: 'none' }}><LogoSVG height={34} /></a>
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        <a href="#how" className="nav-link">How It Works</a>
        <a href="#why" className="nav-link">Why Free?</a>
        <a href="/about" className="nav-link">About</a>
        {onStart && <button onClick={onStart} className="btn-primary" style={{ padding: '9px 22px', fontSize: 14 }}>Find My 3PL →</button>}
      </div>
    </nav>
  )
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="dot-grid" />
      <div className="orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(53,99,233,0.08) 0%, transparent 70%)', top: '-100px', right: '-100px' }} />
      <div className="orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(63,163,140,0.07) 0%, transparent 70%)', bottom: '0', left: '-80px' }} />
      <Nav onStart={onStart} />

      {/* ── HERO CONTENT ── */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '140px 24px 60px', minHeight: '92vh' }}>
        <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EEF3FE', border: '1px solid #C8D6EA', borderRadius: 30, padding: '6px 16px', marginBottom: 28 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg,#3563E9,#3FA38C)', display: 'inline-block' }} />
          <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>Free for shippers · AI-Powered · No signup needed</span>
        </div>
        <h1 className="fade-up fade-up-1" style={{ fontSize: 'clamp(40px,6vw,76px)', fontWeight: 800, lineHeight: 1.06, letterSpacing: -2.5, color: '#0F172A', maxWidth: 860, marginBottom: 22 }}>
          Stop Searching.<br /><span className="grad-text">Start Matching.</span>
        </h1>
        <p className="fade-up fade-up-2" style={{ fontSize: 19, color: '#64748B', maxWidth: 540, lineHeight: 1.7, marginBottom: 40, fontWeight: 400 }}>
          Tell us what you need. Our AI scores 2,800+ vetted warehouses and delivers your perfect 3PL — in 60 seconds, completely free.
        </p>
        <div className="fade-up fade-up-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
          <button onClick={onStart} className="btn-primary" style={{ padding: '16px 42px', fontSize: 18, borderRadius: 14 }}>Find Your 3PL in 60 Seconds →</button>
          <a href="#how" className="btn-outline" style={{ padding: '14px 28px', fontSize: 16, borderRadius: 14 }}>See How It Works</a>
        </div>
        <p className="fade-up fade-up-4" style={{ fontSize: 13, color: '#94A3B8' }}>✓ Free for Shippers &nbsp;·&nbsp; ✓ No Account Required &nbsp;·&nbsp; ✓ Results in 60 Seconds</p>

        {/* Stats */}
        <div className="fade-up fade-up-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', maxWidth: 720, width: '100%', margin: '56px auto 0', background: '#fff', borderRadius: 20, border: '1px solid #E2E8F2', boxShadow: '0 4px 20px rgba(15,23,42,0.05)', overflow: 'hidden' }}>
          {[['2,800+','Vetted Warehouses'],['12,000+','Brands Matched'],['98.6%','Satisfaction Rate'],['< 60s','Time to Results']].map(([n,l], i) => (
            <div key={l} style={{ padding: '24px 12px', textAlign: 'center', borderRight: i < 3 ? '1px solid #E2E8F2' : 'none' }}>
              <div className="stat-num" style={{ fontSize: 26 }}>{n}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3, fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div id="how" style={{ position: 'relative', zIndex: 1, maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="sec-label" style={{ justifyContent: 'center' }}>How It Works</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', letterSpacing: -1, marginBottom: 10 }}>Your perfect 3PL in 3 steps</h2>
          <p style={{ color: '#64748B', fontSize: 16 }}>No broker fees. No phone tag. Just the right match, fast.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[
            { n:'01', icon:'🎯', title:'Tell Us Your Needs', desc:'Answer 6 quick questions. Takes about 90 seconds.', bg:'#EEF3FE' },
            { n:'02', icon:'🤖', title:'AI Finds Your Match', desc:'Our AI scores 2,800+ warehouses across 12 signals.', bg:'#EBF8F5' },
            { n:'03', icon:'🤝', title:'Connect & Launch', desc:'We make the warm intro. You negotiate directly.', bg:'#FEF9C3' },
          ].map(s => (
            <div key={s.n} className="feature-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>Step {s.n}</div>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px' }}>{s.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <button onClick={onStart} className="btn-primary" style={{ padding: '14px 36px', fontSize: 16 }}>Get Started — It's Free →</button>
        </div>
      </div>

      {/* ── WHY FREE ── */}
      <div id="why" style={{ background: 'linear-gradient(135deg,#0F172A 0%,#1E293B 100%)', padding: '80px 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 660, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#4BBDA4', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Why Free?</div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: -1, marginBottom: 18 }}>We charge the warehouses, not you.</h2>
          <p style={{ fontSize: 17, color: '#94A3B8', lineHeight: 1.8, marginBottom: 36 }}>LogiMatcher is a marketplace. Warehouses pay us a small fee when we make a successful introduction. You get a premium matching service — completely free, no hidden charges, no subscription.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['💰','Free for Shippers','Always, forever'],['🤖','AI-Powered','Not just a directory'],['🔒','No Signup','Results first, account never']].map(([ic,t,s]) => (
              <div key={t} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px 22px', minWidth: 160 }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{ic}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{t}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 960, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="sec-label" style={{ justifyContent: 'center' }}>What People Say</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
          {[
            { q:"Found our warehouse in under 2 minutes. We'd been searching for weeks.", name:'Sarah C.', co:'Lume Beauty, DTC' },
            { q:"The AI understood our subscription box requirements — not just location.", name:'Marcus W.', co:'Bold Goods, B2B' },
            { q:"No broker fees, just a warm intro. Couldn't believe it was free.", name:'Priya N.', co:'Velvet Co., Fashion' },
          ].map(t => (
            <div key={t.name} className="testimonial">
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 16, paddingTop: 8 }}>{t.q}</p>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{t.name}</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>{t.co}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER CTA ── */}
      <div style={{ textAlign: 'center', padding: '20px 24px 72px', position: 'relative', zIndex: 1 }}>
        <button onClick={onStart} className="btn-primary" style={{ padding: '18px 48px', fontSize: 19, borderRadius: 16 }}>Stop Searching. Start Matching. →</button>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 14 }}>Free for Shippers · AI-Powered · No Signup Required</p>
      </div>

      <footer style={{ borderTop: '1px solid #E2E8F2', padding: '16px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1, background: '#fff' }}>
        <div style={{ fontSize: 12, color: '#94A3B8' }}>© 2025 LogiMatcher · Match Smarter. Ship Faster.</div>
      </footer>
    </div>
  )
}

function Quiz({ questions, onComplete }: { questions: any[]; onComplete: (a: Answers) => void }) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const q = questions[idx]
  const isMulti = q?.type === 'multi'
  const cur = (answers[q?.question_id] as string[]) || []
  const progress = (idx / questions.length) * 100

  const choose = (val: string) => {
    if (isMulti) {
      setAnswers(p => ({ ...p, [q.question_id]: cur.includes(val) ? cur.filter((v: string) => v !== val) : [...cur, val] }))
    } else {
      const next = { ...answers, [q.question_id]: val }
      setAnswers(next)
      setTimeout(() => { if (idx < questions.length - 1) setIdx(i => i + 1); else onComplete(next) }, 280)
    }
  }
  const next = () => { if (idx < questions.length - 1) setIdx(i => i + 1); else onComplete(answers) }
  if (!q) return null
  const opts: any[] = q.options || []
  const cols = opts.length <= 4 ? 2 : 3

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div className="dot-grid" />
      <div style={{ position: 'relative', zIndex: 10, padding: '0 40px', height: 64, background: '#fff', borderBottom: '1px solid #E2E8F2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <LogoSVG height={30} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {questions.map((_, i) => <div key={i} className={`step-dot${i === idx ? ' active' : i < idx ? ' done' : ''}`} />)}
          </div>
          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>{idx + 1} / {questions.length}</span>
        </div>
      </div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 620, width: '100%' }}>
          <div className="pill pill-blue fade-up" style={{ marginBottom: 18 }}>{isMulti ? 'Select all that apply' : 'Pick one'}</div>
          <h2 className="fade-up fade-up-1" style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 800, letterSpacing: -0.5, color: '#0F172A', marginBottom: 8, lineHeight: 1.2 }}>{q.question}</h2>
          <p className="fade-up fade-up-2" style={{ fontSize: 15, color: '#64748B', marginBottom: 30 }}>{q.subtitle}</p>
          <div className="fade-up fade-up-3" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 12 }}>
            {opts.map((opt: any) => {
              const sel = isMulti ? cur.includes(opt.value) : answers[q.question_id] === opt.value
              return (
                <button key={opt.value} onClick={() => choose(opt.value)} className={`opt-btn${sel ? ' selected' : ''}`}>
                  <div style={{ fontSize: 28, marginBottom: 10, transition: 'transform 0.2s', transform: sel ? 'scale(1.1)' : 'scale(1)' }}>{opt.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: sel ? 'var(--blue)' : '#0F172A' }}>{opt.label}</div>
                  {sel && <div style={{ fontSize: 11, color: 'var(--blue)', marginTop: 4, fontWeight: 600 }}>✓ Selected</div>}
                </button>
              )
            })}
          </div>
          {isMulti && (
            <button onClick={next} disabled={cur.length === 0} className="btn-primary fade-up fade-up-4"
              style={{ marginTop: 22, padding: '13px 0', fontSize: 16, width: '100%', borderRadius: 12, opacity: cur.length > 0 ? 1 : 0.4 }}>
              {idx === questions.length - 1 ? 'Find My Matches →' : `Continue — ${cur.length} selected`}
            </button>
          )}
          {idx > 0 && <button onClick={() => setIdx(i => i - 1)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', marginTop: 16, fontSize: 14, display: 'block', margin: '16px auto 0', fontFamily: 'DM Sans, sans-serif' }}>← Back</button>}
        </div>
      </div>
    </div>
  )
}

function AIChat({ answers, onSubmit }: { answers: Answers; onSubmit: (extra: string) => void }) {
  const [messages, setMessages] = useState<{role:string;content:string}[]>([{
    role: 'assistant',
    content: "Hi! I've recorded your quiz answers. Before I search, tell me anything extra — budget, must-have integrations, multi-location needs, or special product requirements. I'll summarize and confirm before we search."
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [summary, setSummary] = useState('')
  const chatEnd = useRef<HTMLDivElement>(null)
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg) return
    setInput('')
    const newMsgs = [...messages, { role: 'user', content: msg }]
    setMessages(newMsgs)
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
          profile: answers, results: [], mode: 'pre_search'
        })
      })
      const { reply, extractedNote } = await res.json()
      if (extractedNote) setSummary(extractedNote)
      setMessages(p => [...p, { role: 'assistant', content: reply }])
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: "Got it! I've noted your requirements. Feel free to add more, or confirm to start searching." }])
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div className="dot-grid" />
      <div style={{ position: 'relative', zIndex: 10, padding: '0 40px', height: 64, background: '#fff', borderBottom: '1px solid #E2E8F2', display: 'flex', alignItems: 'center' }}><a href="/" style={{ textDecoration: 'none' }}><LogoSVG height={30} /></a></div>
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 580, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#3563E9,#3FA38C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(53,99,233,0.3)' }}>🤖</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: -0.5, marginBottom: 8 }}>AI Advisor</h2>
            <p style={{ color: '#64748B', fontSize: 15, lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
              Chat with our AI to refine your requirements. It will summarize and confirm before searching.
            </p>
          </div>

          {/* Quick hints */}
          {messages.length <= 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, justifyContent: 'center' }}>
              {['Warehouses on both coasts','Shopify + subscription boxes','Budget under $3/order','Climate-controlled storage','Amazon FBA prep'].map(hint => (
                <button key={hint} onClick={() => { setInput(hint) }}
                  style={{ background: '#EEF3FE', border: '1.5px solid #C8D6EA', borderRadius: 20, padding: '7px 14px', fontSize: 13, color: '#3563E9', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                  {hint}
                </button>
              ))}
            </div>
          )}

          {/* Chat window */}
          <div style={{ background: '#fff', border: '1.5px solid #E2E8F2', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(15,23,42,0.06)', marginBottom: 12 }}>
            <div style={{ padding: '20px', minHeight: 160, maxHeight: 380, overflowY: 'auto' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 16, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {m.role === 'assistant' && <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3563E9,#3FA38C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🤖</div>}
                  <div style={{ maxWidth: '78%', padding: '11px 15px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', fontSize: 15, lineHeight: 1.65 }} className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>{m.content}</div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3563E9,#3FA38C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🤖</div>
                  <div className="chat-bubble-ai" style={{ padding: '11px 15px', fontSize: 15, color: '#94A3B8' }}>
                    <span style={{ animation: 'pulse-ring 1s infinite' }}>●</span> Thinking…
                  </div>
                </div>
              )}
              <div ref={chatEnd} />
            </div>
            <div style={{ padding: '12px 14px', borderTop: '1px solid #E2E8F2', display: 'flex', gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && !confirmed && send()}
                placeholder="Type your requirements, then press Enter…"
                className="input-field" style={{ flex: 1, fontSize: 15, padding: '12px 16px' }}
                disabled={loading || confirmed} />
              <button onClick={() => send()} disabled={loading || !input.trim() || confirmed}
                className="btn-primary" style={{ padding: '10px 20px', fontSize: 14, opacity: (!input.trim() || loading || confirmed) ? 0.4 : 1 }}>
                Send
              </button>
            </div>
          </div>

          {/* Confirm & Search button — always visible, prominent after AI replies */}
          {messages.length > 1 && !confirmed && (
            <button
              onClick={() => {
                const note = summary || messages.filter(m => m.role === 'user').map(m => m.content).join(' | ')
                setConfirmed(true)
                onSubmit(note)
              }}
              className="btn-primary"
              style={{ width: '100%', padding: '16px 0', fontSize: 17, borderRadius: 12, marginBottom: 10 }}>
              ✓ Confirm & Find My Matches →
            </button>
          )}

          {/* Skip always available */}
          {!confirmed && (
            <button onClick={() => onSubmit('')}
              style={{ width: '100%', padding: '11px 0', fontSize: 13, fontWeight: 600, background: 'transparent', border: '1px solid #E2E8F2', borderRadius: 12, cursor: 'pointer', color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
              Skip — search with quiz answers only
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Thinking() {
  const [step, setStep] = useState(0)
  const steps = ['Reading your requirements…','Scoring 2,800+ warehouse profiles…','Checking location & volume fit…','Ranking specialty matches…','Preparing your shortlist…']
  useEffect(() => { const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 500); return () => clearInterval(t) }, [])
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div className="dot-grid" />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg,#3563E9,#3FA38C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px', boxShadow: '0 0 0 0 rgba(53,99,233,0.3)', animation: 'pulse-ring 2s ease-in-out infinite' }}>🤖</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Finding your match…</h2>
        <p style={{ color: '#64748B', marginBottom: 36, fontSize: 14 }}>Usually done in under 3 seconds</p>
        <div style={{ background: '#fff', border: '1px solid #E2E8F2', borderRadius: 16, padding: '18px 22px', boxShadow: '0 4px 16px rgba(15,23,42,0.05)' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0', opacity: i <= step ? 1 : 0.2, transition: 'opacity 0.4s' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: i < step ? 'linear-gradient(135deg,#3563E9,#3FA38C)' : i === step ? '#EEF3FE' : '#E2E8F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: i < step ? '#fff' : '#3563E9', flexShrink: 0, transition: 'all 0.4s', fontWeight: 700 }}>
                {i < step ? '✓' : i === step ? '⋯' : '·'}
              </div>
              <span style={{ fontSize: 13, color: i <= step ? '#374151' : '#94A3B8', textAlign: 'left' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Results({ results, answers, leadId, onContact }: { results: any[]; answers: Answers; leadId: string; onContact: (warehouseId?: string) => void }) {
  const [expanded, setExpanded] = useState<string | null>(results[0]?.id || null)
  const [chat, setChat] = useState<{ role: string; content: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEnd = useRef<HTMLDivElement>(null)
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat])

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const msg = chatInput.trim(); setChatInput('')
    const newMsgs = [...chat, { role: 'user', content: msg }]
    setChat(newMsgs); setChatLoading(true)
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })), profile: answers, results }) })
      const { reply } = await res.json()
      setChat(p => [...p, { role: 'assistant', content: reply }])
    } catch { setChat(p => [...p, { role: 'assistant', content: 'Having a moment — try again!' }]) }
    setChatLoading(false)
  }

  const bizMap: Record<string, string> = { dtc: 'DTC brand', b2b: 'B2B company', marketplace: 'marketplace seller', subscription: 'subscription brand', retail: 'retailer' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="dot-grid" />
      <div style={{ position: 'relative', zIndex: 10, padding: '0 40px', height: 64, background: '#fff', borderBottom: '1px solid #E2E8F2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <LogoSVG height={30} />
        <button onClick={() => onContact()} className="btn-primary" style={{ padding: '9px 22px', fontSize: 14 }}>Get Connected →</button>
      </div>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '36px 24px 80px' }}>
        {/* AI Summary */}
        <div style={{ background: '#EEF3FE', border: '1px solid #C8D6EA', borderRadius: 16, padding: '18px 22px', marginBottom: 24, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#3563E9,#3FA38C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🤖</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#3563E9', letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase' }}>AI Insight</div>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.65, margin: 0 }}>
              As a <strong>{bizMap[answers.business_type as string] || 'business'}</strong>, we found <strong style={{ color: '#3563E9' }}>{results.filter(r => r.matchScore >= 70).length} strong matches</strong>.{' '}
              {results[0] && <><strong>{results[0].name}</strong> scores <strong style={{ color: '#059669' }}>{results[0].matchScore}%</strong> — {results[0].matchReasons?.[0] || 'great alignment'}.</>}
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 4, letterSpacing: -0.5 }}>Your Top {results.length} Matches</h2>
        <p style={{ color: '#64748B', marginBottom: 22, fontSize: 14 }}>Ranked by AI · Click any card to expand</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
          {results.map((w, i) => {
            const isExp = expanded === w.id
            return (
              <div key={w.id} className={`wh-card${isExp ? ' expanded' : ''}`} onClick={() => setExpanded(isExp ? null : w.id)} style={{ cursor: 'pointer' }}>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg,#F59E0B,#EF4444)' : '#E2E8F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: i === 0 ? '#fff' : '#64748B' }}>#{i+1}</div>
                    <div style={{ width: 44, height: 44, borderRadius: 11, background: 'linear-gradient(135deg,#3563E9,#3FA38C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>{w.logo}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{w.name}</span>
                      {w.badge && <span className="pill pill-blue" style={{ fontSize: 10 }}>{w.badge}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>📍 {w.location}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`match-${w.matchScore >= 80 ? 'high' : 'mid'}`} style={{ padding: '4px 12px', fontWeight: 800, fontSize: 13, borderRadius: 20 }}>{w.matchScore}% Match</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#F59E0B', fontSize: 12 }}>{'★'.repeat(Math.floor(w.rating))}<span style={{ color: '#94A3B8', marginLeft: 3, fontSize: 11 }}>{w.rating}</span></div>
                      <div style={{ fontSize: 10, color: '#94A3B8' }}>{w.reviews} reviews</div>
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: 16, transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid #E2E8F2', padding: '10px 20px' }}>
                  {[['$'+w.pricing?.perOrder,'Per Order'],['$'+w.pricing?.storage,'Storage/sqft'],[w.pricing?.setup===0?'Free':'$'+w.pricing?.setup,'Setup'],[w.leadTime,'Cut-off']].map(([v,l]) => (
                    <div key={l} style={{ textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{v}</div><div style={{ fontSize: 11, color: '#94A3B8' }}>{l}</div></div>
                  ))}
                </div>
                {isExp && (
                  <div style={{ borderTop: '1px solid #E2E8F2', padding: 20 }} onClick={e => e.stopPropagation()}>
                    <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 18 }}>{w.description}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 18 }}>
                      {[{ t:'SERVICES', items: (w.services||[]).map((s:string)=>({t:s,c:'#374151',i:'✓'})) },{ t:'INTEGRATIONS', items: (w.integrations||[]).map((s:string)=>({t:s,c:'#374151',i:'⚡'})) },{ t:'WHY IT MATCHES', items: (w.matchReasons||[]).map((s:string)=>({t:s,c:'#059669',i:'✦'})) }].map(col => (
                        <div key={col.t}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>{col.t}</div>
                          {col.items.map((it:any) => <div key={it.t} style={{ fontSize: 13, color: it.c, marginBottom: 4 }}>{it.i} {it.t}</div>)}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => onContact(w.id)} className="btn-primary" style={{ width: '100%', padding: '12px 0', fontSize: 15, borderRadius: 11 }}>Request Introduction to {w.name} →</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* AI Chat */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F2', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 16px rgba(15,23,42,0.05)', marginBottom: 36 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F2', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#3563E9,#3FA38C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🤖</div>
            <div><div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Ask the AI Advisor</div><div style={{ fontSize: 12, color: '#94A3B8' }}>Powered by Claude</div></div>
          </div>
          <div style={{ minHeight: 70, maxHeight: 240, overflowY: 'auto', padding: '14px 20px' }}>
            {chat.length === 0 && (
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {["Difference between top 2?","Best for fast shipping?","What to ask before signing?"].map(q => (
                  <button key={q} onClick={() => setChatInput(q)} style={{ background: '#EEF3FE', border: '1px solid #C8D6EA', borderRadius: 20, padding: '5px 13px', fontSize: 12, color: '#3563E9', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{q}</button>
                ))}
              </div>
            )}
            {chat.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 12, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'assistant' && <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#3563E9,#3FA38C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>🤖</div>}
                <div style={{ maxWidth: '75%', padding: '9px 13px', fontSize: 14, lineHeight: 1.6 }} className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>{m.content}</div>
              </div>
            ))}
            {chatLoading && <div style={{ display: 'flex', gap: 8 }}><div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#3563E9,#3FA38C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div><div className="chat-bubble-ai" style={{ padding: '9px 13px', fontSize: 14, color: '#94A3B8' }}>Thinking…</div></div>}
            <div ref={chatEnd} />
          </div>
          <div style={{ padding: '11px 14px', borderTop: '1px solid #E2E8F2', display: 'flex', gap: 8 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Ask anything about your matches…" className="input-field" style={{ flex: 1, fontSize: 14 }} />
            <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} className="btn-primary" style={{ padding: '9px 16px', fontSize: 14, opacity: (!chatInput.trim() || chatLoading) ? 0.4 : 1 }}>Send</button>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={() => onContact()} className="btn-primary" style={{ padding: '15px 44px', fontSize: 17, borderRadius: 13 }}>Get Connected to My Top Match →</button>
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 10 }}>We'll intro you within 1 business day · No spam · Free for shippers</p>
        </div>
      </div>
    </div>
  )
}

function Contact({ leadId, chosenWarehouseId, onDone }: { leadId: string; chosenWarehouseId?: string | null; onDone: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' })
  const [loading, setLoading] = useState(false)
  const submit = async () => {
    if (!form.name || !form.email) return
    setLoading(true)
    try { 
      await fetch('/api/leads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: leadId, action: 'contact', ...form }) })
      // If user chose a specific warehouse, record that choice
      if (chosenWarehouseId) {
        await fetch('/api/leads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: leadId, action: 'choose_warehouse', warehouse_id: chosenWarehouseId }) })
      }
      onDone() 
    }
    catch { toast.error('Something went wrong. Please try again.') }
    setLoading(false)
  }
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
      <div className="dot-grid" />
      <div style={{ position: 'relative', zIndex: 1, background: '#fff', borderRadius: 22, padding: '38px 34px', width: '100%', maxWidth: 460, boxShadow: '0 8px 40px rgba(15,23,42,0.09)', border: '1px solid #E2E8F2' }}>
        <div style={{ marginBottom: 26 }}><a href="/" style={{ textDecoration: 'none' }}><LogoSVG height={30} /></a></div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Request an Introduction</h2>
        <p style={{ color: '#64748B', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>We'll connect you with your top-matched warehouse within 1 business day. Free, no obligation.</p>
        {[{k:'name',label:'Full Name *',ph:'Jane Smith',type:'text'},{k:'email',label:'Work Email *',ph:'jane@brand.com',type:'email'},{k:'phone',label:'Phone (optional)',ph:'+1 (555) 000-0000',type:'tel'},{k:'company',label:'Company Name',ph:'Your Brand Inc.',type:'text'}].map(f => (
          <div key={f.k} style={{ marginBottom: 13 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
            <input type={f.type} placeholder={f.ph} value={form[f.k as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} className="input-field" />
          </div>
        ))}
        <button onClick={submit} disabled={!form.name || !form.email || loading} className="btn-primary" style={{ width: '100%', padding: '13px 0', fontSize: 16, borderRadius: 11, marginTop: 6, opacity: (!form.name || !form.email || loading) ? 0.5 : 1 }}>
          {loading ? 'Sending…' : 'Send My Introduction Request →'}
        </button>
        <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 11, textAlign: 'center' }}>We only share your info with matched warehouses. No spam. Ever.</p>
      </div>
    </div>
  )
}

function Done() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, position: 'relative' }}>
      <div className="dot-grid" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 68, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', marginBottom: 10, letterSpacing: -0.5 }}>You're all set!</h2>
        <p style={{ color: '#64748B', fontSize: 16, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 28px' }}>We've notified your top match. Expect an intro email within 1 business day.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28 }}>
          <span className="pill pill-green">✓ Introduction requested</span>
          <span className="pill pill-teal">✓ Warehouse notified</span>
          <span className="pill pill-gray">⏱ Response within 24h</span>
        </div>
        <button onClick={() => window.location.href = '/'} className="btn-outline" style={{ padding: '11px 26px', fontSize: 15, borderRadius: 11 }}>← Back to LogiMatcher</button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>('hero')
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Answers>({})
  const [results, setResults] = useState<any[]>([])
  const [leadId, setLeadId] = useState('')
  const [chosenWarehouseId, setChosenWarehouseId] = useState<string | null>(null)

  useEffect(() => { fetch('/api/questions').then(r => r.json()).then(d => { if (Array.isArray(d)) setQuestions(d) }).catch(() => {}) }, [])

  const runSearch = useCallback(async (ans: Answers, extra: string) => {
    setPhase('thinking')
    try {
      const res = await fetch('/api/leads', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ name: '', email: '', phone: '', company: '', answers: ans, extra_note: extra }) 
      })
      const data = await res.json()
      setResults(data.results || []); setLeadId(data.leadId || '')
    } catch { toast.error('Could not load matches. Please try again.') }
    setTimeout(() => setPhase('results'), 2800)
  }, [])

  const handleQuizComplete = useCallback((ans: Answers) => { setAnswers(ans); setPhase('chat') }, [])
  const handleChatDone = useCallback((extra: string) => { runSearch(answers, extra) }, [answers, runSearch])

  if (phase === 'hero') return <Hero onStart={() => setPhase('quiz')} />
  if (phase === 'quiz') return questions.length > 0 ? <Quiz questions={questions} onComplete={handleQuizComplete} /> : <Thinking />
  if (phase === 'chat') return <AIChat answers={answers} onSubmit={handleChatDone} />
  if (phase === 'thinking') return <Thinking />
  if (phase === 'results') return <Results results={results} answers={answers} leadId={leadId} onContact={(wid?: string) => { if (wid) setChosenWarehouseId(wid); setPhase('contact') }} />
  if (phase === 'contact') return <Contact leadId={leadId} chosenWarehouseId={chosenWarehouseId} onDone={() => setPhase('done')} />
  return <Done />
}
