import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../contexts/AuthContext'

export default function CourseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [curso, setCurso] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get(`/cursos/${id}`).then(({ data }) => {
      setCurso(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#0a0e1a' }}>
      <div className="fs-1" style={{ animation: 'spin 1s linear infinite' }}>🤖</div>
    </div>
  )

  if (!curso) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#0a0e1a' }}>
      <div className="text-center">
        <span className="fs-1">🔍</span>
        <p className="mt-3" style={{ color: '#64748b' }}>Curso no encontrado</p>
        <Link to="/" className="text-cyan mt-3 d-inline-block">Volver al inicio</Link>
      </div>
    </div>
  )

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
          {user ? (
            <Link to={user.rol === 'admin' ? '/admin' : user.rol === 'docente' ? '/docente' : user.rol === 'moderador' ? '/moderador' : '/estudiante'}
              className="btn btn-outline-cyan px-3 py-2 rounded-3 small">
              Ir a mi panel
            </Link>
          ) : (
            <Link to="/login" className="btn btn-cyan px-3 py-2 rounded-3 small fw-medium">
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>

      <div className="container py-4">
        <Link to="/" className="small text-decoration-none mb-4 d-inline-flex align-items-center gap-1" style={{ color: '#64748b' }}>
          ← Volver a cursos
        </Link>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="glass-card p-4 mb-4">
              <span className="fs-1 mb-3 d-inline-block">{curso.imagen_emoji}</span>
              <h1 className="fw-bold mb-2 text-white" style={{ fontSize: '2rem' }}>{curso.nombre}</h1>
              <p className="mb-4" style={{ color: '#64748b' }}>{curso.descripcion_larga || curso.descripcion_corta}</p>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className={`badge rounded-pill fw-medium px-3 py-1 ${curso.nivel === 'Principiante' ? 'badge-green' : curso.nivel === 'Intermedio' ? 'badge-yellow' : 'badge-red'}`}>{curso.nivel}</span>
                <span className="badge-silver badge rounded-pill fw-medium px-3 py-1">⏱️ {curso.duracion}</span>
                <span className="badge-silver badge rounded-pill fw-medium px-3 py-1">🌐 {curso.idioma}</span>
                {curso.precio > 0 ? (
                  <span className="badge-yellow badge rounded-pill fw-medium px-3 py-1">💰 ${curso.precio}</span>
                ) : (
                  <span className="badge-green badge rounded-pill fw-medium px-3 py-1">🎁 Gratis</span>
                )}
              </div>
              <div className="d-flex gap-3 small" style={{ color: '#64748b' }}>
                <span>👤 {curso.inscritos_count || 0} estudiantes inscritos</span>
                <span>📚 {curso.lecciones?.length || 0} lecciones</span>
              </div>
            </div>

            <div className="glass-card p-4">
              <h4 className="fw-bold mb-4 text-white">📖 Contenido del curso</h4>
              {curso.lecciones && curso.lecciones.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {curso.lecciones.map((lec, idx) => (
                    <div key={lec.id} className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(13,202,240,0.05)' }}>
                      <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: 40, height: 40, background: 'rgba(13,202,240,0.15)', color: 'var(--cyan)' }}>
                        <span className="fw-bold small">{idx + 1}</span>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="fw-medium mb-0">{lec.titulo}</h6>
                      </div>
                      <span className="small" style={{ color: '#64748b' }}>⏱️ {lec.duracion}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4" style={{ color: '#64748b' }}>Próximamente contenido disponible</p>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="glass-card p-4 sticky-top" style={{ top: 100 }}>
              <div className="text-center mb-4">
                <span className="fs-1 mb-2 d-inline-block">{curso.imagen_emoji}</span>
                <h5 className="fw-bold text-white">{curso.nombre}</h5>
              </div>

              <div className="d-flex flex-column gap-2 mb-4">
                <div className="d-flex justify-content-between small">
                  <span style={{ color: '#64748b' }}>Duración</span>
                  <span className="fw-medium">{curso.duracion}</span>
                </div>
                <div className="d-flex justify-content-between small">
                  <span style={{ color: '#64748b' }}>Nivel</span>
                  <span className="fw-medium">{curso.nivel}</span>
                </div>
                <div className="d-flex justify-content-between small">
                  <span style={{ color: '#64748b' }}>Lecciones</span>
                  <span className="fw-medium">{curso.lecciones?.length || 0}</span>
                </div>
                <div className="d-flex justify-content-between small">
                  <span style={{ color: '#64748b' }}>Idioma</span>
                  <span className="fw-medium">{curso.idioma}</span>
                </div>
                <div className="d-flex justify-content-between small">
                  <span style={{ color: '#64748b' }}>Cupo máximo</span>
                  <span className="fw-medium">{curso.cupo_maximo}</span>
                </div>
                {curso.precio > 0 && (
                  <div className="d-flex justify-content-between small">
                    <span style={{ color: '#64748b' }}>Precio</span>
                    <span className="fw-medium" style={{ color: '#eab308' }}>${curso.precio}</span>
                  </div>
                )}
              </div>

              {user ? (
                <Link to="/estudiante" className="btn btn-cyan w-100 fw-medium py-3 rounded-3 text-center d-block">
                  Ir a mi panel
                </Link>
              ) : (
                <Link to="/login" className="btn btn-cyan w-100 fw-medium py-3 rounded-3 text-center d-block">
                  Inscribirme ahora
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
