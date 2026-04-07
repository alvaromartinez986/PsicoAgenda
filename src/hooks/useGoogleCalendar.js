/**
 * useGoogleCalendar — Hook to fetch events from Google Calendar API
 * and filter those with a Google Meet link.
 */
import { useState, useCallback } from 'react'

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

/**
 * Transform a Google Calendar event into a PsicoAgenda appointment shape.
 */
export function calendarEventToAppointment(event, patientId = null) {
  const start = event.start?.dateTime || event.start?.date || ''
  const date = start ? start.split('T')[0] : ''
  const time = start && start.includes('T')
    ? start.split('T')[1].substring(0, 5)
    : '00:00'

  return {
    googleEventId: event.id,
    patientId,
    date,
    time,
    meetLink: event.hangoutLink || '',
    amount: parseFloat(event.extendedProperties?.private?.psicoagenda_amount) || 0,
    currency: 'MXN',
    paid: event.extendedProperties?.private?.psicoagenda_paid === 'true',
    notes: event.summary || '',
    attendees: (event.attendees || []).map(a => ({
      email: a.email?.toLowerCase(),
      displayName: a.displayName || ''
    })),
    createdAt: new Date().toISOString(),
  }
}

/**
 * Find a patient whose email matches any attendee of the event.
 * Ignores the calendar owner's own email to avoid self-matching.
 */
export function matchPatientByEmail(patients, attendees, ownerEmail = '') {
  const ownerLower = ownerEmail.toLowerCase()
  const externalAttendees = attendees.filter(a => a.email !== ownerLower)
  for (const attendee of externalAttendees) {
    const match = patients.find(p => p.email.toLowerCase() === attendee.email)
    if (match) return match
  }
  return null
}

export function useGoogleCalendar() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Fetch all Google Meet events within a date range.
   * @param {string} accessToken  - Google OAuth access token
   * @param {string} timeMin      - ISO date string (start of range)
   * @param {string} timeMax      - ISO date string (end of range)
   * @returns {Array}             - Filtered calendar events with hangoutLink
   */
  const fetchMeetEvents = useCallback(async (accessToken, timeMin, timeMax) => {
    setLoading(true)
    setError(null)
    let allEvents = []
    let pageToken = null

    try {
      // Paginate through all results (Google returns max 250 per page)
      do {
        const params = new URLSearchParams({
          timeMin: new Date(timeMin).toISOString(),
          timeMax: new Date(timeMax + 'T23:59:59').toISOString(),
          singleEvents: 'true',
          orderBy: 'startTime',
          maxResults: '250',
          ...(pageToken ? { pageToken } : {}),
        })

        const res = await fetch(`${CALENDAR_API}?${params}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error?.message || `HTTP ${res.status}`)
        }

        const data = await res.json()
        allEvents = [...allEvents, ...(data.items || [])]
        pageToken = data.nextPageToken || null
      } while (pageToken)

      // Keep only events that have a Google Meet link
      const meetEvents = allEvents.filter(e => e.hangoutLink)
      return meetEvents
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return { fetchMeetEvents, loading, error }
}

/**
 * Updates an event's extended property to securely preserve the payment status
 * on Google Calendar across devices.
 */
export async function updateEventPaymentStatus(accessToken, eventId, isPaid) {
  try {
    const res = await fetch(`${CALENDAR_API}/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        extendedProperties: {
          private: {
            psicoagenda_paid: isPaid.toString()
          }
        }
      })
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || `HTTP ${res.status}`)
    }
    return true
  } catch (err) {
    console.error('Failed to update event payment status on Google Calendar:', err)
    return false
  }
}

/**
 * Updates an event's extended property to securely preserve the appointment amount
 * on Google Calendar across devices.
 */
export async function updateEventAmount(accessToken, eventId, amount) {
  try {
    const res = await fetch(`${CALENDAR_API}/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        extendedProperties: {
          private: {
            psicoagenda_amount: amount.toString()
          }
        }
      })
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || `HTTP ${res.status}`)
    }
    return true
  } catch (err) {
    console.error('Failed to update event amount on Google Calendar:', err)
    return false
  }
}

/**
 * Creates a new event on Google Calendar, generating a Meet link,
 * adding the patient as attendee, and setting the initial amount and paid status.
 */
export async function createCalendarEvent(accessToken, patient, formData) {
  // 1 hour default duration
  const startDateTime = new Date(`${formData.date}T${formData.time}`)
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000)

  const eventBody = {
    summary: `Consulta psicológica: ${patient.name}`,
    description: formData.notes || '',
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    attendees: patient.email ? [{ email: patient.email }] : [],
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
    extendedProperties: {
      private: {
        psicoagenda_paid: 'false',
        psicoagenda_amount: (parseFloat(formData.amount) || 0).toString(),
      },
    },
  }

  const res = await fetch(`${CALENDAR_API}?conferenceDataVersion=1`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventBody),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || `HTTP ${res.status}`)
  }

  const newEvent = await res.json()
  return newEvent
}
