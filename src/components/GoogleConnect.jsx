import React from 'react'
import { useGoogleLogin } from '@react-oauth/google'

const IconGoogle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)

const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
)

const IconImport = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
  </svg>
)

export default function GoogleConnect({ googleUser, onConnect, onDisconnect, onImport }) {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => onConnect(tokenResponse),
    onError: (err) => console.error('Google login error:', err),
    scope: 'https://www.googleapis.com/auth/calendar.events',
  })

  // Not connected
  if (!googleUser) {
    return (
      <button
        onClick={() => login()}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5
                   hover:bg-white/10 hover:border-white/25 transition-all duration-200 text-sm font-medium text-slate-300 hover:text-white group"
      >
        <IconGoogle />
        Conectar Google Calendar
        <span className="ml-1 text-[10px] text-slate-500 group-hover:text-slate-400 bg-white/5 px-1.5 py-0.5 rounded-md">
          Recomendado
        </span>
      </button>
    )
  }

  // Connected
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* User pill */}
      <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/25 rounded-xl px-3 py-2">
        {googleUser.picture ? (
          <img
            src={googleUser.picture}
            alt={googleUser.name}
            className="w-6 h-6 rounded-full ring-1 ring-teal-500/40"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-teal-500/30 flex items-center justify-center text-xs font-bold text-teal-300">
            {googleUser.name?.[0] || 'G'}
          </div>
        )}
        <span className="text-xs font-medium text-teal-300">{googleUser.email}</span>
        <span className="flex items-center gap-1 text-[10px] text-teal-500/70">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse-soft inline-block" />
          Conectado
        </span>
      </div>

      {/* Import button */}
      <button
        onClick={onImport}
        className="btn-primary"
      >
        <IconImport />
        Importar citas
      </button>

      {/* Disconnect */}
      <button
        onClick={onDisconnect}
        title="Desconectar Google"
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all duration-200"
      >
        <IconLogout />
      </button>
    </div>
  )
}
