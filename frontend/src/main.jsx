import 'bootstrap/dist/css/bootstrap.min.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import StudentPanel from './pages/StudentPanel'
import AdminPanel from './pages/AdminPanel'
import TeacherPanel from './pages/TeacherPanel'
import ModeratorPanel from './pages/ModeratorPanel'
import CourseDetail from './pages/CourseDetail'
import CertificatesPage from './pages/CertificatesPage'

function ProtectedRoute({ children, rol }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#0a0e1a' }}>
      <div className="spinner-border text-info" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" />
  if (rol && user.rol !== rol) return <Navigate to="/" />
  return children
}

function RoleRouter() {
  const { user } = useAuth()
  if (!user) return <Home />
  switch (user.rol) {
    case 'admin': return <Navigate to="/admin" />
    case 'docente': return <Navigate to="/docente" />
    case 'moderador': return <Navigate to="/moderador" />
    default: return <Navigate to="/estudiante" />
  }
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleRouter />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cursos/:id" element={<CourseDetail />} />
      <Route path="/estudiante" element={<ProtectedRoute rol="student"><StudentPanel /></ProtectedRoute>} />
      <Route path="/estudiante/certificados" element={<ProtectedRoute rol="student"><CertificatesPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute rol="admin"><AdminPanel /></ProtectedRoute>} />
      <Route path="/docente" element={<ProtectedRoute rol="docente"><TeacherPanel /></ProtectedRoute>} />
      <Route path="/moderador" element={<ProtectedRoute rol="moderador"><ModeratorPanel /></ProtectedRoute>} />
    </Routes>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
