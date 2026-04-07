import React from 'react'
import { formatCurrency, getInitials, getAvatarColor } from '../utils/storage'
import GoogleConnect from './GoogleConnect'

const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconTrendUp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
)
const IconAlertCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)

export default function Dashboard({
  patients, appointments, onSelectPatient, onAddPatient,
  googleUser, onGoogleConnect, onGoogleDisconnect, onImportCalendar
}) {
  const now = new Date()
  const thisMonth = appointments.filter(a => {
    const d = new Date(a.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalRevenue = appointments.filter(a => a.paid).reduce((s, a) => s + (a.amount || 0), 0)
  const pendingRevenue = appointments.filter(a => !a.paid).reduce((s, a) => s + (a.amount || 0), 0)
  const pendingCount = appointments.filter(a => !a.paid).length

  // Recent appointments (last 5)
  const recent = [...appointments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  // Patients with pending payments
  const patientsWithPending = patients.filter(p =>
    appointments.some(a => a.patientId === p.id && !a.paid)
  )

  const stats = [
    {
      label: 'Total Pacientes',
      value: patients.length,
      icon: <IconUsers />,
      color: 'from-blue-500/20 to-indigo-500/10',
      border: 'border-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Citas este mes',
      value: thisMonth.length,
      icon: <IconCalendar />,
      color: 'from-teal-500/20 to-cyan-500/10',
      border: 'border-teal-500/20',
      iconColor: 'text-teal-400',
    },
    {
      label: 'Total cobrado',
      value: formatCurrency(totalRevenue),
      icon: <IconTrendUp />,
      color: 'from-emerald-500/20 to-green-500/10',
      border: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Pendiente de cobro',
      value: formatCurrency(pendingRevenue),
      icon: <IconAlertCircle />,
      color: 'from-amber-500/20 to-orange-500/10',
      border: 'border-amber-500/20',
      iconColor: 'text-amber-400',
    },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-white mb-1">
            Buenos días <span className="text-gradient">👋</span>
          </h2>
          <p className="text-slate-400 text-sm">
            {now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={onAddPatient} className="btn-primary">
          <IconPlus />
          Nuevo Paciente
        </button>
      </div>

      {/* Google Calendar integration banner */}
      <div className={`glass-card p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
        ${googleUser ? 'border-teal-500/20 bg-teal-500/5' : 'border-white/10'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            googleUser ? 'bg-teal-500/15 border border-teal-500/30' : 'bg-white/5 border border-white/10'
          }`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={googleUser ? '#14b8a6' : '#64748b'} strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {googleUser ? 'Google Calendar conectado' : 'Conecta tu Google Calendar'}
            </p>
            <p className="text-xs text-slate-500">
              {googleUser
                ? 'Importa citas de Meet con un clic desde cualquier rango de fechas'
                : 'Importa automáticamente tus citas de Google Meet'}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <GoogleConnect
            googleUser={googleUser}
            onConnect={onGoogleConnect}
            onDisconnect={onGoogleDisconnect}
            onImport={onImportCalendar}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`glass-card p-5 bg-gradient-to-br ${s.color} border ${s.border} animate-slide-up`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`mb-3 ${s.iconColor}`}>{s.icon}</div>
            <p className="text-2xl font-display font-bold text-white mb-1">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending payments */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white flex items-center gap-2">
              <IconAlertCircle />
              Pagos Pendientes
              {pendingCount > 0 && (
                <span className="badge-pending">{pendingCount}</span>
              )}
            </h3>
          </div>
          {patientsWithPending.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="text-slate-500 text-sm">¡Sin pagos pendientes!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {patientsWithPending.map(p => {
                const pend = appointments.filter(a => a.patientId === p.id && !a.paid)
                const total = pend.reduce((s, a) => s + (a.amount || 0), 0)
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPatient(p.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group text-left border border-transparent hover:border-white/10"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getAvatarColor(p.name)} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                      {getInitials(p.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.name}</p>
                      <p className="text-xs text-slate-500">{pend.length} cita(s) sin pagar</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-amber-400">{formatCurrency(total)}</p>
                      <IconArrow className="text-slate-600 group-hover:text-slate-400 ml-auto" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent appointments */}
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-white flex items-center gap-2 mb-4">
            <IconCalendar />
            Últimas Citas Registradas
          </h3>
          {recent.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">Sin citas registradas aún.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map(a => {
                const patient = patients.find(p => p.id === a.patientId)
                return (
                  <button
                    key={a.id}
                    onClick={() => patient && onSelectPatient(patient.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left border border-transparent hover:border-white/10"
                  >
                    {patient && (
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getAvatarColor(patient.name)} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                        {getInitials(patient.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{patient?.name || 'Paciente'}</p>
                      <p className="text-xs text-slate-500">{a.date} · {a.time}</p>
                    </div>
                    <span className={a.paid ? 'badge-paid' : 'badge-pending'}>
                      {a.paid ? '✓ Pagado' : '⏳ Pendiente'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* All patients (if any) */}
      {patients.length > 0 && (
        <div className="mt-6 glass-card p-5">
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <IconUsers />
            Todos los Pacientes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {patients.map(p => {
              const appts = appointments.filter(a => a.patientId === p.id)
              const paid = appts.filter(a => a.paid).length
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPatient(p.id)}
                  className="glass-card-hover p-4 text-left animate-slide-up"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(p.name)} flex items-center justify-center font-bold text-white text-sm`}>
                      {getInitials(p.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{p.name}</p>
                      <p className="text-xs text-slate-500 truncate">{p.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{appts.length} cita(s)</span>
                    <span>·</span>
                    <span className="text-teal-400">{paid} pagada(s)</span>
                    {appts.length - paid > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-amber-400">{appts.length - paid} pendiente(s)</span>
                      </>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
