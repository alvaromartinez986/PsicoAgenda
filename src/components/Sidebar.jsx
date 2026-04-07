import React from 'react'
import { getInitials, getAvatarColor } from '../utils/storage'

/* ── Icons ── */
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)
const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>
)
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconDot = ({ paid }) => (
  <span className={`inline-block w-1.5 h-1.5 rounded-full glow-dot ${paid ? 'bg-teal-400' : 'bg-amber-400'}`} />
)

export default function Sidebar({
  patients, appointments, selectedPatientId,
  onSelectPatient, onSelectDashboard, onAddPatient,
  searchQuery, setSearchQuery, view
}) {
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPatientStats = (patientId) => {
    const appts = appointments.filter(a => a.patientId === patientId)
    const pending = appts.filter(a => !a.paid).length
    return { total: appts.length, pending }
  }

  return (
    <aside className="w-72 flex-shrink-0 h-screen flex flex-col border-r border-white/7 relative z-10"
      style={{ background: 'rgba(9,14,26,0.8)', backdropFilter: 'blur(20px)' }}>

      {/* Logo / Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-glow-teal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div>
            <h1 className="font-display font-bold text-sm text-white tracking-tight">PsicoAgenda</h1>
            <p className="text-[10px] text-slate-500">Registro de citas y pagos</p>
          </div>
        </div>
      </div>

      <div className="px-4 mb-3">
        <div className="divider" />
      </div>

      {/* Nav */}
      <div className="px-4 mb-3">
        <button
          onClick={onSelectDashboard}
          className={view === 'dashboard' ? 'sidebar-item-active w-full text-left' : 'sidebar-item w-full text-left text-slate-400 hover:text-slate-200'}
        >
          <IconGrid />
          <span className="text-sm font-medium">Dashboard</span>
        </button>
      </div>

      <div className="px-4 mb-1">
        <div className="divider" />
        <p className="section-label flex items-center gap-2">
          <IconUsers />
          Pacientes
          <span className="ml-auto text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-400">
            {patients.length}
          </span>
        </p>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field pl-9 text-xs py-2"
          />
        </div>
      </div>

      {/* Patient list */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1 pb-4">
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-600 text-xs">
              {searchQuery ? 'Sin resultados' : 'Sin pacientes aún'}
            </p>
          </div>
        )}
        {filtered.map(patient => {
          const stats = getPatientStats(patient.id)
          const isActive = patient.id === selectedPatientId
          return (
            <button
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className={`w-full text-left ${isActive ? 'sidebar-item-active' : 'sidebar-item text-slate-300 hover:text-white'} animate-slide-in`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getAvatarColor(patient.name)} flex items-center justify-center flex-shrink-0 text-xs font-bold text-white`}>
                {getInitials(patient.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{patient.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{patient.email}</p>
              </div>
              {stats.pending > 0 && (
                <span className="badge-pending text-[10px] px-2 py-0.5 flex-shrink-0">
                  {stats.pending}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Add patient button */}
      <div className="px-4 py-4 border-t border-white/7">
        <button onClick={onAddPatient} className="btn-primary w-full justify-center">
          <IconPlus />
          Nuevo Paciente
        </button>
      </div>
    </aside>
  )
}
