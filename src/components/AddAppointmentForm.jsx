import React, { useState } from 'react'

const CURRENCIES = ['MXN', 'USD', 'COP', 'EUR', 'ARS', 'PEN', 'CLP']

export default function AddAppointmentForm({ onSubmit, onCancel, isConnectingGoogle }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    date: today,
    time: '10:00',
    amount: '',
    currency: 'MXN',
    notes: '',
  })
  const [errors, setErrors] = useState({})

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }))
    setErrors(p => ({ ...p, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.date) e.date = 'La fecha es requerida.'
    if (!form.time) e.time = 'La hora es requerida.'
    return e
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Fecha <span className="text-rose-400">*</span>
          </label>
          <input
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className={`input-field ${errors.date ? 'border-rose-500/50' : ''}`}
          />
          {errors.date && <p className="text-xs text-rose-400 mt-1">{errors.date}</p>}
        </div>
        {/* Time */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Hora <span className="text-rose-400">*</span>
          </label>
          <input
            type="time"
            value={form.time}
            onChange={e => set('time', e.target.value)}
            className={`input-field ${errors.time ? 'border-rose-500/50' : ''}`}
          />
          {errors.time && <p className="text-xs text-rose-400 mt-1">{errors.time}</p>}
        </div>
      </div>

      {/* Meet link info */}
      <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.31a1 1 0 0 1-1.447.914L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-teal-400 mb-0.5">Google Meet Automático</p>
          <p className="text-xs text-slate-400">Se generará un enlace de Meet al crear la cita, y se invitará al paciente si tiene correo.</p>
        </div>
      </div>

      {/* Amount + currency */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Monto de la sesión</label>
        <div className="flex gap-2">
          <select
            value={form.currency}
            onChange={e => set('currency', e.target.value)}
            className="input-field w-24 flex-shrink-0"
          >
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              className="input-field pl-7"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Notas (opcional)</label>
        <textarea
          rows={3}
          placeholder="Observaciones de la sesión, temas tratados..."
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          className="input-field resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={isConnectingGoogle} className="btn-ghost flex-1 justify-center disabled:opacity-50">Cancelar</button>
        <button type="submit" disabled={isConnectingGoogle} className="btn-primary flex-1 justify-center disabled:opacity-60">
          {isConnectingGoogle ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Creando...
            </>
          ) : (
            'Crear Cita'
          )}
        </button>
      </div>
    </form>
  )
}
