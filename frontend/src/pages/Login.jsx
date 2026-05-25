import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectByRole = (rol) => {
    switch (rol) {
      case 'admin': navigate('/admin'); break
      case 'docente': navigate('/docente'); break
      case 'moderador': navigate('/moderador'); break
      default: navigate('/estudiante')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const usuario = isRegister
        ? await register(form.nombre, form.apellido, form.correo, form.password)
        : await login(form.correo, form.password)
      if (usuario) redirectByRole(usuario.rol)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 bg-grid d-flex align-items-center justify-content-center px-3 position-relative overflow-hidden" style={{ background: '#0a0e1a' }}>
      <div className="position-absolute top-0 start-0" style={{ width: '40%', height: '40%', background: 'rgba(13,202,240,0.04)', borderRadius: '50%', filter: 'blur(80px)', transform: 'translate(-20%, -20%)' }}></div>
      <div className="position-absolute bottom-0 end-0" style={{ width: '40%', height: '40%', background: 'rgba(34,197,94,0.04)', borderRadius: '50%', filter: 'blur(80px)', transform: 'translate(20%, 20%)' }}></div>

      <div className="w-100 position-relative" style={{ maxWidth: 420 }}>
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex mb-3 text-decoration-none">
            <span className="fs-1 animate-float">🤖</span>
          </Link>
          <h2 className="fw-bold fs-2">
            <span className="text-gradient">AI CURSOS MENTE ARTIFICIAL</span>
          </h2>
          <p className="small text-cyan fw-semibold mb-1">✦ the future begins today. ✦</p>
          <p className="small" style={{ color: '#64748b' }}>
            {isRegister ? 'Crea tu cuenta y comienza a aprender' : 'Inicia sesión en tu cuenta'}
          </p>
        </div>

        <div className="glass-card p-4">
          {error && (
            <div className="d-flex align-items-center gap-2 badge-red rounded-3 px-3 py-2 mb-4 small">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="small mb-1" style={{ color: '#64748b' }}>Nombre</label>
                  <input
                    className="form-control form-control-custom"
                    placeholder="Carlos"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="small mb-1" style={{ color: '#64748b' }}>Apellido</label>
                  <input
                    className="form-control form-control-custom"
                    placeholder="Méndez"
                    value={form.apellido}
                    onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className="small mb-1" style={{ color: '#64748b' }}>Correo electrónico</label>
              <input
                type="email"
                className="form-control form-control-custom"
                placeholder="tu@correo.com"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="small mb-1" style={{ color: '#64748b' }}>Contraseña</label>
              <input
                type="password"
                className="form-control form-control-custom"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-cyan w-100 fw-semibold py-3 rounded-3"
            >
              {loading ? (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm"></span>
                  Procesando...
                </span>
              ) : (
                isRegister ? '🎓 Crear cuenta' : '🚀 Iniciar sesión'
              )}
            </button>
          </form>

          <div className="mt-4 pt-3 border-top text-center" style={{ borderColor: 'rgba(13,202,240,0.08)' }}>
            <p className="small mb-0" style={{ color: '#64748b' }}>
              {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
              <button
                className="btn btn-link text-cyan p-0 fw-medium text-decoration-none"
                onClick={() => { setIsRegister(!isRegister); setError('') }}
              >
                {isRegister ? 'Inicia sesión' : 'Regístrate gratis'}
              </button>
            </p>
          </div>

          <div className="mt-3 text-center">
            <Link to="/" className="small text-decoration-none" style={{ color: '#475569' }}>
              ← Volver al inicio
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center small" style={{ color: '#475569' }}>
          Demo: admin@aiacademy.com / admin123
        </div>
      </div>
    </div>
  )
}
