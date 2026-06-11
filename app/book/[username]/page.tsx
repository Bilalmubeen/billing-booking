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
    setAccent(type.color || '#1d4ed8')
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
    selectedType.duration <= 30 ? selectedSlots.length === 1 : selectedSlots.length === 2
  )

  const today = new Date()
  const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + (cfg?.maxDaysAhead || 30))

  const fmtTime   = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const fmtShort  = (s: string)  => { const d = new Date(s + 'T00:00:00'); return `${WDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}` }
  const fmtLong   = (s: string)  => { const d = new Date(s + 'T00:00:00'); return `${WDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` }
  const getEndMs  = ()           => {
    if (!selectedSlots.length) return 0
    const dur = selectedType?.duration || 30
    return dur === 60 ? selectedSlots[1] + THIRTY : selectedSlots[0] + dur * 60 * 1000
  }

  // ── Error / Loading ──────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>
        <p className="text-gray-700 font-medium">{error}</p>
      </div>
    </div>
  )

  if (!cfg) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-700 rounded-full animate-spin"/>
    </div>
  )

  // ── Shared: Google icon ──────────────────────────────────────────────────────
  const CalIcon = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  )
  const ClockIcon = () => (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  )
  const GlobeIcon = () => (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20"/>
    </svg>
  )
  const ChevLeft = () => (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
  )
  const ChevRight = () => (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
  )

  // ── Calendar grid (used in left panel) ──────────────────────────────────────
  const renderCalendar = () => (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(-1)}
          disabled={currentYear === today.getFullYear() && currentMonth === today.getMonth()}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors text-gray-500"
        >
          <ChevLeft />
        </button>
        <span className="text-sm font-semibold text-gray-900">{MONTHS[currentMonth]} {currentYear}</span>
        <button
          onClick={() => changeMonth(1)}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500"
        >
          <ChevRight />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1.5">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => <div key={i}/>)}
        {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }).map((_, i) => {
          const d = i + 1
          const date   = new Date(currentYear, currentMonth, d)
          const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
          const isToday = date.toDateString() === today.toDateString()
          const isPast  = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const isFar   = date > maxDate
          const isAvail = (cfg.availableDays || []).includes(date.getDay()) && !isPast && !isFar
          const isSel   = selectedDate === dateStr

          return (
            <div key={d} className="flex items-center justify-center p-0.5">
              <button
                disabled={!isAvail}
                onClick={() => pickDate(dateStr)}
                className={`w-9 h-9 rounded-full text-sm flex items-center justify-center transition-all ${
                  isSel
                    ? 'bg-blue-700 text-white font-semibold shadow-sm'
                    : isAvail
                    ? 'text-gray-900 font-medium hover:bg-blue-50 hover:text-blue-700 cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed'
                } ${isToday && isAvail && !isSel ? 'ring-2 ring-blue-700 ring-offset-1 font-bold' : ''}`}
              >
                {d}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── TYPES VIEW ───────────────────────────────────────────────────────────────
  if (view === 'types') return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Profile */}
        <div className="text-center mb-8">
          {cfg.avatar
            ? <img src={cfg.avatar} className="w-20 h-20 rounded-full mx-auto mb-4 ring-4 ring-white shadow" alt=""/>
            : <div className="w-20 h-20 rounded-full mx-auto mb-4 ring-4 ring-white shadow flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: accent }}>
                {cfg.name?.charAt(0) || '?'}
              </div>
          }
          <h1 className="text-xl font-bold text-gray-900">{cfg.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Select a meeting type</p>
        </div>

        {/* Event type cards */}
        <div className="space-y-3">
          {cfg.appointmentTypes?.map((t: any) => (
            <button
              key={t.id}
              onClick={() => pickType(t)}
              className="w-full text-left flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all group"
              style={{ borderLeftWidth: 4, borderLeftColor: t.color }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{t.label}</p>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <ClockIcon />
                  {t.duration} min
                </p>
              </div>
              <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-1 group-hover:stroke-gray-600 transition-colors">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ── SUCCESS VIEW ─────────────────────────────────────────────────────────────
  if (view === 'success') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 ring-8 ring-green-50">
          <svg width="24" height="24" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">You're confirmed!</h2>
        <p className="text-sm text-gray-500 mb-7 leading-relaxed">
          A calendar invite and confirmation email are on their way to <strong className="text-gray-700">{form.email}</strong>.
        </p>

        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-left space-y-2.5 mb-7 text-sm">
          <div className="flex items-center gap-2.5 font-semibold text-gray-900">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: accent }}/>
            {selectedType?.label} · {selectedType?.duration} min
          </div>
          {selectedDate && (
            <div className="flex items-center gap-2.5 text-gray-600">
              <CalIcon />
              {fmtLong(selectedDate)}
            </div>
          )}
          {selectedSlots[0] && (
            <div className="flex items-center gap-2.5 text-gray-600">
              <ClockIcon />
              {fmtTime(selectedSlots[0])} – {fmtTime(getEndMs())}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setView('types'); setSelectedType(null); setSelectedDate(null)
            setSelectedSlots([]); setForm({ name:'', email:'', phone:'', notes:'' })
          }}
          className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Book another time
        </button>
      </div>
    </div>
  )

  // ── MAIN SCHEDULING LAYOUT (calendar / slots / form) ─────────────────────────
  //
  // Desktop: two-panel (left = calendar info, right = slots or form)
  // Mobile:  single column, sequential
  //
  return (
    <div className="min-h-screen md:h-screen bg-white flex flex-col md:flex-row md:overflow-hidden">

      {/* ── LEFT PANEL: profile + calendar ── */}
      <div className={`
        flex flex-col bg-white border-gray-200
        md:w-[380px] md:flex-shrink-0 md:border-r md:overflow-y-auto
        ${(view === 'slots' || view === 'form') ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="flex-1 px-8 pt-8 pb-6">

          {/* Back to all types */}
          <button
            onClick={() => { setView('types'); setSelectedType(null); setSelectedDate(null); setSelectedSlots([]) }}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-7 transition-colors"
          >
            <ChevLeft />
            All event types
          </button>

          {/* Host profile */}
          {cfg.avatar
            ? <img src={cfg.avatar} className="w-12 h-12 rounded-full mb-3 ring-2 ring-gray-100" alt=""/>
            : <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center text-lg font-bold text-white ring-2 ring-gray-100"
                style={{ background: accent }}>
                {cfg.name?.charAt(0) || '?'}
              </div>
          }
          <p className="text-sm font-medium text-gray-500">{cfg.name}</p>

          {/* Event type info (calendar/slots views) */}
          {view !== 'form' && selectedType && (
            <div className="mt-3 pb-6 border-b border-gray-100 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedType.label}</h2>
              <div className="space-y-1.5 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <ClockIcon />
                  {selectedType.duration} min
                </div>
                <div className="flex items-center gap-2">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94M8 12.5s1-1 3-1 3.5 1 5 1 3-1 3-1"/>
                    <rect x="1" y="9" width="14" height="14" rx="2"/>
                  </svg>
                  Video · Google Meet
                </div>
              </div>
            </div>
          )}

          {/* Booking summary (form view — desktop left panel) */}
          {view === 'form' && selectedType && (
            <div className="mt-3 pb-6 border-b border-gray-100 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">{selectedType.label}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <ClockIcon />
                  {selectedType.duration} min
                </div>
                {selectedDate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalIcon />
                    {fmtLong(selectedDate)}
                  </div>
                )}
                {selectedSlots[0] && (
                  <div className="flex items-center gap-2 font-semibold" style={{ color: accent }}>
                    <ClockIcon />
                    {fmtTime(selectedSlots[0])} – {fmtTime(getEndMs())}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Calendar */}
          {view !== 'form' && renderCalendar()}
        </div>

        {/* Timezone footer */}
        {view !== 'form' && (
          <div className="px-8 py-3.5 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
            <GlobeIcon />
            Central Time – US & Canada
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: slots or form ── */}
      <div className={`
        flex-1 flex flex-col bg-white
        ${view === 'calendar' ? 'hidden md:flex' : 'flex'}
      `}>

        {/* Mobile back button */}
        {(view === 'slots' || view === 'form') && (
          <div className="md:hidden px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <button
              onClick={() => setView(view === 'form' ? 'slots' : 'calendar')}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ChevLeft />
              Back
            </button>
          </div>
        )}

        {/* Empty state when no date selected (desktop) */}
        {view === 'calendar' && (
          <div className="hidden md:flex flex-1 items-center justify-center px-8 text-center">
            <div>
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-700">
                <CalIcon />
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Select a date</p>
              <p className="text-xs text-gray-400">Available times will appear here</p>
            </div>
          </div>
        )}

        {/* ── TIME SLOTS ── */}
        {view === 'slots' && (
          <div className="flex-1 flex flex-col min-h-0">

            {/* Date header */}
            <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0">
              {selectedDate && (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-700 mb-1">
                    {MONTHS[new Date(selectedDate + 'T00:00:00').getMonth()]} {new Date(selectedDate + 'T00:00:00').getFullYear()}
                  </p>
                  <h3 className="text-lg font-bold text-gray-900">{fmtShort(selectedDate)}</h3>
                </>
              )}
              {selectedType?.duration === 60 && !slotsLoading && slots.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">Select two consecutive slots (60 min total)</p>
              )}
            </div>

            {/* Slots list */}
            <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
              {slotsLoading && (
                <div className="flex items-center justify-center py-14">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-700 rounded-full animate-spin"/>
                </div>
              )}
              {!slotsLoading && slots.length === 0 && (
                <div className="text-center py-14">
                  <p className="text-sm font-medium text-gray-500">No times available</p>
                  <p className="text-xs text-gray-400 mt-1">Try selecting a different date.</p>
                </div>
              )}
              {!slotsLoading && slots.length > 0 && (
                <div className="space-y-2">
                  {slots.map(slot => {
                    const isActive = selectedSlots.includes(slot)
                    return (
                      <button
                        key={slot}
                        onClick={() => pickSlot(slot)}
                        className={`w-full py-3 rounded-lg border text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-700 border-blue-700 text-white shadow-sm'
                            : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-700 hover:border-blue-700 hover:text-white'
                        }`}
                      >
                        {fmtTime(slot)}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Confirm CTA */}
            <div className="px-6 py-5 border-t border-gray-100 flex-shrink-0">
              <button
                disabled={!canConfirm}
                onClick={() => setView('form')}
                className="w-full py-3.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: canConfirm ? accent : '#9ca3af' }}
              >
                {canConfirm
                  ? `Next — ${fmtTime(selectedSlots[0])}`
                  : 'Select a time to continue'}
              </button>
            </div>
          </div>
        )}

        {/* ── BOOKING FORM ── */}
        {view === 'form' && (
          <div className="flex-1 flex flex-col min-h-0">

            {/* Mobile: mini booking recap */}
            <div className="md:hidden px-6 py-3 bg-blue-50 border-b border-blue-100 flex-shrink-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-blue-700">
                <span>{selectedType?.label}</span>
                <span className="opacity-40">·</span>
                {selectedDate && <span>{fmtShort(selectedDate)}</span>}
                {selectedSlots[0] && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>{fmtTime(selectedSlots[0])} – {fmtTime(getEndMs())}</span>
                  </>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-6 py-7 min-h-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Enter your details</h3>
              <p className="text-sm text-gray-400 mb-7">Almost done — confirm your appointment below.</p>

              <div className="space-y-4 max-w-sm">
                {[
                  { id: 'name',  label: 'Full Name',    type: 'text',  ph: 'Jane Smith',         req: true  },
                  { id: 'email', label: 'Email Address', type: 'email', ph: 'jane@example.com',   req: true  },
                  { id: 'phone', label: 'Phone',         type: 'tel',   ph: '+1 (555) 000-0000',  req: false },
                ].map(f => (
                  <div key={f.id}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      {f.label}
                      {f.req && <span className="text-red-400 ml-0.5">*</span>}
                      {!f.req && <span className="ml-1 text-gray-400 font-normal text-xs">optional</span>}
                    </label>
                    <input
                      type={f.type}
                      placeholder={f.ph}
                      value={(form as any)[f.id]}
                      onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Notes <span className="text-gray-400 font-normal text-xs ml-1">optional</span>
                  </label>
                  <textarea
                    placeholder="Anything you'd like to share beforehand?"
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none h-24"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="px-6 py-5 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={submit}
                disabled={!form.name || !form.email || submitting}
                className="w-full max-w-sm py-3.5 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                style={{ background: accent }}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Confirming…
                  </>
                ) : 'Confirm Appointment'}
              </button>
              <p className="text-xs text-gray-400 mt-3 max-w-sm">You'll receive a confirmation email and calendar invite immediately.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
