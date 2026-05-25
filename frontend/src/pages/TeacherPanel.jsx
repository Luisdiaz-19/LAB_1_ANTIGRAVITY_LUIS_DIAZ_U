import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../contexts/AuthContext'

export default function TeacherPanel() {
  const { user, logout } = useAuth()
  const [misCursos, setMisCursos] = useState([])
  const [lecciones, setLecciones] = useState([])
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [nuevaLeccion, setNuevaLeccion] = useState({ titulo: '', contenido: '', video_url: '', duracion: '', orden: 0 })

  useEffect(() => {
    if (user?.id) {
      API.get(`/docentes/${user.id}/cursos`).then(({ data }) => setMisCursos(data)).catch(() => {})
    }
  }, [user])

  const cargarLecciones = (cursoId) => {
    setCursoSeleccionado(cursoId)
    API.get(`/docentes/lecciones/${cursoId}`).then(({ data }) => setLecciones(data)).catch(() => {})
  }

  const crearLeccion = async (e) => {
    e.preventDefault()
    try {
      await API.post('/docentes/lecciones', { ...nuevaLeccion, curso_id: cursoSeleccionado })
      setMensaje('Lección creada correctamente')
      setShowForm(false)
      setNuevaLeccion({ titulo: '', contenido: '', video_url: '', duracion: '', orden: 0 })
      cargarLecciones(cursoSeleccionado)
    } catch (err) {
      setMensaje('Error al crear lección')
    }
  }

  const eliminarLeccion = async (leccionId) => {
    try {
      await API.delete(`/docentes/lecciones/${leccionId}`)
      setMensaje('Lección eliminada')
      cargarLecciones(cursoSeleccionado)
    } catch (err) {
      setMensaje('Error al eliminar lección')
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
            <p className="small mb-0 text-cyan">Docente</p>
          </div>
          <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40, background: 'rgba(13,202,240,0.15)', color: 'var(--cyan)' }}>
            {user?.nombre?.[0]}{user?.apellido?.[0]}
          </div>
          <button onClick={logout} className="btn btn-custom-danger small px-3 py-1 rounded-3">Cerrar sesión</button>
        </div>
      </nav>

      <div className="container py-4">
        <div className="mb-4">
          <h2 className="fw-bold fs-2 text-white">👨‍🏫 Panel de Docente</h2>
          <p style={{ color: '#64748b' }}>Gestiona tus cursos y crea contenido educativo</p>
        </div>

        {mensaje && (
          <div className="d-flex align-items-center justify-content-between badge-cyan rounded-3 px-4 py-3 mb-4 small">
            <span>💡 {mensaje}</span>
            <button className="btn btn-link text-decoration-none p-0 ms-2 fs-5" style={{ color: 'var(--cyan)' }} onClick={() => setMensaje('')}>×</button>
          </div>
        )}

        <div className="row g-4">
          <div className="col-md-4">
            <div className="glass-card p-4">
              <h5 className="fw-bold mb-3 text-white">📚 Mis Cursos</h5>
              {misCursos.length === 0 ? (
                <p className="small" style={{ color: '#475569' }}>No tienes cursos asignados</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {misCursos.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => cargarLecciones(c.id)}
                      className={`btn w-100 text-start p-3 rounded-3 d-flex align-items-center gap-2 ${cursoSeleccionado === c.id ? 'badge-cyan' : ''}`}
                      style={cursoSeleccionado !== c.id ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(13,202,240,0.05)', color: '#e2e8f0' } : { border: '1px solid rgba(13,202,240,0.2)' }}
                    >
                      <span className="fs-3">{c.imagen_emoji}</span>
                      <div className="flex-grow-1 min-w-0">
                        <p className="fw-medium mb-0 small text-truncate text-white">{c.nombre}</p>
                        <p className="small mb-0" style={{ color: '#64748b' }}>{c.lecciones_count} lecciones · {c.inscritos_count} estudiantes</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-md-8">
            {cursoSeleccionado ? (
              <div>
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h5 className="fw-bold mb-0 text-white">📖 Lecciones del curso</h5>
                  <button onClick={() => setShowForm(!showForm)} className="btn btn-cyan px-4 py-2 rounded-3 small fw-medium">
                    {showForm ? '✕ Cancelar' : '➕ Nueva lección'}
                  </button>
                </div>

                {showForm && (
                  <form onSubmit={crearLeccion} className="glass-card p-4 mb-4">
                    <h6 className="fw-semibold mb-3 text-white">Crear nueva lección</h6>
                    <div className="d-flex flex-column gap-3">
                      <div>
                        <label className="small mb-1" style={{ color: '#64748b' }}>Título</label>
                        <input className="form-control form-control-custom" value={nuevaLeccion.titulo} onChange={(e) => setNuevaLeccion({...nuevaLeccion, titulo: e.target.value})} required />
                      </div>
                      <div>
                        <label className="small mb-1" style={{ color: '#64748b' }}>Contenido (markdown)</label>
                        <textarea className="form-control form-control-custom" style={{ height: 120 }} value={nuevaLeccion.contenido} onChange={(e) => setNuevaLeccion({...nuevaLeccion, contenido: e.target.value})} />
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="small mb-1" style={{ color: '#64748b' }}>URL del video</label>
                          <input className="form-control form-control-custom" value={nuevaLeccion.video_url} onChange={(e) => setNuevaLeccion({...nuevaLeccion, video_url: e.target.value})} />
                        </div>
                        <div className="col-md-3">
                          <label className="small mb-1" style={{ color: '#64748b' }}>Duración</label>
                          <input className="form-control form-control-custom" placeholder="45 min" value={nuevaLeccion.duracion} onChange={(e) => setNuevaLeccion({...nuevaLeccion, duracion: e.target.value})} />
                        </div>
                        <div className="col-md-3">
                          <label className="small mb-1" style={{ color: '#64748b' }}>Orden</label>
                          <input type="number" className="form-control form-control-custom" value={nuevaLeccion.orden} onChange={(e) => setNuevaLeccion({...nuevaLeccion, orden: parseInt(e.target.value) || 0})} />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-custom-success px-4 py-2 rounded-3 fw-medium" style={{ alignSelf: 'flex-start' }}>Crear lección</button>
                    </div>
                  </form>
                )}

                {lecciones.length === 0 ? (
                  <div className="glass-card text-center p-5">
                    <span className="fs-1 mb-3 d-inline-block">📖</span>
                    <p style={{ color: '#64748b' }}>No hay lecciones en este curso</p>
                    <button onClick={() => setShowForm(true)} className="btn btn-link text-cyan text-decoration-none small p-0 mt-1">Crear primera lección</button>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {lecciones.sort((a, b) => a.orden - b.orden).map((lec, idx) => (
                      <div key={lec.id} className="glass-card p-3 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div className="d-flex align-items-center justify-content-center rounded-3 fw-bold small" style={{ width: 40, height: 40, background: 'rgba(13,202,240,0.15)', color: 'var(--cyan)' }}>
                            {idx + 1}
                          </div>
                          <div>
                            <h6 className="fw-medium mb-0 text-white">{lec.titulo}</h6>
                            <p className="small mb-0" style={{ color: '#64748b' }}>
                              {lec.duracion ? `⏱️ ${lec.duracion}` : ''}
                              {lec.video_url ? ' · 🎬 Con video' : ''}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => eliminarLeccion(lec.id)} className="btn btn-link text-decoration-none p-1 small" style={{ color: '#ef4444' }}>🗑️</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card text-center p-5">
                <span className="fs-1 mb-3 d-inline-block">👈</span>
                <p className="fs-5" style={{ color: '#64748b' }}>Selecciona un curso</p>
                <p className="small" style={{ color: '#475569' }}>Elige un curso del panel izquierdo para gestionar sus lecciones</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
