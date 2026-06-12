import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*, availability(*), appointment_types(*)')
    .eq('email', session.user.email)
    .single()

  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Update availability
  if (body.availability) {
    await supabaseAdmin.from('availability').delete().eq('user_id', user.id)
    const rows = body.availability.map((a: any) => ({ ...a, user_id: user.id }))
    if (rows.length > 0) await supabaseAdmin.from('availability').insert(rows)
  }

  // Update appointment types
  if (body.appointmentTypes) {
    await supabaseAdmin.from('appointment_types').delete().eq('user_id', user.id)
    const rows = body.appointmentTypes.map((t: any) => ({ ...t, user_id: user.id }))
    if (rows.length > 0) await supabaseAdmin.from('appointment_types').insert(rows)
  }

  // Update profile fields
  if (body.username || body.name) {
    await supabaseAdmin.from('users').update({
      ...(body.username && { username: body.username }),
      ...(body.name && { name: body.name }),
    }).eq('id', user.id)
  }

  return NextResponse.json({ ok: true })
}
