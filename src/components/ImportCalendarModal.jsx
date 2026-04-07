import React, { useState } from 'react'
import { useGoogleCalendar, calendarEventToAppointment, matchPatientByEmail } from '../hooks/useGoogleCalendar'
import { isAlreadyImported, generateId, formatDate, formatTime } from '../utils/storage'

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)
const IconMeet = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.31a1 1 0 0 1-1.447.914L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/>
  </svg>
)
const IconUser = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

export default function ImportCalendarModal({
  onClose, accessToken, ownerEmail,
  patients, appointments, onImport
}) {
  const today = new Date().toISOString().split('T')[0]
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [dateFrom, setDateFrom] = useState(sixMonthsAgo)
  const [dateTo, setDateTo] = useState(today)
  const [events, setEvents] = useState(null) // null = not fetched yet
  const [selected, setSelected] = useState({}) // eventId → true/false
  const [importing, setImporting] = useState(false)
  const [importDone, setImportDone] = useState(false)
  const [importCount, setImportCount] = useState(0)

  const { fetchMeetEvents, loading, error } = useGoogleCalendar()

  const handleSearch = async () => {
    const raw = await fetchMeetEvents(accessToken, dateFrom, dateTo)
    
    // Filtrar para que solo pasen los eventos que tienen al menos un invitado externo
    const withGuests = raw.filter(e => {
      const attendees = e.attendees || []
      const external = attendees.filter(a => a.email && a.email.toLowerCase() !== ownerEmail?.toLowerCase())
      return external.length > 0
    })

    setEvents(withGuests)
    // Pre-select all events that are NOT already imported
    const sel = {}
    withGuests.forEach(e => {
      if (!isAlreadyImported(appointments, e.id)) sel[e.id] = true
    })
    setSelected(sel)
  }

  const toggleEvent = (id) => {
    if (isAlreadyImported(appointments, id)) return
    setSelected(p => ({ ...p, [id]: !p[id] }))
  }

  const toggleAll = () => {
    const importable = (events || []).filter(e => !isAlreadyImported(appointments, e.id))
    const allSelected = importable.every(e => selected[e.id])
    const sel = { ...selected }
    importable.forEach(e => { sel[e.id] = !allSelected })
    setSelected(sel)
  }

  const handleImport = async () => {
    setImporting(true)
    const toImport = (events || []).filter(e => selected[e.id] && !isAlreadyImported(appointments, e.id))
    const newAppointments = []
    const newPatients = []

    for (const event of toImport) {
      const appt = calendarEventToAppointment(event)
      appt.id = generateId()

      // Try to auto-match to an existing patient first
      const existingPatients = [...patients, ...newPatients]
      let matched = matchPatientByEmail(existingPatients, appt.attendees, ownerEmail)

      // If no match, create a new patient from the first external attendee
      if (!matched) {
        const externalAttendee = appt.attendees.find(a => a.email !== ownerEmail?.toLowerCase())
        if (externalAttendee) {
          const newP = {
            id: generateId(),
            name: externalAttendee.displayName || externalAttendee.email.split('@')[0], 
            email: externalAttendee.email,
            phone: '',
            createdAt: new Date().toISOString(),
            fromCalendar: true, // flag to indicate it was auto-created
          }
          newPatients.push(newP)
          matched = newP
        }
      }

      appt.patientId = matched?.id || null
      // Remove helper field before saving
      delete appt.attendees
      newAppointments.push(appt)
    }

    setImportCount(newAppointments.length)
    onImport(newAppointments, newPatients)
    setImporting(false)
    setImportDone(true)
  }

  const selectedCount = Object.values(selected).filter(Boolean).length
  const alreadyImportedCount = (events || []).filter(e => isAlreadyImported(appointments, e.id)).length
  const importableCount = (events || []).length - alreadyImportedCount

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-full max-w-2xl"
        style={{ maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <div>
            <h3 className="font-display font-semibold text-white text-lg">Importar desde Google Calendar</h3>
            <p className="text-xs text-slate-400 mt-0.5">Solo se importan eventos con link de Google Meet</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <IconX />
          </button>
        </div>

        {/* Success state */}
        {importDone ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h4 className="font-display font-bold text-white text-xl mb-2">¡Importación exitosa!</h4>
            <p className="text-slate-400 text-sm mb-6">
              Se importaron <span className="text-teal-400 font-semibold">{importCount} cita(s)</span> desde Google Calendar.
            </p>
            <button onClick={onClose} className="btn-primary px-8 justify-center">Listo</button>
          </div>
        ) : (
          <>
            {/* Date range picker */}
            <div className="glass-card p-4 mb-4 flex-shrink-0">
              <p className="text-xs font-medium text-slate-400 mb-3">Rango de fechas a importar</p>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-500 mb-1">Desde</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-500 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="input-field"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading || !dateFrom || !dateTo}
                  className="btn-primary flex-shrink-0 h-[42px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  ) : (
                    <IconSearch />
                  )}
                  {loading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-rose-300 text-sm mb-4 flex-shrink-0">
                <IconAlert />
                {error}
              </div>
            )}

            {/* Events list */}
            {events !== null && (
              <div className="flex-1 overflow-y-auto min-h-0">
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-500">
                      <IconCalendar />
                    </div>
                    <p className="text-slate-400 text-sm">No se encontraron eventos con Google Meet en ese rango.</p>
                    <p className="text-slate-600 text-xs mt-1">Intenta ajustar el rango de fechas.</p>
                  </div>
                ) : (
                  <>
                    {/* Batch controls */}
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
                      <p className="text-xs text-slate-400">
                        <span className="text-white font-medium">{events.length}</span> eventos encontrados
                        {alreadyImportedCount > 0 && (
                          <span className="text-slate-600 ml-1">({alreadyImportedCount} ya importados)</span>
                        )}
                      </p>
                      {importableCount > 0 && (
                        <button onClick={toggleAll} className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                          {Object.values(selected).filter(Boolean).length === importableCount ? 'Deseleccionar todos' : 'Seleccionar todos'}
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 pb-4">
                      {events.map(event => {
                        const alreadyDone = isAlreadyImported(appointments, event.id)
                        const isSelected = selected[event.id] || false
                        const start = event.start?.dateTime || event.start?.date || ''
                        const date = start.split('T')[0]
                        const time = start.includes('T') ? start.split('T')[1].substring(0, 5) : ''
                        const attendees = (event.attendees || []).map(a => ({ email: a.email?.toLowerCase(), displayName: a.displayName || '' }))
                        const externalAttendees = attendees.filter(a => a.email !== ownerEmail?.toLowerCase())
                        const matchedPatient = matchPatientByEmail(patients, attendees, ownerEmail)

                        return (
                          <div
                            key={event.id}
                            onClick={() => toggleEvent(event.id)}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-150 ${
                              alreadyDone
                                ? 'opacity-50 cursor-not-allowed border-white/5 bg-white/2'
                                : isSelected
                                  ? 'border-teal-500/40 bg-teal-500/8 cursor-pointer'
                                  : 'border-white/8 hover:border-white/15 bg-white/3 cursor-pointer'
                            }`}
                          >
                            {/* Checkbox */}
                            <div className={`w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center border transition-all ${
                              alreadyDone
                                ? 'bg-white/10 border-white/10'
                                : isSelected
                                  ? 'bg-teal-500 border-teal-500'
                                  : 'border-white/20 bg-white/5'
                            }`}>
                              {alreadyDone
                                ? <IconCheck className="text-slate-500" />
                                : isSelected
                                  ? <IconCheck />
                                  : null
                              }
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-white truncate">{event.summary || 'Sin título'}</p>
                                {alreadyDone && <span className="badge-paid flex-shrink-0 text-[10px]">Ya importado</span>}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                  <IconCalendar />{formatDate(date)}
                                </span>
                                {time && (
                                  <span className="text-xs text-slate-400">{time}</span>
                                )}
                                <span className="flex items-center gap-1 text-xs text-teal-400">
                                  <IconMeet />Google Meet
                                </span>
                              </div>

                              {/* Patient match */}
                              {!alreadyDone && (
                                <div className="mt-1.5 flex items-center gap-1.5">
                                  <IconUser />
                                  {matchedPatient ? (
                                    <span className="text-[11px] text-teal-400">
                                      Paciente: <span className="font-medium">{matchedPatient.name}</span>
                                    </span>
                                  ) : externalAttendees.length > 0 ? (
                                    <span className="text-[11px] text-amber-400">
                                      Se creará paciente: <span className="font-medium">{externalAttendees[0].displayName || externalAttendees[0].email}</span>
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-slate-500">Sin invitados detectados</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Footer */}
            {events !== null && selectedCount > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-white/7 flex-shrink-0 mt-3">
                <p className="text-sm text-slate-400">
                  <span className="text-white font-semibold">{selectedCount}</span> cita(s) seleccionada(s)
                </p>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="btn-primary disabled:opacity-60"
                >
                  {importing ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Importando...
                    </>
                  ) : (
                    <>Importar {selectedCount} cita(s)</>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
