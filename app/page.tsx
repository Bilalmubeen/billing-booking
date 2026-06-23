import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()
  if (session) redirect('/dashboard')

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', background: '#1d4ed8', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </div>
        <h1 style={{ fontSize:34, fontWeight:700, color:'#0f172a', marginBottom:12, letterSpacing:'-0.5px' }}>
          SimpliBill Booking
        </h1>
        <p style={{ color: '#64748b', fontSize: '17px', marginBottom: '40px', lineHeight: '1.6' }}>
          Share one link. Let anyone book time with you — automatically synced to your calendar.
        </p>
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#1d4ed8', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: '600', fontSize: '16px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(29,78,216,0.35)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#fff" opacity=".9" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#fff" opacity=".9" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fff" opacity=".9" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#fff" opacity=".9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Link>
        <p style={{ marginTop: '20px', color: '#94a3b8', fontSize: '13px' }}>Free · No credit card required</p>
      </div>
    </main>
  )
}
