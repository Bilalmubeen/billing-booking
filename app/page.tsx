import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ minHeight:'100vh', background:'linear-gradient(135deg, #f0f4ff 0%, #fafafa 60%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ maxWidth:'520px', width:'100%', textAlign:'center' }}>
        <div style={{ width:56, height:56, background:'#6366f1', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
          <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </div>
        <h1 style={{ fontSize:34, fontWeight:700, color:'#0f172a', marginBottom:12, letterSpacing:'-0.5px' }}>
          SimpliBill Booking
        </h1>
        <p style={{ color:'#64748b', fontSize:16, marginBottom:16, lineHeight:1.7 }}>
          A scheduling tool for SimpliBill clients. Book appointments directly with your billing specialist — automatically synced to Google Calendar.
        </p>
        <p style={{ color:'#94a3b8', fontSize:14, marginBottom:40, lineHeight:1.6 }}>
          Share one link. Let clients book time with you. No back-and-forth emails.
        </p>
        <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#6366f1', color:'white', padding:'14px 28px', borderRadius:12, fontWeight:600, fontSize:15, textDecoration:'none', boxShadow:'0 4px 14px rgba(99,102,241,0.35)' }}>
          Sign in to get started
        </Link>
        <div style={{ marginTop:48, display:'flex', justifyContent:'center', gap:24 }}>
          <a href="/privacy" style={{ fontSize:12, color:'#aaa', textDecoration:'none' }}>Privacy Policy</a>
          <a href="/terms" style={{ fontSize:12, color:'#aaa', textDecoration:'none' }}>Terms of Service</a>
        </div>
      </div>
    </main>
  )
}
