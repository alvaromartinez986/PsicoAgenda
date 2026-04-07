import React, { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import PatientView from './components/PatientView'
import Modal from './components/Modal'
import AddPatientForm from './components/AddPatientForm'
import AddAppointmentForm from './components/AddAppointmentForm'
import ImportCalendarModal from './components/ImportCalendarModal'
import { generateId } from './utils/storage'
import { updateEventPaymentStatus, updateEventAmount, createCalendarEvent, calendarEventToAppointment } from './hooks/useGoogleCalendar'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <AppInner />
    </GoogleOAuthProvider>
  )
}

function AppInner() {
  const [data, setData] = useState({ patients: [], appointments: [] })
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [view, setView] = useState('dashboard')
  const [modal, setModal] = useState(null) // null | 'addPatient' | 'addAppointment' | 'importCalendar'
  const [isConnecting, setIsConnecting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Google auth state
  const [googleToken, setGoogleToken] = useState(null)   // access token response
  const [googleUser, setGoogleUser] = useState(null)     // { name, email, picture }



  // Fetch Google user profile once we have an access token
  useEffect(() => {
    if (!googleToken?.access_token) return
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${googleToken.access_token}` },
    })
      .then(r => r.json())
      .then(info => setGoogleUser({ name: info.name, email: info.email, picture: info.picture }))
      .catch(() => setGoogleUser(null))
  }, [googleToken])

  const selectedPatient = data.patients.find(p => p.id === selectedPatientId) || null

  const handleSelectPatient = (id) => {
    setSelectedPatientId(id)
    setView('patient')
  }

  const handleAddPatient = (formData) => {
    const newPatient = {
      id: generateId(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || '',
      createdAt: new Date().toISOString(),
    }
    setData(prev => ({ ...prev, patients: [...prev.patients, newPatient] }))
    setModal(null)
    handleSelectPatient(newPatient.id)
  }

  const handleAddAppointment = async (formData) => {
    if (!googleToken?.access_token) {
      alert("Por favor, conecta tu Google Calendar en el Dashboard primero para crear citas.")
      return
    }

    setIsConnecting(true)
    try {
      const googleEvent = await createCalendarEvent(googleToken.access_token, selectedPatient, formData)
      const newAppt = calendarEventToAppointment(googleEvent, selectedPatient.id)
      newAppt.id = generateId()

      setData(prev => ({ ...prev, appointments: [...prev.appointments, newAppt] }))
      setModal(null)
    } catch (err) {
      alert("Hubo un error al crear la cita en Google Calendar: " + err.message)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleTogglePaid = (apptId) => {
    // Buscar la cita actual antes de hacer la actualización de estado puro.
    // Esto evita que React Strict Mode dispare la petición de red dos veces en desarrollo.
    const targetAppt = data.appointments.find(a => a.id === apptId)
    if (targetAppt && targetAppt.googleEventId && googleToken?.access_token) {
      updateEventPaymentStatus(googleToken.access_token, targetAppt.googleEventId, !targetAppt.paid)
    }

    // Actualización pura de estado
    setData(prev => ({
      ...prev,
      appointments: prev.appointments.map(a =>
        a.id === apptId ? { ...a, paid: !a.paid } : a
      )
    }))
  }

  const handleUpdateAmount = (apptId, newAmount) => {
    const targetAppt = data.appointments.find(a => a.id === apptId)
    if (targetAppt && targetAppt.googleEventId && googleToken?.access_token) {
      updateEventAmount(googleToken.access_token, targetAppt.googleEventId, newAmount)
    }

    setData(prev => ({
      ...prev,
      appointments: prev.appointments.map(a =>
        a.id === apptId ? { ...a, amount: parseFloat(newAmount) || 0 } : a
      )
    }))
  }

  const handleDeleteAppointment = (apptId) => {
    setData(prev => ({
      ...prev,
      appointments: prev.appointments.filter(a => a.id !== apptId)
    }))
  }

  const handleDeletePatient = (patientId) => {
    setData(prev => ({
      ...prev,
      patients: prev.patients.filter(p => p.id !== patientId),
      appointments: prev.appointments.filter(a => a.patientId !== patientId),
    }))
    setView('dashboard')
    setSelectedPatientId(null)
  }

  // Called when user finishes selecting events in ImportCalendarModal
  const handleCalendarImport = (newAppointments, newPatients) => {
    setData(prev => ({
      ...prev,
      patients: [...prev.patients, ...newPatients],
      appointments: [...prev.appointments, ...newAppointments],
    }))
  }

  const handleGoogleConnect = (tokenResponse) => {
    setGoogleToken(tokenResponse)
  }

  const handleGoogleDisconnect = () => {
    setGoogleToken(null)
    setGoogleUser(null)
    setModal(null)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/6 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-3xl" />
      </div>

      <Sidebar
        patients={data.patients}
        appointments={data.appointments}
        selectedPatientId={selectedPatientId}
        onSelectPatient={handleSelectPatient}
        onSelectDashboard={() => { setView('dashboard'); setSelectedPatientId(null) }}
        onAddPatient={() => setModal('addPatient')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        view={view}
      />

      <main className="flex-1 overflow-y-auto relative z-10">
        {view === 'dashboard' ? (
          <Dashboard
            patients={data.patients}
            appointments={data.appointments}
            onSelectPatient={handleSelectPatient}
            onAddPatient={() => setModal('addPatient')}
            googleUser={googleUser}
            onGoogleConnect={handleGoogleConnect}
            onGoogleDisconnect={handleGoogleDisconnect}
            onImportCalendar={() => setModal('importCalendar')}
          />
        ) : (
          <PatientView
            patient={selectedPatient}
            appointments={data.appointments.filter(a => a.patientId === selectedPatientId)}
            onTogglePaid={handleTogglePaid}
            onUpdateAmount={handleUpdateAmount}
            onDeleteAppointment={handleDeleteAppointment}
            onDeletePatient={handleDeletePatient}
            onAddAppointment={() => setModal('addAppointment')}
          />
        )}
      </main>

      {/* Modals */}
      {modal === 'addPatient' && (
        <Modal title="Nuevo Paciente" onClose={() => setModal(null)}>
          <AddPatientForm onSubmit={handleAddPatient} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'addAppointment' && selectedPatient && (
        <Modal title={`Nueva Cita — ${selectedPatient.name}`} onClose={() => !isConnecting && setModal(null)}>
          <AddAppointmentForm 
            onSubmit={handleAddAppointment} 
            onCancel={() => setModal(null)} 
            isConnectingGoogle={isConnecting} 
          />
        </Modal>
      )}
      {modal === 'importCalendar' && googleToken && (
        <ImportCalendarModal
          onClose={() => setModal(null)}
          accessToken={googleToken.access_token}
          ownerEmail={googleUser?.email}
          patients={data.patients}
          appointments={data.appointments}
          onImport={handleCalendarImport}
        />
      )}
    </div>
  )
}
