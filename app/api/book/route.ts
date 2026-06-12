import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createCalendarEvent } from '@/lib/calendar'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { username, name, email, phone, notes, startMs, endMs, typeLabel } = await req.json()

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const start = new Date(Number(startMs))
    const end   = new Date(Number(endMs))

    // Create calendar event
    await createCalendarEvent(user.google_access_token, user.google_refresh_token, {
      title: `${typeLabel} – ${name}`,
      start,
      end,
      guestEmail: email,
      description: `Client: ${name}\nEmail: ${email}${phone ? '\nPhone: ' + phone : ''}${notes ? '\nNotes: ' + notes : ''}`,
    })

    // Log booking
    await supabaseAdmin.from('bookings').insert({
      user_id: user.id,
      client_name: name,
      client_email: email,
      client_phone: phone || null,
      notes: notes || null,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      type_label: typeLabel,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
