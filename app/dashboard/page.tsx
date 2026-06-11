'use client'
import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const COLORS = ['#6366f1','#8b5cf6','#0ea5e9','#10b981','#f59e0b','#ef4444','#ec4899']
const COLOR_NAMES = ['Indigo','Purple','Sky','Emerald','Amber','Red','Pink']

type Availability = { day:string; active:boolean; start_time:string; end_time:string }
type AppointmentType = { label:string; duration:number; color:string }

export default function Dashboard() {
  const { data: session } = useSession()
  const [user, setUser] = useState<any>(null)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [apptTypes, setApptTypes] = useState<AppointmentType[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'availability'|'types'>('availability')

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(data => {
      setUser(data)
      const avail = DAYS.map(day => {
        const existing = data.availability?.find((a: any) => a.day === day)
        return existing || { day, active: ['monday','tuesday','wednesday','thursday','friday'].includes(day), start_time:'09:00', end_time:'17:00' }
      })
      setAvailability(avail)
      setApptTypes(data.appointment_types?.length ? data.appointment_types : [
        { label:'15 Minute Meeting', duration:15, color:'#6366f1' },
        { label:'30 Minute Meeting', duration:30, color:'#8b5cf6' },
        { label:'60 Minute Meeting', duration:60, color:'#0ea5e9' },
      ])
    })
  }, [])

  async function save() {
    setSaving(true)
    await fetch('/api/user', {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ availability:availability.filter(a=>a.active), appointmentTypes:apptTypes }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const bookingUrl = user && typeof window !== 'undefined' ? `${window.location.origin}/book/${user.username}` : ''

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Inter',system-ui,sans-serif;background:#f5f5f7;color:#111}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn 0.2s ease both}
        input:focus,select:focus,textarea:focus{outline:none}
      `}</style>

      <div style={{ minHeight:'100vh', background:'#f5f5f7' }}>

        {/* Top nav */}
        <div style={{ background:'#fff', borderBottom:'1px solid #e8e8ec', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:58, position:'sticky', top:0, zIndex:10, boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, background:'#6366f1', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            </div>
            <span style={{ fontSize:15, fontWeight:600, color:'#111', letterSpacing:'-0.2px' }}>Booking</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {session?.user?.image && <img src={session.user.image} style={{ width:30, height:30, borderRadius:'50%', border:'1.5px solid #e5e7eb' }} alt=""/>}
            <button onClick={() => signOut({ callbackUrl:'/' })} style={{ fontSize:13, color:'#888', background:'none', border:'1px solid #e5e7eb', borderRadius:8, padding:'5px 12px', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='#f5f5f7'}
              onMouseLeave={e => e.currentTarget.style.background='none'}>
              Sign out
            </button>
          </div>
        </div>

        <div style={{ maxWidth:640, margin:'0 auto', padding:'28px 16px' }}>

          {/* Booking link banner */}
          {user && bookingUrl && (
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e8e8ec', padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <div>
                <p style={{ fontSize:10, fontWeight:700, color:'#6366f1', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Your booking page</p>
                <p style={{ fontSize:13, color:'#555', fontFamily:'monospace' }}>{bookingUrl}</p>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => navigator.clipboard?.writeText(bookingUrl)} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #e5e7eb', background:'#f8f8fa', fontSize:12, fontWeight:500, color:'#555', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s', whiteSpace:'nowrap' }}
                  onMouseEnter={e => e.currentTarget.style.background='#efefef'}
                  onMouseLeave={e => e.currentTarget.style.background='#f8f8fa'}>
                  Copy
                </button>
                <a href={bookingUrl} target="_blank" rel="noreferrer" style={{ padding:'7px 14px', borderRadius:8, border:'none', background:'#6366f1', fontSize:12, fontWeight:600, color:'#fff', cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap' }}>
                  Open ↗
                </a>
              </div>
            </div>
          )}

          {/* Main card */}
          <div style={{ background:'#fff', borderRadius:18, border:'1px solid #e8e8ec', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>

            {/* Tabs */}
            <div style={{ display:'flex', borderBottom:'1px solid #f0f0f4', padding:'0 4px' }}>
              {(['availability','types'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  flex:1,
                  padding:'14px 16px',
                  background:'none',
                  border:'none',
                  cursor:'pointer',
                  fontSize:13,
                  fontWeight: tab === t ? 600 : 400,
                  color: tab === t ? '#111' : '#999',
                  borderBottom: tab === t ? '2px solid #6366f1' : '2px solid transparent',
                  transition:'all 0.15s',
                  fontFamily:'inherit',
                }}>
                  {t === 'availability' ? 'Availability' : 'Appointment Types'}
                </button>
              ))}
            </div>

            {/* Availability tab */}
            {tab === 'availability' && (
              <div className="fade-in">
                {availability.map((a, i) => (
                  <div key={a.day} style={{ padding:'16px 20px', borderBottom: i < availability.length-1 ? '1px solid #f5f5f7' : 'none', display:'flex', alignItems:'center', gap:16 }}>
                    <span style={{ width:36, fontSize:12, fontWeight:600, color: a.active ? '#111' : '#bbb', textTransform:'uppercase', letterSpacing:'0.05em', flexShrink:0 }}>{DAY_LABELS[i]}</span>

                    {/* Toggle */}
                    <div onClick={() => setAvailability(av => av.map((x,j) => j===i ? {...x, active:!x.active} : x))}
                      style={{ width:38, height:22, borderRadius:11, background: a.active ? '#6366f1' : '#e5e7eb', cursor:'pointer', position:'relative', flexShrink:0, transition:'background 0.2s' }}>
                      <div style={{ position:'absolute', width:16, height:16, borderRadius:'50%', background:'#fff', top:3, left: a.active ? 19 : 3, transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.15)' }}/>
                    </div>

                    {a.active ? (
                      <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
                        <input type="time" value={a.start_time}
                          onChange={e => setAvailability(av => av.map((x,j) => j===i ? {...x,start_time:e.target.value} : x))}
                          style={{ border:'1.5px solid #e5e7eb', borderRadius:8, padding:'6px 10px', fontSize:13, color:'#333', fontFamily:'inherit', background:'#fafafa', cursor:'pointer', transition:'border-color 0.15s' }}
                          onFocus={e => e.target.style.borderColor='#6366f1'}
                          onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
                        <span style={{ fontSize:12, color:'#bbb' }}>–</span>
                        <input type="time" value={a.end_time}
                          onChange={e => setAvailability(av => av.map((x,j) => j===i ? {...x,end_time:e.target.value} : x))}
                          style={{ border:'1.5px solid #e5e7eb', borderRadius:8, padding:'6px 10px', fontSize:13, color:'#333', fontFamily:'inherit', background:'#fafafa', cursor:'pointer', transition:'border-color 0.15s' }}
                          onFocus={e => e.target.style.borderColor='#6366f1'}
                          onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
                      </div>
                    ) : (
                      <span style={{ fontSize:12, color:'#ccc', flex:1 }}>Unavailable</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Types tab */}
            {tab === 'types' && (
              <div className="fade-in" style={{ padding:'12px' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {apptTypes.map((t, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#fafafa', borderRadius:12, border:'1px solid #f0f0f4' }}>
                      <div style={{ width:10, height:10, borderRadius:3, background:t.color, flexShrink:0 }}/>
                      <input value={t.label}
                        onChange={e => setApptTypes(types => types.map((x,j) => j===i ? {...x,label:e.target.value} : x))}
                        style={{ flex:1, fontSize:13, fontWeight:500, color:'#111', border:'none', background:'none', fontFamily:'inherit', minWidth:0 }}
                        onFocus={e => e.target.style.outline='none'}/>
                      <select value={t.duration}
                        onChange={e => setApptTypes(types => types.map((x,j) => j===i ? {...x,duration:Number(e.target.value)} : x))}
                        style={{ fontSize:12, border:'1px solid #e5e7eb', borderRadius:7, padding:'4px 8px', color:'#555', background:'#fff', fontFamily:'inherit', cursor:'pointer' }}>
                        {[15,30,45,60,90,120].map(d => <option key={d} value={d}>{d} min</option>)}
                      </select>
                      <div style={{ display:'flex', gap:4 }}>
                        {COLORS.map((c,ci) => (
                          <button key={c} onClick={() => setApptTypes(types => types.map((x,j) => j===i ? {...x,color:c} : x))} title={COLOR_NAMES[ci]} style={{
                            width:16, height:16, borderRadius:'50%', background:c, border: t.color===c ? '2px solid #333' : '2px solid transparent', cursor:'pointer', padding:0, transition:'transform 0.1s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform='scale(1.2)'}
                          onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}/>
                        ))}
                      </div>
                      <button onClick={() => setApptTypes(types => types.filter((_,j) => j!==i))}
                        style={{ width:24, height:24, borderRadius:6, border:'none', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, transition:'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='#fecaca'}
                        onMouseLeave={e => e.currentTarget.style.background='#fee2e2'}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M2 2l8 8M10 2l-8 8"/></svg>
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setApptTypes(t => [...t, {label:'New Meeting',duration:30,color:'#6366f1'}])}
                    style={{ padding:'11px', borderRadius:12, border:'2px dashed #e5e7eb', background:'none', fontSize:13, color:'#aaa', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s', fontWeight:500 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.color='#6366f1' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.color='#aaa' }}>
                    + Add type
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save bar */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:16, justifyContent:'flex-end' }}>
            {saved && (
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#10b981', fontWeight:500 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                Saved
              </div>
            )}
            <button onClick={save} disabled={saving} style={{
              padding:'10px 24px',
              borderRadius:10,
              border:'none',
              background: saving ? '#c7d2fe' : '#6366f1',
              color:'#fff',
              fontSize:14,
              fontWeight:600,
              cursor: saving ? 'default' : 'pointer',
              fontFamily:'inherit',
              transition:'all 0.2s',
              boxShadow: saving ? 'none' : '0 2px 8px rgba(99,102,241,0.35)',
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background='#4f46e5' }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background='#6366f1' }}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
