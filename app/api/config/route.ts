import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')
  if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 })

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, name, avatar, username, availability(*), appointment_types(*)')
    .eq('username', username)
    .single()

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const availableDays = [...new Set(
    (user.availability || [])
      .filter((a: any) => a.active)
      .map((a: any) => ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].indexOf(a.day))
      .filter((d: number) => d >= 0)
  )]

  return NextResponse.json({
    name: user.name,
    avatar: user.avatar,
    username: user.username,
    availableDays,
    maxDaysAhead: 30,
    appointmentTypes: (user.appointment_types || []).map((t: any) => ({
      id: t.id,
      label: t.label,
      duration: t.duration,
      color: t.color,
    })),
  })
}
