import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api'

const stats = [
  { label: "Cursos Disponibles", value: "8+", icon: "📚" },
  { label: "Estudiantes Activos", value: "2,500+", icon: "👨‍🎓" },
  { label: "Horas de Contenido", value: "480+", icon: "⏱️" },
  { label: "Certificaciones", value: "1,200+", icon: "🏆" },
]

const categories = [
  { name: "Machine Learning", emoji: "🤖" },
  { name: "Deep Learning", emoji: "🧠" },
  { name: "IA Generativa", emoji: "✨" },
  { name: "Visión Artificial", emoji: "👁️" },
  { name: "NLP", emoji: "💬" },
  { name: "MLOps", emoji: "🚀" },
]

export default function Home() {
  const [cursos, setCursos] = useState([])
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    API.get('/cursos').then(({ data }) => setCursos(data)).catch(() => {})
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-vh-100" style={{ background: '#0a0e1a' }}>
      <nav className={`navbar navbar-expand-lg fixed-top ${scrolled ? 'navbar-cyan' : 'navbar-transparent'}`}>
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
            <span className="fs-3 animate-float">🤖</span>
            <div>
              <span className="fw-bold fs-4 text-gradient">AI CURSOS MENTE ARTIFICIAL</span>
              <br /><small style={{ color: '#64748b', fontSize: '0.65rem' }}>the future begins today.</small>
            </div>
          </Link>
          <div className="d-flex">
            <Link to="/login" className="btn btn-cyan px-4 py-2 rounded-3 fw-medium small">
              🚀 Iniciar Sesión
            </Link>
          </div>
        </div>
      </nav>

      <section className="min-vh-100 hero-gradient bg-grid d-flex align-items-center overflow-hidden pt-5 position-relative">
        <div className="position-absolute top-0 start-0 w-25 h-25" style={{ background: 'rgba(13,202,240,0.1)', borderRadius: '50%', filter: 'blur(80px)', transform: 'translate(50%, 50%)', animation: 'pulse-glow 3s ease-in-out infinite' }}></div>
        <div className="position-absolute bottom-0 end-0 w-25 h-25" style={{ background: 'rgba(34,197,94,0.08)', borderRadius: '50%', filter: 'blur(80px)', transform: 'translate(-50%, -50%)', animation: 'pulse-glow 3s ease-in-out infinite', animationDelay: '1.5s' }}></div>

        <div className="container py-5 position-relative">
          <div className="row">
            <div className="col-lg-8">
              <div className="d-inline-flex align-items-center gap-2 badge-cyan rounded-pill px-3 py-1 small mb-4">
                <span className="badge-dot" style={{ width: 8, height: 8, background: 'var(--cyan)', borderRadius: '50%', display: 'inline-block' }}></span>
                Nueva plataforma de cursos IA
              </div>
              <h1 className="display-3 fw-bold lh-1 mb-4" style={{ color: 'white' }}>
                Transforma tu futuro con{' '}
                <span className="text-gradient">Inteligencia Artificial</span>
              </h1>
              <p className="fs-5 mb-4" style={{ color: '#64748b', maxWidth: 600 }}>
                Aprende Machine Learning, Deep Learning, IA Generativa y más con los mejores instructores.
                Obtén certificaciones reconocidas y únete a una comunidad de innovadores.
              </p>
              <p className="small mb-4 fw-semibold text-cyan">✦ the future begins today. ✦</p>
              <div className="d-flex align-items-center gap-3">
                <Link to="/login" className="btn btn-cyan px-5 py-3 rounded-3 fw-semibold fs-6 d-inline-flex align-items-center gap-2">
                  Comienza ahora
                  <span>→</span>
                </Link>
                <a href="#cursos" className="glass-card px-5 py-3 rounded-3 fw-medium text-decoration-none" style={{ color: '#94a3b8' }}>
                  Explorar cursos
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ marginTop: '-80px' }}>
        <div className="row g-3">
          {stats.map((s) => (
            <div key={s.label} className="col-6 col-md-3">
              <div className="glass-card p-4 text-center">
                <span className="fs-1">{s.icon}</span>
                <p className="fs-3 fw-bold mt-2 mb-0 text-white">{s.value}</p>
                <p className="small" style={{ color: '#64748b' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-6 fw-bold mb-2 text-white">Explora por <span className="text-gradient">Categorías</span></h2>
          <p style={{ color: '#64748b' }}>Encuentra el curso perfecto para tu nivel y objetivos</p>
        </div>
        <div className="row g-3">
          {categories.map((c) => (
            <div key={c.name} className="col-6 col-md-4 col-lg-2">
              <div className="card-cyan p-4 text-center" style={{ cursor: 'pointer' }}>
                <span className="fs-1 d-inline-block" style={{ transition: 'transform 0.3s' }}>{c.emoji}</span>
                <p className="small fw-medium mt-2 mb-0" style={{ color: 'rgba(255,255,255,0.9)' }}>{c.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="cursos" className="container pb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="display-6 fw-bold mb-1 text-white">Cursos <span className="text-gradient">Disponibles</span></h2>
            <p style={{ color: '#64748b' }}>Selecciona tu curso y comienza a aprender hoy</p>
          </div>
          <Link to="/login" className="text-cyan text-decoration-none small fw-medium">
            Ver todos →
          </Link>
        </div>

        <div className="row g-4">
          {cursos.slice(0, 8).map((c) => (
            <div key={c.id} className="col-md-6 col-lg-4 col-xl-3">
              <Link to={`/cursos/${c.id}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                <div className="glass-card p-4 h-100">
                  <span className="fs-1 mb-3 d-inline-block" style={{ transition: 'transform 0.3s' }}>{c.imagen_emoji}</span>
                  <h5 className="fw-semibold mb-2 text-white">{c.nombre}</h5>
                  <p className="small mb-3" style={{ color: '#64748b' }}>{c.descripcion_corta}</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className={`badge rounded-pill fw-medium px-3 py-1 ${c.nivel === 'Principiante' ? 'badge-green' : c.nivel === 'Intermedio' ? 'badge-yellow' : 'badge-red'}`}>{c.nivel}</span>
                    <span className="badge-silver badge rounded-pill fw-medium px-3 py-1">{c.duracion}</span>
                    {c.precio > 0 && (
                      <span className="badge-yellow badge rounded-pill fw-medium px-3 py-1">${c.precio}</span>
                    )}
                  </div>
                  <div className="d-flex align-items-center justify-content-between small pt-3 border-top" style={{ borderColor: 'rgba(13,202,240,0.05) !important', color: '#64748b' }}>
                    <span>👤 {c.inscritos_count || 0} estudiantes</span>
                    <span className="text-cyan">Ver curso →</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="position-relative py-5 overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(180deg, rgba(13,202,240,0.05), rgba(34,197,94,0.03), transparent)' }}></div>
        <div className="container text-center position-relative">
          <span className="display-3 mb-4 d-inline-block animate-float">🚀</span>
          <h2 className="display-6 fw-bold mb-3 text-white">¿Listo para empezar tu <span className="text-gradient">viaje IA</span>?</h2>
          <p className="fs-5 mb-4" style={{ color: '#64748b', maxWidth: 600, margin: '0 auto 1.5rem' }}>
            Únete a miles de estudiantes que ya están transformando su carrera con nuestros cursos.
          </p>
          <Link to="/login" className="btn btn-cyan px-5 py-3 rounded-3 fw-semibold fs-6 d-inline-flex align-items-center gap-2">
            Crear cuenta gratis
            <span style={{ transition: 'transform 0.3s' }} className="d-inline-block">→</span>
          </Link>
        </div>
      </section>

      <footer className="border-top py-5" style={{ borderColor: 'rgba(13,202,240,0.05)' }}>
        <div className="container">
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="fs-3">🤖</span>
                <h5 className="fw-bold mb-0 text-white">AI CURSOS MENTE ARTIFICIAL</h5>
              </div>
              <p className="small" style={{ color: '#64748b' }}>La mejor plataforma para aprender Inteligencia Artificial en español.</p>
            </div>
            <div className="col-6 col-md-2">
              <h6 className="fw-semibold mb-3 small text-uppercase tracking-wider" style={{ color: '#64748b', letterSpacing: '0.05em' }}>Cursos</h6>
              <div className="d-flex flex-column gap-1 small" style={{ color: '#64748b' }}>
                <p className="mb-0">Machine Learning</p>
                <p className="mb-0">Deep Learning</p>
                <p className="mb-0">IA Generativa</p>
                <p className="mb-0">Visión Artificial</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <h6 className="fw-semibold mb-3 small text-uppercase tracking-wider" style={{ color: '#64748b', letterSpacing: '0.05em' }}>Plataforma</h6>
              <div className="d-flex flex-column gap-1 small" style={{ color: '#64748b' }}>
                <p className="mb-0">Instructores</p>
                <p className="mb-0">Certificaciones</p>
                <p className="mb-0">Comunidad</p>
                <p className="mb-0">Blog</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <h6 className="fw-semibold mb-3 small text-uppercase tracking-wider" style={{ color: '#64748b', letterSpacing: '0.05em' }}>Legal</h6>
              <div className="d-flex flex-column gap-1 small" style={{ color: '#64748b' }}>
                <p className="mb-0">Términos y condiciones</p>
                <p className="mb-0">Política de privacidad</p>
                <p className="mb-0">Cookies</p>
              </div>
            </div>
          </div>
          <div className="border-top pt-4 text-center small" style={{ borderColor: 'rgba(13,202,240,0.05)', color: '#475569' }}>
            © 2026 AI CURSOS MENTE ARTIFICIAL. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
