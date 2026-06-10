'use client'
import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAY_LABELS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const COLORS = ['#7c3aed','#4f46e5','#0ea5e9','#10b981','#f59e0b','#ef4444','#ec4899']

type Availability = {
  day: string
  active: boolean
  start_time: string
  end_time: string
  start_time2?: string
  end_time2?: string
}

type AppointmentType = {
  label: string
  duration: number
  color: string
}

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
      // Init availability
      const avail = DAYS.map(day => {
        const existing = data.availability?.find((a: any) => a.day === day)
        return existing || { day, active: ['monday','tuesday','wednesday','thursday','friday'].includes(day), start_time: '09:00', end_time: '17:00' }
      })
      setAvailability(avail)
      // Init appointment types
      setApptTypes(data.appointment_types?.length ? data.appointment_types : [
        { label: '15 Minute Meeting', duration: 15, color: '#7c3aed' },
        { label: '30 Minute Meeting', duration: 30, color: '#4f46e5' },
        { label: '60 Minute Meeting', duration: 60, color: '#0ea5e9' },
      ])
    })
  }, [])

  async function save() {
    setSaving(true)
    await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        availability: availability.filter(a => a.active),
        appointmentTypes: apptTypes,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const bookingUrl = user ? `${window.location.origin}/book/${user.username}` : ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
          <span className="font-semibold text-gray-900">Booking</span>
        </div>
        <div className="flex items-center gap-3">
          {session?.user?.image && (
            <img src={session.user.image} className="w-8 h-8 rounded-full" alt="" />
          )}
          <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Booking link */}
        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Your booking page</p>
              <p className="text-sm text-blue-800 font-medium">{bookingUrl}</p>
            </div>
            <a href={bookingUrl} target="_blank" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 whitespace-nowrap">
              Open ↗
            </a>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {(['availability','types'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'availability' ? 'Availability' : 'Appointment Types'}
            </button>
          ))}
        </div>

        {/* Availability */}
        {tab === 'availability' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {availability.map((a, i) => (
              <div key={a.day} className={`p-4 ${i < availability.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 w-28">{DAY_LABELS[i]}</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setAvailability(av => av.map((x,j) => j===i ? {...x, active: !x.active} : x))}
                      className={`w-10 h-5 rounded-full transition-colors relative ${a.active ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${a.active ? 'translate-x-5' : 'translate-x-0.5'}`}/>
                    </div>
                    <span className={`text-sm ${a.active ? 'text-blue-600' : 'text-gray-400'}`}>{a.active ? 'On' : 'Off'}</span>
                  </label>
                </div>
                {a.active && (
                  <div className="flex items-center gap-2 mt-2">
                    <input type="time" value={a.start_time}
                      onChange={e => setAvailability(av => av.map((x,j) => j===i ? {...x, start_time: e.target.value} : x))}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700" />
                    <span className="text-gray-400 text-sm">to</span>
                    <input type="time" value={a.end_time}
                      onChange={e => setAvailability(av => av.map((x,j) => j===i ? {...x, end_time: e.target.value} : x))}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Appointment Types */}
        {tab === 'types' && (
          <div className="space-y-3">
            {apptTypes.map((t, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: t.color }} />
                <input value={t.label}
                  onChange={e => setApptTypes(types => types.map((x,j) => j===i ? {...x, label: e.target.value} : x))}
                  className="flex-1 text-sm font-medium text-gray-900 border-none outline-none" />
                <select value={t.duration}
                  onChange={e => setApptTypes(types => types.map((x,j) => j===i ? {...x, duration: Number(e.target.value)} : x))}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1 text-gray-600">
                  {[15,30,45,60,90,120].map(d => <option key={d} value={d}>{d} min</option>)}
                </select>
                <select value={t.color}
                  onChange={e => setApptTypes(types => types.map((x,j) => j===i ? {...x, color: e.target.value} : x))}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1">
                  {COLORS.map(c => <option key={c} value={c} style={{ background: c, color: 'white' }}>{c}</option>)}
                </select>
                <button onClick={() => setApptTypes(types => types.filter((_,j) => j!==i))}
                  className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
              </div>
            ))}
            <button
              onClick={() => setApptTypes(t => [...t, { label: 'New Meeting', duration: 30, color: '#4f46e5' }])}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
              + Add type
            </button>
          </div>
        )}

        {/* Save */}
        <div className="mt-6 flex items-center gap-3">
          <button onClick={save} disabled={saving}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && <span className="text-sm text-green-600">✓ Saved</span>}
        </div>
      </div>
    </div>
  )
}
