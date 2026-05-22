'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'

export default function SurveyPage() {
  const params = useParams()
  const leadId = params.leadId as string
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [done, setDone] = useState(false)
  const [warehouseName, setWarehouseName] = useState('')

  useEffect(() => {
    fetch(`/api/survey?leadId=${leadId}`)
      .then(r => r.json())
      .then(d => {
        setQuestions(d.surveyQuestions || [])
        setWarehouseName(d.lead?.warehouse?.name || 'your warehouse')
      })
  }, [leadId])

  const submit = async () => {
    await fetch('/api/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, responses: answers }),
    })
    setDone(true)
    toast.success('Thank you for your feedback!')
  }

  if (done) return (
    <div style={{ minHeight: '100vh', background: '#080D1A', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, fontFamily: 'DM Sans, sans-serif', color: '#F0F6FF' }}>
      <div>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🙏</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Thank you!</h2>
        <p style={{ color: '#64748B', fontSize: 16 }}>Your feedback helps us improve matches for everyone.</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080D1A', fontFamily: 'DM Sans, sans-serif', color: '#F0F6FF', padding: '60px 24px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>LogiMatcher</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>How did it go?</h1>
        <p style={{ color: '#64748B', marginBottom: 36, fontSize: 15 }}>A few quick questions about your experience with {warehouseName}.</p>

        {questions.map((q: any) => (
          <div key={q.id} style={{ marginBottom: 28, padding: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>{q.question}</div>
            {q.type === 'single' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(q.options || []).map((opt: string) => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: answers[q.id] === opt ? '#60A5FA' : '#94A3B8' }}>
                    <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={() => setAnswers(p => ({ ...p, [q.id]: opt }))} />
                    {opt}
                  </label>
                ))}
              </div>
            )}
            {q.type === 'rating' && (
              <div style={{ display: 'flex', gap: 8 }}>
                {Array.from({ length: q.max || 5 }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setAnswers(p => ({ ...p, [q.id]: n }))}
                    style={{ width: 44, height: 44, borderRadius: 10, border: `2px solid ${answers[q.id] === n ? '#4F8EF7' : 'rgba(255,255,255,0.1)'}`, background: answers[q.id] === n ? 'rgba(79,142,247,0.15)' : 'transparent', color: '#F0F6FF', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                    {n}
                  </button>
                ))}
              </div>
            )}
            {q.type === 'text' && (
              <textarea value={answers[q.id] || ''} onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))} rows={3} placeholder="Your feedback…"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#F0F6FF', fontSize: 14, resize: 'vertical', fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
            )}
          </div>
        ))}

        <button onClick={submit} style={{ width: '100%', background: 'linear-gradient(135deg,#3B82F6,#6366F1)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
          Submit Feedback →
        </button>
      </div>
    </div>
  )
}
