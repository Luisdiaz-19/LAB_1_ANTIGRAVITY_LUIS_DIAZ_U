import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../contexts/AuthContext'

export default function ModeratorPanel() {
  const { user, logout } = useAuth()
  const [contenidoPendiente, setContenidoPendiente] = useState([])
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    API.get('/moderadores/contenido-pendiente').then(({ data }) => setContenidoPendiente(data)).catch(() => {})
  }, [])

  const cambiarEstado = async (cursoId, estado) => {
    try {
      const { data } = await API.put(`/moderadores/cursos/${cursoId}/estado`, { estado })
      setMensaje(data.mensaje)
      setContenidoPendiente(prev => prev.filter(c => c.id !== cursoId))
    } catch (err) {
      setMensaje('Error al actualizar estado')
    }
  }

  return (
    <div className="min-vh-100" style={{ background: '#0a0e1a', color: '#e2e8f0' }}>
      <nav className="navbar-cyan px-3 py-3 d-flex align-items-center justify-content-between sticky-top">
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2" style={{ color: 'inherit' }}>
          <span className="fs-3">🤖</span>
          <div>
            <span className="fw-bold fs-5 text-gradient">AI CURSOS MENTE ARTIFICIAL</span>
            <br /><small style={{ color: '#64748b', fontSize: '0.65rem' }}>the future begins today.</small>
          </div>
        </Link>
        <div className="d-flex align-items-center gap-3">
          <div className="text-end">
            <p className="small fw-medium mb-0">{user?.nombre} {user?.apellido}</p>
            <p className="small mb-0" style={{ color: '#a855f7' }}>Moderador</p>
          </div>
          <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40, background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
            {user?.nombre?.[0]}{user?.apellido?.[0]}
          </div>
          <button onClick={logout} className="btn btn-custom-danger small px-3 py-1 rounded-3">Cerrar sesión</button>
        </div>
      </nav>

      <div className="container py-4">
        <div className="mb-4">
          <h2 className="fw-bold fs-2 text-white">🛡️ Panel de Moderador</h2>
          <p style={{ color: '#64748b' }}>Revisa y publica contenido educativo</p>
        </div>

        {mensaje && (
          <div className="d-flex align-items-center justify-content-between badge-cyan rounded-3 px-4 py-3 mb-4 small">
            <span>💡 {mensaje}</span>
            <button className="btn btn-link text-decoration-none p-0 ms-2 fs-5" style={{ color: 'var(--cyan)' }} onClick={() => setMensaje('')}>×</button>
          </div>
        )}

        <div className="glass-card p-4">
          <h5 className="fw-bold mb-4 text-white">📋 Contenido Pendiente de Revisión</h5>

          {contenidoPendiente.length === 0 ? (
            <div className="text-center py-5">
              <span className="fs-1 mb-3 d-inline-block">✅</span>
              <p className="fs-5" style={{ color: '#64748b' }}>No hay contenido pendiente de revisión</p>
              <p className="small" style={{ color: '#475569' }}>Todo el contenido ha sido revisado y publicado</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {contenidoPendiente.map((curso) => (
                <div key={curso.id} className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 p-4 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(13,202,240,0.08)' }}>
                  <div className="d-flex align-items-center gap-3">
                    <span className="fs-1">{curso.imagen_emoji}</span>
                    <div>
                      <h6 className="fw-semibold text-white">{curso.nombre}</h6>
                      <p className="small mb-1" style={{ color: '#64748b' }}>{curso.descripcion_corta}</p>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge-yellow badge rounded-pill fw-medium px-3 py-1 small">📝 Borrador</span>
                        <span className="small" style={{ color: '#64748b' }}>📚 {curso.lecciones_count} lecciones</span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button onClick={() => cambiarEstado(curso.id, 'publicado')} className="btn btn-custom-success small px-4 py-2 rounded-3 fw-medium">✅ Publicar</button>
                    <button onClick={() => cambiarEstado(curso.id, 'borrador')} className="btn small px-4 py-2 rounded-3 fw-medium" style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: 'none' }}>
                      🔄 Revisar después
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
