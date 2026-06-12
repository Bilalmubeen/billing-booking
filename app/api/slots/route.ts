import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getFreeBusy } from '@/lib/calendar'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { username, date, duration } = await req.json()

    // Get user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Get availability for this day
    const dateObj = new Date(date + 'T00:00:00')
    const dayName = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][dateObj.getDay()]

    const { data: avail } = await supabaseAdmin
      .from('availability')
      .select('*')
      .eq('user_id', user.id)
      .eq('day', dayName)
      .eq('active', true)

    if (!avail || avail.length === 0) return NextResponse.json({ slots: [] })

    // Get busy times from Google Calendar
    const parts = date.split('-')
    const y = Number(parts[0]), m = Number(parts[1]) - 1, d = Number(parts[2])
    const dayStart = new Date(y, m, d, 0, 0, 0).toISOString()
    const dayEnd   = new Date(y, m, d, 23, 59, 59).toISOString()

    const busy = await getFreeBusy(
      user.google_access_token,
      user.google_refresh_token,
      dayStart,
      dayEnd
    )

    // Generate slots
    const slots: number[] = []
    const now = new Date()
    const increment = Math.min(duration, 30)

    for (const window of avail) {
      const [startH, startM] = window.start_time.split(':').map(Number)
      const [endH,   endM]   = window.end_time.split(':').map(Number)

      const windowStart = new Date(y, m, d, startH, startM, 0)
      const windowEnd   = new Date(y, m, d, endH,   endM,   0)
      let cursor = new Date(windowStart)

      while (true) {
        const slotStart = new Date(cursor)
        const slotEnd   = new Date(cursor.getTime() + duration * 60 * 1000)
        if (slotEnd > windowEnd) break

        // Skip past slots
        if (slotStart.getTime() > now.getTime()) {
          const conflict = busy.some((b: any) => {
            const bs = new Date(b.start), be = new Date(b.end)
            return bs < slotEnd && be > slotStart
          })
          if (!conflict) slots.push(slotStart.getTime())
        }

        cursor = new Date(cursor.getTime() + increment * 60 * 1000)
      }
    }

    return NextResponse.json({ slots })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
