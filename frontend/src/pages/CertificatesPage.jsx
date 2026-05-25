import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../contexts/AuthContext'

export default function CertificatesPage() {
  const { user, logout } = useAuth()
  const [certificados, setCertificados] = useState([])

  useEffect(() => {
    if (user?.id) {
      API.get(`/estudiantes/certificados/${user.id}`).then(({ data }) => setCertificados(data)).catch(() => {})
    }
  }, [user])

  return (
    <div className="min-vh-100" style={{ background: '#0a0e1a', color: '#e2e8f0' }}>
      <nav className="navbar-cyan px-3 py-3 d-flex align-items-center justify-content-between sticky-top">
        <Link to="/estudiante" className="text-decoration-none d-flex align-items-center gap-2" style={{ color: 'inherit' }}>
          <span className="fs-3">🤖</span>
          <div>
            <span className="fw-bold fs-5 text-gradient">AI CURSOS MENTE ARTIFICIAL</span>
            <br /><small style={{ color: '#64748b', fontSize: '0.65rem' }}>the future begins today.</small>
          </div>
        </Link>
        <div className="d-flex align-items-center gap-3">
          <span className="small" style={{ color: '#64748b' }}>{user?.nombre} {user?.apellido}</span>
          <button onClick={logout} className="btn btn-link text-decoration-none small p-0" style={{ color: '#ef4444' }}>Cerrar sesión</button>
        </div>
      </nav>

      <div className="container py-4">
        <div className="mb-4">
          <Link to="/estudiante" className="small text-decoration-none mb-3 d-inline-flex align-items-center gap-1" style={{ color: '#64748b' }}>
            ← Volver al panel
          </Link>
          <h2 className="fw-bold fs-2 text-white">🎓 Mis Certificados</h2>
          <p style={{ color: '#64748b' }}>Todos tus certificados emitidos</p>
        </div>

        {certificados.length === 0 ? (
          <div className="glass-card text-center p-5">
            <span className="fs-1 mb-3 d-inline-block">🎓</span>
            <p className="fs-5" style={{ color: '#64748b' }}>No tienes certificados aún</p>
            <p className="small" style={{ color: '#475569' }}>Completa los cursos para obtener certificados</p>
            <Link to="/estudiante" className="btn btn-cyan px-4 py-2 rounded-3 fw-medium d-inline-block mt-3">
              Ir a mis cursos
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {certificados.map((cert) => (
              <div key={cert.id} className="col-md-6 col-lg-4">
                <div className="glass-card p-4 text-center position-relative overflow-hidden" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
                  <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,179,8,0.02))', borderRadius: '16px' }}></div>
                  <div className="position-relative">
                    <div className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-circle" style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #f59e0b, #eab308)', boxShadow: '0 0 20px rgba(245,158,11,0.2)' }}>
                      <span className="fs-2">🎓</span>
                    </div>
                    <h5 className="fw-bold mb-2 text-white">{cert.curso_nombre}</h5>
                    <div className="rounded-3 p-3 mb-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                      <p className="small mb-1" style={{ color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Código de verificación</p>
                      <p className="small fw-bold font-monospace mb-0" style={{ color: '#eab308', letterSpacing: '0.05em' }}>{cert.codigo}</p>
                    </div>
                    <div className="small" style={{ color: '#64748b' }}>
                      <p className="mb-1">Emitido el {new Date(cert.emitido_en).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="mb-0" style={{ color: 'rgba(13,202,240,0.5)' }}>AI CURSOS MENTE ARTIFICIAL · {new Date(cert.emitido_en).getFullYear()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
