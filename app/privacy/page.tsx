export default function Privacy() {
  return (
    <main style={{ maxWidth:680, margin:'0 auto', padding:'60px 24px', fontFamily:'system-ui, sans-serif', color:'#333', lineHeight:1.7 }}>
      <h1 style={{ fontSize:28, fontWeight:700, marginBottom:8 }}>Privacy Policy</h1>
      <p style={{ color:'#888', marginBottom:32 }}>Last updated: June 2026</p>

      <h2 style={{ fontSize:18, fontWeight:600, marginBottom:8 }}>What we collect</h2>
      <p style={{ marginBottom:24 }}>We collect your name, email address, and Google Calendar data solely to enable appointment scheduling. We do not sell your data to third parties.</p>

      <h2 style={{ fontSize:18, fontWeight:600, marginBottom:8 }}>How we use it</h2>
      <p style={{ marginBottom:24 }}>Your information is used only to create and manage bookings and sync with Google Calendar.</p>

      <h2 style={{ fontSize:18, fontWeight:600, marginBottom:8 }}>Google OAuth</h2>
      <p style={{ marginBottom:24 }}>We use Google OAuth to access your calendar. You can revoke access at any time at <a href="https://myaccount.google.com/permissions" style={{ color:'#6366f1' }}>myaccount.google.com/permissions</a>.</p>

      <h2 style={{ fontSize:18, fontWeight:600, marginBottom:8 }}>Contact</h2>
      <p>For questions email us at support@simplibill.ai</p>
    </main>
  )
}
