import React, { useState } from 'react'
import { formatCurrency, formatDate, formatTime, getInitials, getAvatarColor } from '../utils/storage'

/* ── Icons ── */
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)
const IconMeet = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.31a1 1 0 0 1-1.447.914L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/>
  </svg>
)
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
)
const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>
  </svg>
)
const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.55 1.12h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 5.5 5.5l.89-.89a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2z"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconNote = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const IconUserX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <line x1="17" y1="8" x2="23" y2="14"/><line x1="23" y1="8" x2="17" y2="14"/>
  </svg>
)

const FILTERS = ['Todas', 'Pagadas', 'Pendientes']

export default function PatientView({
  patient, appointments, onTogglePaid, onUpdateAmount,
  onDeleteAppointment, onDeletePatient, onAddAppointment
}) {
  const [filter, setFilter] = useState('Todas')
  const [deleteConfirm, setDeleteConfirm] = useState(null) // appt id or 'patient'

  if (!patient) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-slate-500">Selecciona un paciente</p>
    </div>
  )

  const totalPaid = appointments.filter(a => a.paid).reduce((s, a) => s + (a.amount || 0), 0)
  const totalPending = appointments.filter(a => !a.paid).reduce((s, a) => s + (a.amount || 0), 0)

  const filtered = appointments.filter(a => {
    if (filter === 'Pagadas') return a.paid
    if (filter === 'Pendientes') return !a.paid
    return true
  }).sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time))

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Patient header */}
      <div className="glass-card p-6 mb-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarColor(patient.name)} flex items-center justify-center text-xl font-bold text-white shadow-glow-teal flex-shrink-0`}>
            {getInitials(patient.name)}
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white">{patient.name}</h2>
            <div className="flex flex-wrap gap-3 mt-1">
              {patient.email && (
                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                  <IconMail />{patient.email}
                </span>
              )}
              {patient.phone && (
                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                  <IconPhone />{patient.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex gap-4 text-center flex-shrink-0">
          <div className="glass-card px-4 py-2.5">
            <p className="text-lg font-display font-bold text-white">{appointments.length}</p>
            <p className="text-[11px] text-slate-500">citas</p>
          </div>
          <div className="glass-card px-4 py-2.5">
            <p className="text-lg font-display font-bold text-teal-400">{formatCurrency(totalPaid)}</p>
            <p className="text-[11px] text-slate-500">cobrado</p>
          </div>
          <div className="glass-card px-4 py-2.5">
            <p className="text-lg font-display font-bold text-amber-400">{formatCurrency(totalPending)}</p>
            <p className="text-[11px] text-slate-500">pendiente</p>
          </div>
        </div>
      </div>

      {/* Appointments header + filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                filter === f
                  ? 'bg-teal-500 text-slate-900 shadow-glow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
              {f === 'Pendientes' && appointments.filter(a => !a.paid).length > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === f ? 'bg-slate-900/30 text-slate-900' : 'bg-amber-500/20 text-amber-400'}`}>
                  {appointments.filter(a => !a.paid).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDeleteConfirm('patient')}
            className="btn-danger"
          >
            <IconUserX />
            Eliminar Paciente
          </button>
          <button onClick={onAddAppointment} className="btn-primary">
            <IconPlus />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* Appointments list */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
            <IconCalendar />
          </div>
          <p className="text-slate-400 font-medium mb-1">
            {filter === 'Todas' ? 'Sin citas registradas' : `Sin citas ${filter.toLowerCase()}`}
          </p>
          <p className="text-slate-600 text-sm">
            {filter === 'Todas' && 'Agrega la primera cita con el botón de arriba.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(appt => (
            <AppointmentCard
              key={appt.id}
              appt={appt}
              onTogglePaid={() => onTogglePaid(appt.id)}
              onUpdateAmount={(amt) => onUpdateAmount(appt.id, amt)}
              onDelete={() => setDeleteConfirm(appt.id)}
            />
          ))}
        </div>
      )}

      {/* Delete confirm overlay */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                <IconTrash />
              </div>
              <div>
                <h3 className="font-display font-semibold text-white">Confirmar eliminación</h3>
                <p className="text-xs text-slate-400">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-6">
              {deleteConfirm === 'patient'
                ? `¿Eliminar al paciente "${patient.name}" y todas sus citas?`
                : '¿Eliminar esta cita del historial?'
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="btn-ghost">Cancelar</button>
              <button
                onClick={() => {
                  if (deleteConfirm === 'patient') onDeletePatient(patient.id)
                  else onDeleteAppointment(deleteConfirm)
                  setDeleteConfirm(null)
                }}
                className="bg-rose-500 hover:bg-rose-400 text-white font-semibold px-4 py-2 rounded-xl transition-all text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AppointmentCard({ appt, onTogglePaid, onUpdateAmount, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempAmount, setTempAmount] = useState(appt.amount?.toString() || '')

  const handleSaveAmount = () => {
    onUpdateAmount(tempAmount)
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveAmount()
    if (e.key === 'Escape') {
      setTempAmount(appt.amount?.toString() || '')
      setIsEditing(false)
    }
  }

  return (
    <div className={`glass-card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-all duration-200 animate-slide-up border ${
      appt.paid ? 'border-teal-500/20' : 'border-amber-500/15'
    }`}>
      {/* Date/time block */}
      <div className="flex-shrink-0 w-20 text-center">
        <div className={`rounded-xl p-2 ${appt.paid ? 'bg-teal-500/10' : 'bg-amber-500/10'}`}>
          <p className={`text-xs font-semibold ${appt.paid ? 'text-teal-400' : 'text-amber-400'} uppercase`}>
            {appt.date ? new Date(appt.date + 'T12:00').toLocaleDateString('es-MX', { month: 'short' }) : '—'}
          </p>
          <p className="text-2xl font-display font-bold text-white leading-none">
            {appt.date ? appt.date.split('-')[2] : '—'}
          </p>
          <p className="text-[10px] text-slate-500">
            {appt.date ? new Date(appt.date + 'T12:00').toLocaleDateString('es-MX', { year: 'numeric' }) : ''}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-3 mb-2">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <IconClock />{formatTime(appt.time)}
          </span>
          {appt.meetLink && (
            <a
              href={appt.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 transition-colors"
            >
              <IconMeet />Abrir Meet
            </a>
          )}
        </div>
        {appt.notes && (
          <p className="flex items-start gap-1.5 text-xs text-slate-500 line-clamp-2">
            <IconNote className="mt-0.5 flex-shrink-0" />{appt.notes}
          </p>
        )}

        {/* Amount */}
        <div className="mt-2 flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">$</span>
              <input
                type="number"
                value={tempAmount}
                onChange={e => setTempAmount(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveAmount}
                autoFocus
                className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white font-display font-medium text-sm focus:outline-none focus:border-teal-500/50"
              />
              <span className="text-xs text-slate-500">Enter para guardar</span>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="group flex items-center gap-2 text-left"
            >
              <span className={`text-lg font-display font-bold ${appt.amount > 0 ? 'text-white' : 'text-slate-500'}`}>
                {appt.amount > 0 ? formatCurrency(appt.amount, appt.currency) : 'Asignar monto...'}
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded-md">
                Editar
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={appt.paid ? 'badge-paid' : 'badge-pending'}>
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${appt.paid ? 'bg-teal-400' : 'bg-amber-400'}`} />
          {appt.paid ? 'Pagado' : 'Pendiente'}
        </span>
        <button
          onClick={onTogglePaid}
          title={appt.paid ? 'Marcar como pendiente' : 'Marcar como pagado'}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border ${
            appt.paid
              ? 'bg-teal-500/15 border-teal-500/30 text-teal-400 hover:bg-teal-500/25'
              : 'bg-white/5 border-white/10 text-slate-500 hover:bg-teal-500/15 hover:border-teal-500/30 hover:text-teal-400'
          }`}
        >
          <IconCheck />
        </button>
        <button
          onClick={onDelete}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-slate-500 hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-400 transition-all duration-200"
        >
          <IconTrash />
        </button>
      </div>
    </div>
  )
}
