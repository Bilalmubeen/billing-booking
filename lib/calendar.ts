import { google } from 'googleapis'

export function getCalendarClient(accessToken: string, refreshToken?: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })
  return google.calendar({ version: 'v3', auth })
}

export async function getFreeBusy(
  accessToken: string,
  refreshToken: string,
  timeMin: string,
  timeMax: string,
  calendarId: string = 'primary'
) {
  const calendar = getCalendarClient(accessToken, refreshToken)
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: [{ id: calendarId }],
    },
  })
  return res.data.calendars?.[calendarId]?.busy || []
}

export async function createCalendarEvent(
  accessToken: string,
  refreshToken: string,
  {
    title,
    start,
    end,
    guestEmail,
    description,
  }: {
    title: string
    start: Date
    end: Date
    guestEmail: string
    description?: string
  }
) {
  const calendar = getCalendarClient(accessToken, refreshToken)
  await calendar.events.insert({
    calendarId: 'primary',
    sendUpdates: 'all',
    requestBody: {
      summary: title,
      description,
      start: { dateTime: start.toISOString() },
      end:   { dateTime: end.toISOString() },
      attendees: [{ email: guestEmail }],
    },
  })
}
