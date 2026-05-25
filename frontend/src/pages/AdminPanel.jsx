import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../contexts/AuthContext'

function getEstadoBadge(estado) {
  if (estado === "aceptado") return "badge-green"
  if (estado === "en_espera") return "badge-yellow"
  if (estado === "rechazado") return "badge-red"
  return "badge-silver"
}

function getEstadoIcon(estado) {
  if (estado === "aceptado") return "✅"
  if (estado === "en_espera") return "⏳"
  if (estado === "rechazado") return "❌"
  return "📋"
}

export default function AdminPanel() {
  const { user, logout } = useAuth()
  const [solicitudes, setSolicitudes] = useState([])
  const [todasInscripciones, setTodasInscripciones] = useState([])
  const [cursos, setCursos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [tab, setTab] = useState('solicitudes')

  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newUser, setNewUser] = useState({ nombre: '', apellido: '', correo: '', password: '', rol: 'student' })

  useEffect(() => {
    Promise.all([
      API.get('/solicitudes').then(r => setSolicitudes(r.data)).catch(() => {}),
      API.get('/solicitudes/todas').then(r => setTodasInscripciones(r.data)).catch(() => {}),
      API.get('/cursos').then(r => setCursos(r.data)).catch(() => {}),
      API.get('/auth/usuarios').then(r => setUsuarios(r.data)).catch(() => {}),
    ]).then(() => {})
  }, [])

  const cargarDatos = () => {
    API.get('/solicitudes').then(r => setSolicitudes(r.data)).catch(() => {})
    API.get('/solicitudes/todas').then(r => setTodasInscripciones(r.data)).catch(() => {})
    API.get('/cursos').then(r => setCursos(r.data)).catch(() => {})
    API.get('/auth/usuarios').then(r => setUsuarios(r.data)).catch(() => {})
  }

  const actualizarEstado = async (inscripcionId, nuevoEstado) => {
    try {
      const { data } = await API.put(`/solicitudes/${inscripcionId}/estado`, { estado: nuevoEstado })
      setMensaje(data.mensaje)
      cargarDatos()
    } catch (err) {
      setMensaje('Error al actualizar estado')
    }
  }

  const crearUsuario = async (e) => {
    e.preventDefault()
    try {
      await API.post('/auth/usuarios', newUser)
      setMensaje(`Usuario ${newUser.nombre} creado correctamente`)
      setShowCreateUser(false)
      setNewUser({ nombre: '', apellido: '', correo: '', password: '', rol: 'student' })
      cargarDatos()
    } catch (err) {
      setMensaje(err.response?.data?.detail || 'Error al crear usuario')
    }
  }

  const cambiarRol = async (userId, rol) => {
    try {
      await API.put(`/auth/usuarios/${userId}/rol?rol=${rol}`)
      setMensaje('Rol actualizado')
      cargarDatos()
    } catch (err) {
      setMensaje('Error al cambiar rol')
    }
  }

  const cambiarEstadoUsuario = async (userId, estado) => {
    try {
      await API.put(`/auth/usuarios/${userId}/estado?estado=${estado}`)
      setMensaje('Estado actualizado')
      cargarDatos()
    } catch (err) {
      setMensaje('Error al cambiar estado')
    }
  }

  const rolesDisponibles = [
    { value: 'admin', label: 'Admin' },
    { value: 'docente', label: 'Docente' },
    { value: 'moderador', label: 'Moderador' },
    { value: 'student', label: 'Estudiante' },
  ]

  const aceptados = todasInscripciones.filter(i => i.estado === 'aceptado').length
  const pendientes = todasInscripciones.filter(i => i.estado === 'en_espera').length
  const rechazados = todasInscripciones.filter(i => i.estado === 'rechazado').length

  const tabs = [
    { key: 'solicitudes', label: `📋 Solicitudes`, count: pendientes },
    { key: 'inscripciones', label: `📚 Inscripciones (${todasInscripciones.length})` },
    { key: 'cursos', label: `📖 Cursos (${cursos.length})` },
    { key: 'usuarios', label: `👥 Usuarios (${usuarios.length})` },
  ]

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
            <p className="small mb-0" style={{ color: '#ef4444' }}>Administrador</p>
          </div>
          <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
            {user?.nombre?.[0]}{user?.apellido?.[0]}
          </div>
          <button onClick={logout} className="btn btn-custom-danger small px-3 py-1 rounded-3">Cerrar sesión</button>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="glass-card p-3 text-center">
              <span className="fs-2">📋</span>
              <p className="fs-4 fw-bold mb-0" style={{ color: '#eab308' }}>{pendientes}</p>
              <p className="small mb-0" style={{ color: '#64748b' }}>Pendientes</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="glass-card p-3 text-center">
              <span className="fs-2">✅</span>
              <p className="fs-4 fw-bold mb-0 text-green">{aceptados}</p>
              <p className="small mb-0" style={{ color: '#64748b' }}>Aceptados</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="glass-card p-3 text-center">
              <span className="fs-2">❌</span>
              <p className="fs-4 fw-bold mb-0" style={{ color: '#ef4444' }}>{rechazados}</p>
              <p className="small mb-0" style={{ color: '#64748b' }}>Rechazados</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="glass-card p-3 text-center">
              <span className="fs-2">👥</span>
              <p className="fs-4 fw-bold mb-0 text-cyan">{usuarios.length}</p>
              <p className="small mb-0" style={{ color: '#64748b' }}>Usuarios</p>
            </div>
          </div>
        </div>

        {mensaje && (
          <div className="d-flex align-items-center justify-content-between badge-cyan rounded-3 px-4 py-3 mb-4 small">
            <span>💡 {mensaje}</span>
            <button className="btn btn-link text-decoration-none p-0 ms-2 fs-5" style={{ color: 'var(--cyan)' }} onClick={() => setMensaje('')}>×</button>
          </div>
        )}

        <div className="d-flex gap-2 mb-4 border-bottom pb-3 flex-wrap" style={{ borderColor: 'rgba(13,202,240,0.08)' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`btn rounded-3 small fw-medium px-3 py-2 ${tab === t.key ? 'badge-cyan' : 'btn'}`}
              style={tab !== t.key ? { background: 'transparent', color: '#64748b', border: '1px solid transparent' } : { border: '1px solid rgba(13,202,240,0.2)' }}
            >
              {t.label}{t.count > 0 ? <span className="ms-1 badge-yellow rounded-pill px-2 py-0 small ms-1">{t.count}</span> : ''}
            </button>
          ))}
        </div>

        {tab === 'solicitudes' && (
          <div>
            {solicitudes.length === 0 ? (
              <div className="glass-card text-center p-5">
                <span className="fs-1 mb-3 d-inline-block">✅</span>
                <p className="fs-5" style={{ color: '#64748b' }}>No hay solicitudes pendientes</p>
                <p className="small" style={{ color: '#475569' }}>Los nuevos estudiantes aparecerán aquí</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {solicitudes.map((sol) => (
                  <div key={sol.id} className="glass-card p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white" style={{ width: 56, height: 56, background: 'linear-gradient(135deg, var(--cyan), var(--green))', boxShadow: '0 0 20px rgba(13,202,240,0.2)' }}>
                        {sol.usuario_nombre?.split(' ').map(n => n[0]).join('').slice(0, 2) || '👤'}
                      </div>
                      <div>
                        <h6 className="fw-semibold text-white">{sol.usuario_nombre}</h6>
                        <p className="small mb-1" style={{ color: '#64748b' }}>{sol.usuario_correo}</p>
                        <div className="d-flex align-items-center gap-1">
                          <span className="small">{sol.curso_emoji}</span>
                          <span className="small fw-medium text-cyan">{sol.curso_nombre}</span>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className={`badge rounded-pill fw-medium px-3 py-1 small ${getEstadoBadge(sol.estado)}`}>
                        {getEstadoIcon(sol.estado)} {sol.estado === 'en_espera' ? 'En espera' : sol.estado}
                      </span>
                      <button onClick={() => actualizarEstado(sol.id, 'aceptado')} className="btn btn-custom-success small px-3 py-2 rounded-3 fw-medium">✅ Aceptar</button>
                      <button onClick={() => actualizarEstado(sol.id, 'rechazado')} className="btn btn-custom-danger small px-3 py-2 rounded-3 fw-medium">❌ Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'inscripciones' && (
          <div>
            <div className="d-flex gap-2 mb-4 flex-wrap">
              {['todas', 'aceptado', 'en_espera', 'rechazado'].map((f) => (
                <button key={f} onClick={() => {
                  const filtered = f === 'todas' ? todasInscripciones : todasInscripciones.filter(i => i.estado === f)
                  setTodasInscripciones([...filtered])
                }} className="btn rounded-3 small px-3 py-1" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid transparent' }}>
                  {f === 'todas' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {todasInscripciones.length === 0 ? (
              <div className="glass-card text-center p-5">
                <span className="fs-1">📚</span>
                <p className="mt-3" style={{ color: '#64748b' }}>No hay inscripciones</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {todasInscripciones.map((ins) => (
                  <div key={ins.id} className="glass-card p-3 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <span className="fs-4">{ins.curso_emoji}</span>
                      <div>
                        <h6 className="fw-medium mb-0 text-white">{ins.usuario_nombre}</h6>
                        <p className="small mb-0" style={{ color: '#64748b' }}>{ins.curso_nombre} · {ins.usuario_correo}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className={`badge rounded-pill fw-medium px-3 py-1 small ${getEstadoBadge(ins.estado)}`}>
                        {getEstadoIcon(ins.estado)} {ins.estado === 'aceptado' ? 'Aceptado' : ins.estado === 'en_espera' ? 'En espera' : 'Rechazado'}
                      </span>
                      {ins.estado !== 'aceptado' && (
                        <button onClick={() => actualizarEstado(ins.id, 'aceptado')} className="btn btn-custom-success small px-3 py-1 rounded-3 fw-medium">Aceptar</button>
                      )}
                      {ins.estado !== 'rechazado' && (
                        <button onClick={() => actualizarEstado(ins.id, 'rechazado')} className="btn btn-custom-danger small px-3 py-1 rounded-3 fw-medium">Rechazar</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'cursos' && (
          <div className="row g-3">
            {cursos.map((c) => (
              <div key={c.id} className="col-md-6 col-lg-4">
                <div className="glass-card p-4">
                  <span className="fs-1 mb-2 d-inline-block">{c.imagen_emoji}</span>
                  <h6 className="fw-semibold mb-2 text-white">{c.nombre}</h6>
                  <p className="small mb-3" style={{ color: '#64748b' }}>{c.descripcion_corta}</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge-silver badge rounded-pill fw-medium px-3 py-1 small">{c.duracion}</span>
                    <span className="badge-silver badge rounded-pill fw-medium px-3 py-1 small">{c.nivel}</span>
                  </div>
                  <div className="d-flex justify-content-between small pt-3 border-top" style={{ borderColor: 'rgba(13,202,240,0.08)', color: '#64748b' }}>
                    <span>👤 {c.inscritos_count || 0}/{c.cupo_maximo}</span>
                    <span className={c.estado === 'publicado' ? 'text-green fw-medium' : 'fw-medium'} style={c.estado !== 'publicado' ? { color: '#eab308' } : {}}>
                      {c.estado === 'publicado' ? '✅ Publicado' : '📝 Borrador'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'usuarios' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0 text-white">Gestión de Usuarios</h5>
              <button onClick={() => setShowCreateUser(!showCreateUser)} className="btn btn-cyan px-4 py-2 rounded-3 small fw-medium">
                {showCreateUser ? '✕ Cancelar' : '➕ Nuevo usuario'}
              </button>
            </div>

            {showCreateUser && (
              <form onSubmit={crearUsuario} className="glass-card p-4 mb-4">
                <h6 className="fw-semibold mb-3 text-white">Crear nuevo usuario</h6>
                <div className="row g-3">
                  <div className="col-md">
                    <label className="small mb-1" style={{ color: '#64748b' }}>Nombre</label>
                    <input className="form-control form-control-custom" value={newUser.nombre} onChange={(e) => setNewUser({...newUser, nombre: e.target.value})} required />
                  </div>
                  <div className="col-md">
                    <label className="small mb-1" style={{ color: '#64748b' }}>Apellido</label>
                    <input className="form-control form-control-custom" value={newUser.apellido} onChange={(e) => setNewUser({...newUser, apellido: e.target.value})} required />
                  </div>
                  <div className="col-md">
                    <label className="small mb-1" style={{ color: '#64748b' }}>Correo</label>
                    <input type="email" className="form-control form-control-custom" value={newUser.correo} onChange={(e) => setNewUser({...newUser, correo: e.target.value})} required />
                  </div>
                  <div className="col-md">
                    <label className="small mb-1" style={{ color: '#64748b' }}>Contraseña</label>
                    <input type="password" className="form-control form-control-custom" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} required />
                  </div>
                  <div className="col-md">
                    <label className="small mb-1" style={{ color: '#64748b' }}>Rol</label>
                    <select className="form-control form-control-custom" value={newUser.rol} onChange={(e) => setNewUser({...newUser, rol: e.target.value})}>
                      {rolesDisponibles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-custom-success px-4 py-2 rounded-3 small fw-medium mt-3">Crear usuario</button>
              </form>
            )}

            <div className="glass-card p-0 overflow-auto">
              <table className="table table-dark-custom mb-0">
                <thead>
                  <tr>
                    <th className="p-3 small text-uppercase" style={{ color: '#64748b', letterSpacing: '0.05em' }}>Nombre</th>
                    <th className="p-3 small text-uppercase" style={{ color: '#64748b', letterSpacing: '0.05em' }}>Usuario</th>
                    <th className="p-3 small text-uppercase" style={{ color: '#64748b', letterSpacing: '0.05em' }}>Contraseña</th>
                    <th className="p-3 small text-uppercase" style={{ color: '#64748b', letterSpacing: '0.05em' }}>Correo</th>
                    <th className="p-3 small text-uppercase" style={{ color: '#64748b', letterSpacing: '0.05em' }}>Rol</th>
                    <th className="p-3 small text-uppercase" style={{ color: '#64748b', letterSpacing: '0.05em' }}>Estado</th>
                    <th className="p-3 small text-uppercase text-end" style={{ color: '#64748b', letterSpacing: '0.05em' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id}>
                      <td className="p-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center small fw-bold" style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--cyan), var(--green))', color: 'white', fontSize: '0.7rem' }}>
                            {u.nombre[0]}{u.apellido[0]}
                          </div>
                          <span className="fw-medium text-white">{u.nombre} {u.apellido}</span>
                        </div>
                      </td>
                      <td className="p-3"><span className="small text-white">{u.correo.split('@')[0]}</span></td>
                      <td className="p-3">
                        <code className="small" style={{ color: '#94a3b8', fontSize: '0.65rem', wordBreak: 'break-all' }}>{u.password_hash ? u.password_hash.substring(0, 20) + '...' : '—'}</code>
                      </td>
                      <td className="p-3" style={{ color: '#64748b' }}>{u.correo}</td>
                      <td className="p-3">
                        <select
                          value={u.rol}
                          onChange={(e) => cambiarRol(u.id, e.target.value)}
                          className="form-control form-control-custom d-inline-block py-1 px-2"
                          style={{ width: 'auto', fontSize: '0.8rem' }}
                        >
                          {rolesDisponibles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </td>
                      <td className="p-3">
                        <span className={`badge rounded-pill fw-medium px-3 py-1 small ${u.estado === 'activo' ? 'badge-green' : 'badge-red'}`}>
                          {u.estado === 'activo' ? '✅ Activo' : '❌ Inactivo'}
                        </span>
                      </td>
                      <td className="p-3 text-end">
                        <button
                          onClick={() => cambiarEstadoUsuario(u.id, u.estado === 'activo' ? 'inactivo' : 'activo')}
                          className={`btn small px-3 py-1 rounded-3 fw-medium ${u.estado === 'activo' ? 'btn-custom-danger' : 'btn-custom-success'}`}
                        >
                          {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
