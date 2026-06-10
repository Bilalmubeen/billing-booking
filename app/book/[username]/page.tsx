'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const WDAYS  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
const THIRTY = 30 * 60 * 1000

export default function BookingPage() {
  const { username } = useParams()
  const [cfg, setCfg] = useState<any>(null)
  const [error, setError] = useState('')
  const [view, setView] = useState<'types'|'calendar'|'slots'|'form'|'success'>('types')
  const [selectedType, setSelectedType] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string|null>(null)
  const [selectedSlots, setSelectedSlots] = useState<number[]>([])
  const [slots, setSlots] = useState<number[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [form, setForm] = useState({ name:'', email:'', phone:'', notes:'' })
  const [submitting, setSubmitting] = useState(false)
  const [accent, setAccent] = useState('#1d4ed8')

  useEffect(() => {
    fetch(`/api/config?username=${username}`)
      .then(r => r.json())
      .then(data => { if (data.error) setError(data.error); else setCfg(data) })
      .catch(() => setError('Could not load booking page'))
  }, [username])

  function pickType(type: any) {
    setSelectedType(type)
    setSelectedDate(null)
    setSelectedSlots([])
    setAccent(type.color)
    setView('calendar')
  }

  function changeMonth(dir: number) {
    let m = currentMonth + dir, y = currentYear
    if (m > 11) { m = 0; y++ }
    if (m < 0)  { m = 11; y-- }
    setCurrentMonth(m); setCurrentYear(y)
  }

  function pickDate(dateStr: string) {
    setSelectedDate(dateStr)
    setSelectedSlots([])
    setView('slots')
    setSlotsLoading(true)
    fetch('/api/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, date: dateStr, duration: selectedType?.duration || 30 }),
    }).then(r => r.json()).then(data => {
      setSlots(data.slots || [])
      setSlotsLoading(false)
    })
  }

  function pickSlot(slot: number) {
    const duration = selectedType?.duration || 30
    if (duration <= 30) {
      setSelectedSlots(s => s[0] === slot ? [] : [slot])
      return
    }
    // 60min: pick two consecutive
    if (selectedSlots.includes(slot)) { setSelectedSlots([]); return }
    if (selectedSlots.length === 0) { setSelectedSlots([slot]); return }
    const first = selectedSlots[0]
    if (slot === first + THIRTY) { setSelectedSlots([first, slot]); return }
    if (slot === first - THIRTY) { setSelectedSlots([slot, first]); return }
    setSelectedSlots([slot])
  }

  async function submit() {
    if (!form.name || !form.email) return
    const duration = selectedType?.duration || 30
    const startMs  = selectedSlots[0]
    const endMs    = duration === 60 ? selectedSlots[1] + THIRTY : startMs + duration * 60 * 1000
    setSubmitting(true)
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, ...form, startMs, endMs, typeLabel: selectedType?.label }),
    })
    setSubmitting(false)
    if (res.ok) setView('success')
    else alert('Booking failed, please try again')
  }

  const canConfirm = selectedType && (
    selectedType.duration <= 30 ? selectedSlots.length === 1 :
    selectedSlots.length === 2
  )

  const today = new Date()
  const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + (cfg?.maxDaysAhead || 30))

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-red-500">{error}</p>
    </div>
  )

  if (!cfg) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start">
      <div className="w-full max-w-[430px] bg-white min-h-screen shadow-xl flex flex-col">

        {/* Profile */}
        <div className="px-7 pt-10 pb-7 text-center border-b border-gray-100">
          {cfg.avatar
            ? <img src={cfg.avatar} className="w-20 h-20 rounded-full mx-auto mb-4 ring-4 ring-white shadow" alt=""/>
            : <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold ring-4 ring-white shadow" style={{ background: accent + '20', color: accent }}>
                {cfg.name?.charAt(0) || '?'}
              </div>
          }
          <p className="text-lg font-semibold text-gray-900">{cfg.name}</p>
        </div>

        {/* View: Types */}
        {view === 'types' && (
          <div className="flex-1">
            {cfg.appointmentTypes?.map((t: any) => (
              <button key={t.id} onClick={() => pickType(t)}
                className="w-full flex items-center gap-4 px-7 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: t.color }}/>
                <div className="flex-1">
                  <p className="text-sm font-500 text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.duration} min</p>
                </div>
                <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            ))}
          </div>
        )}

        {/* View: Calendar */}
        {view === 'calendar' && (
          <div className="flex-1 flex flex-col">
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => setView('types')} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedType?.label}</p>
                <p className="text-xs text-gray-400">Select a Day</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-3">
              <button onClick={() => changeMonth(-1)} disabled={currentYear===today.getFullYear()&&currentMonth===today.getMonth()}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <span className="text-sm font-semibold">{MONTHS[currentMonth]} {currentYear}</span>
              <button onClick={() => changeMonth(1)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
            <div className="px-4">
              <div className="grid grid-cols-7 mb-1">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                  <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
                  <div key={i}/>
                ))}
                {Array.from({ length: new Date(currentYear, currentMonth+1, 0).getDate() }).map((_, i) => {
                  const d = i + 1
                  const date = new Date(currentYear, currentMonth, d)
                  const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
                  const isToday = date.toDateString() === today.toDateString()
                  const isPast  = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                  const isFar   = date > maxDate
                  const isAvail = (cfg.availableDays || []).includes(date.getDay()) && !isPast && !isFar
                  const isSel   = selectedDate === dateStr

                  return (
                    <button key={d} disabled={!isAvail} onClick={() => pickDate(dateStr)}
                      className={`aspect-square flex items-center justify-center rounded-full text-sm transition-colors
                        ${isSel ? 'text-white font-bold' : ''}
                        ${isAvail && !isSel ? 'text-gray-800 font-medium hover:opacity-80 cursor-pointer' : ''}
                        ${!isAvail ? 'text-gray-200 cursor-not-allowed' : ''}
                        ${isToday && isAvail && !isSel ? 'font-bold' : ''}
                      `}
                      style={isSel ? { background: accent } : isToday && isAvail ? { color: accent } : {}}>
                      {d}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="mt-auto px-6 py-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20"/></svg>
              Central Time – US & Canada
            </div>
          </div>
        )}

        {/* View: Slots */}
        {view === 'slots' && (
          <div className="flex-1 flex flex-col">
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => setView('calendar')} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedDate && (() => { const d = new Date(selectedDate+'T00:00:00'); return `${WDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}` })()}
                </p>
                <p className="text-xs text-gray-400">Duration: {selectedType?.duration} min</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2.5">
              {slotsLoading && <div className="w-5 h-5 border-2 border-gray-200 rounded-full mx-auto mt-8 animate-spin" style={{ borderTopColor: accent }}/>}
              {!slotsLoading && slots.length === 0 && <p className="text-sm text-gray-400 text-center pt-8">No times available</p>}
              {!slotsLoading && (selectedType?.duration === 60) && slots.length > 0 && (
                <p className="text-xs text-gray-400 text-center pb-2">Select two back-to-back slots</p>
              )}
              {!slotsLoading && slots.map((slot, i) => {
                const isActive = selectedSlots.includes(slot)
                return (
                  <button key={slot} onClick={() => pickSlot(slot)}
                    style={{ animationDelay: `${i*0.03}s`, ...(isActive ? { background: accent, borderColor: accent, color: 'white' } : {}) }}
                    className={`w-full py-3.5 rounded-lg border text-sm font-medium transition-colors
                      ${isActive ? '' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}
                    `}>
                    {new Date(slot).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </button>
                )
              })}
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button disabled={!canConfirm} onClick={() => setView('form')}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-30"
                style={{ background: accent }}>
                {canConfirm
                  ? `${new Date(selectedSlots[0]).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})} – ${new Date(selectedType?.duration===60?selectedSlots[1]+THIRTY:selectedSlots[0]+selectedType?.duration*60*1000).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})} →`
                  : 'Select a time'}
              </button>
            </div>
          </div>
        )}

        {/* View: Form */}
        {view === 'form' && (
          <div className="flex-1 flex flex-col">
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => setView('slots')} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div><p className="text-sm font-semibold">Your Details</p><p className="text-xs text-gray-400">Almost done</p></div>
            </div>
            <div className="px-6 py-4 rounded-xl mx-6 mt-4 text-sm font-medium" style={{ background: accent+'15', color: accent, borderLeft: `3px solid ${accent}` }}>
              {(() => {
                if (!selectedDate || !selectedSlots.length) return null
                const d = new Date(selectedDate+'T00:00:00')
                const start = new Date(selectedSlots[0])
                const dur = selectedType?.duration || 30
                const endMs = dur === 60 ? selectedSlots[1]+THIRTY : selectedSlots[0]+dur*60*1000
                const end = new Date(endMs)
                return `📅 ${WDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()} · ${start.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})} – ${end.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`
              })()}
            </div>
            <div className="flex-1 px-6 py-4 flex flex-col gap-3">
              {[
                { id:'name', label:'Full Name *', type:'text', placeholder:'Your full name' },
                { id:'email', label:'Email Address *', type:'email', placeholder:'you@email.com' },
                { id:'phone', label:'Phone (optional)', type:'tel', placeholder:'(555) 000-0000' },
              ].map(f => (
                <div key={f.id}>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={(form as any)[f.id]}
                    onChange={e => setForm(prev => ({...prev, [f.id]: e.target.value}))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-400" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes (optional)</label>
                <textarea placeholder="Anything you'd like to share?" value={form.notes}
                  onChange={e => setForm(prev => ({...prev, notes: e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-400 resize-none h-20"/>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={submit} disabled={!form.name||!form.email||submitting}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: accent }}>
                {submitting ? 'Confirming…' : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        )}

        {/* View: Success */}
        {view === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center px-7 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-2xl mb-5 shadow-[0_0_0_8px_#dcfce7]">✓</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">You're confirmed!</h2>
            <p className="text-sm text-gray-400 mb-6">A calendar invite and confirmation email are on their way.</p>
            <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-left text-sm text-gray-700 leading-relaxed">
              <strong>{selectedType?.label}</strong><br/>
              {selectedDate && (() => { const d = new Date(selectedDate+'T00:00:00'); return `${WDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}` })()}<br/>
              {selectedSlots[0] && new Date(selectedSlots[0]).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}
              {' – '}
              {selectedSlots[0] && (() => {
                const dur = selectedType?.duration || 30
                const endMs = dur===60 ? selectedSlots[1]+THIRTY : selectedSlots[0]+dur*60*1000
                return new Date(endMs).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})
              })()}<br/>
              <span className="text-gray-400">{form.email}</span>
            </div>
            <button onClick={() => { setView('types'); setSelectedType(null); setSelectedDate(null); setSelectedSlots([]); setForm({name:'',email:'',phone:'',notes:''}) }}
              className="mt-6 px-6 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              Book another
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
