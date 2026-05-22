'use client'
import { useEffect, useState } from 'react'

const DEFAULTS = {
  mission_body: 'Finding a reliable 3PL used to take weeks of research, dozens of phone calls, and expensive broker fees. We changed that. LogiMatcher uses AI to score 2,800+ vetted warehouses across 12 compatibility signals and delivers your best matches in under 60 seconds — completely free for shippers.',
  biz_body: 'LogiMatcher is a two-sided marketplace. Shippers always use our platform completely free. Warehouses pay a small introduction fee when we make a successful connection — so we only win when you win.',
  email_general: 'hello@logimatcher.com',
  email_warehouses: 'warehouses@logimatcher.com',
  email_biz: 'partners@logimatcher.com',
  seo_title: 'About LogiMatcher — AI-Powered 3PL Warehouse Matching',
  seo_desc: 'Learn about LogiMatcher, the free AI-powered platform that matches brands with 3PL warehouse partners in 60 seconds.',
}

export default function AboutPage() {
  const [scrolled, setScrolled] = useState(false)
  const [ab, setAb] = useState<Record<string, any>>(DEFAULTS)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(cfg => {
        if (cfg?.about_content) setAb({ ...DEFAULTS, ...cfg.about_content })
        const title = cfg?.about_content?.seo_title || DEFAULTS.seo_title
        const desc  = cfg?.about_content?.seo_desc  || DEFAULTS.seo_desc
        document.title = title
        const metaDesc = document.querySelector('meta[name="description"]')
        if (metaDesc) metaDesc.setAttribute('content', desc)
      })
      .catch(() => {
        document.title = DEFAULTS.seo_title
        const metaDesc = document.querySelector('meta[name="description"]')
        if (metaDesc) metaDesc.setAttribute('content', DEFAULTS.seo_desc)
      })
  }, [])

  const contacts = [
    { icon: '📧', label: 'General',             val: ab.email_general    || DEFAULTS.email_general },
    { icon: '🏭', label: 'Warehouse Partners',   val: ab.email_warehouses || DEFAULTS.email_warehouses },
    { icon: '🤝', label: 'Business Development', val: ab.email_biz        || DEFAULTS.email_biz },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FB', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: scrolled ? '#fff' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F2', boxShadow: scrolled ? '0 1px 12px rgba(15,23,42,0.08)' : 'none', transition: 'all 0.2s' }}>
        <a href="/" style={{ textDecoration: 'none', fontSize: 20, fontWeight: 800, color: '#3563E9' }}>Logi<span style={{ color: '#3FA38C' }}>Matcher</span></a>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="/" style={{ fontSize: 14, color: '#64748B', textDecoration: 'none', fontWeight: 500 }}>Home</a>
          <a href="/about" style={{ fontSize: 14, color: '#3563E9', textDecoration: 'none', fontWeight: 700, borderBottom: '2px solid #3563E9', paddingBottom: 2 }}>About</a>
          <a href="/" style={{ fontSize: 14, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#3563E9,#3FA38C)', padding: '9px 22px', borderRadius: 10, textDecoration: 'none' }}>Find My 3PL →</a>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '110px 24px 80px' }}>
        <h1 style={{ fontSize: 52, fontWeight: 800, color: '#0F172A', letterSpacing: -2, marginBottom: 20, lineHeight: 1.1 }}>About LogiMatcher</h1>
        <p style={{ fontSize: 19, color: '#64748B', lineHeight: 1.8, marginBottom: 48 }}>
          AI-powered 3PL matching — free for shippers, fast for everyone.
        </p>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 16, letterSpacing: -0.5 }}>Our Mission</h2>
          <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.8 }}>
            {ab.mission_body || DEFAULTS.mission_body}
          </p>
          {ab.mission_body2 && (
            <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.8, marginTop: 14 }}>{ab.mission_body2}</p>
          )}
        </section>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 20, letterSpacing: -0.5 }}>How It Works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { n: '01', t: 'Answer 6 quick questions', d: 'Tell us about your business, products, monthly volume, location, and services needed. Takes under 2 minutes.' },
              { n: '02', t: 'AI finds your match', d: 'Our engine scores every warehouse in our network across volume, location, specialties, integrations, and more.' },
              { n: '03', t: 'Get connected', d: 'We make the warm introduction. You negotiate directly — no middleman markup, no broker fees.' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', background: '#fff', border: '1px solid #E2E8F2', borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#3563E9,#3FA38C)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{s.t}</div>
                  <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 16, letterSpacing: -0.5 }}>Why Free?</h2>
          <div style={{ background: 'linear-gradient(135deg,#0F172A,#1E293B)', borderRadius: 20, padding: '32px 36px', color: '#fff' }}>
            <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.8, marginBottom: 20 }}>
              {ab.biz_body || DEFAULTS.biz_body}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['Free for Shippers — Always', 'AI-Powered Matching', 'Vetted Warehouses Only', 'No Hidden Fees'].map(t => (
                <span key={t} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '5px 14px', fontSize: 13, color: '#E2E8F2', fontWeight: 500 }}>✓ {t}</span>
              ))}
            </div>
          </div>
        </section>

        {ab.story_body && (
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 16, letterSpacing: -0.5 }}>{ab.story_title || 'Our Story'}</h2>
            <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.8 }}>{ab.story_body}</p>
          </section>
        )}

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 16, letterSpacing: -0.5 }}>
            {ab.contact_title || 'Contact'}
          </h2>
          {ab.contact_body && (
            <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, marginBottom: 20 }}>{ab.contact_body}</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {contacts.map(item => (
              <div key={item.label} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EEF3FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</div>
                  <a href={`mailto:${item.val}`} style={{ fontSize: 15, color: '#3563E9', textDecoration: 'none', fontWeight: 500 }}>{item.val}</a>
                </div>
              </div>
            ))}
            {ab.phone && (
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EEF3FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📞</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Phone</div>
                  <span style={{ fontSize: 15, color: '#374151', fontWeight: 500 }}>{ab.phone}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <div style={{ textAlign: 'center', paddingTop: 16 }}>
          <a href="/" style={{ display: 'inline-block', padding: '16px 40px', background: 'linear-gradient(135deg,#3563E9,#3FA38C)', color: '#fff', borderRadius: 14, textDecoration: 'none', fontWeight: 700, fontSize: 17, boxShadow: '0 8px 24px rgba(53,99,233,0.25)' }}>
            Stop Searching. Start Matching. →
          </a>
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 12 }}>Free for Shippers · AI-Powered · No Signup Required</p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #E2E8F2', padding: '16px 40px', display: 'flex', justifyContent: 'center', background: '#fff' }}>
        <span style={{ fontSize: 12, color: '#94A3B8' }}>© 2025 LogiMatcher · Match Smarter. Ship Faster.</span>
      </footer>
    </div>
  )
}
