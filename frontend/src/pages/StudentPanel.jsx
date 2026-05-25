import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../contexts/AuthContext'

function getNivelBadge(nivel) {
  if (nivel === "Principiante") return "badge-green"
  if (nivel === "Intermedio") return "badge-yellow"
  return "badge-red"
}

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

function derivarPolinomio(coefs) {
  return coefs.map((c, i) => c * i).slice(1)
}

function evaluarPolinomio(coefs, x) {
  return coefs.reduce((sum, c, i) => sum + c * Math.pow(x, i), 0)
}

function productoMatriz(A, B) {
  const m = A.length, n = A[0].length, p = B[0].length
  const res = Array.from({ length: m }, () => Array(p).fill(0))
  for (let i = 0; i < m; i++)
    for (let j = 0; j < p; j++)
      for (let k = 0; k < n; k++)
        res[i][j] += A[i][k] * B[k][j]
  return res
}

function determinante2x2(M) {
  return M[0][0] * M[1][1] - M[0][1] * M[1][0]
}

function determinante3x3(M) {
  return M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1])
       - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0])
       + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])
}

export default function StudentPanel() {
  const { user, logout } = useAuth()
  const [cursos, setCursos] = useState([])
  const [misInscripciones, setMisInscripciones] = useState([])
  const [certificados, setCertificados] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [tab, setTab] = useState('cursos')
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null)
  const [progresoDetalle, setProgresoDetalle] = useState(null)

  useEffect(() => {
    API.get('/cursos').then(({ data }) => setCursos(data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (user?.id) {
      API.get(`/estudiantes/mis-cursos/${user.id}`).then(({ data }) => setMisInscripciones(data)).catch(() => {})
      API.get(`/estudiantes/certificados/${user.id}`).then(({ data }) => setCertificados(data)).catch(() => {})
    }
  }, [user])

  const inscribir = async (cursoId) => {
    try {
      const { data } = await API.post(`/estudiantes/inscribir/${cursoId}?usuario_id=${user.id}`)
      setMensaje(data.mensaje)
      const res = await API.get(`/estudiantes/mis-cursos/${user.id}`)
      setMisInscripciones(res.data)
    } catch (err) {
      setMensaje(err.response?.data?.detail || 'Error al inscribirse')
    }
  }

  const verProgreso = async (cursoId) => {
    try {
      const { data } = await API.get(`/estudiantes/progreso/${user.id}/${cursoId}`)
      setProgresoDetalle(data)
      setCursoSeleccionado(cursoId)
    } catch (err) {
      setMensaje('Error al cargar progreso')
    }
  }

  const [detalleTab, setDetalleTab] = useState('explicacion')
  const [examenRespuestas, setExamenRespuestas] = useState({})
  const [examenResultado, setExamenResultado] = useState(null)
  const [tareas, setTareas] = useState({ explicacion: false, ejemplos: false, demo: false, examen: false })
  const [csvData, setCsvData] = useState(null)
  const [csvResultado, setCsvResultado] = useState(null)

  const preguntasPorCurso = {
    'Regresion Lineal': [
      { id: 1, pregunta: '¿Qué significa el coeficiente de determinación R²?', opciones: ['La proporción de varianza explicada por el modelo', 'El error cuadrático medio', 'La pendiente de la recta', 'El valor de la intersección'], correcta: 0 },
      { id: 2, pregunta: '¿Qué método se usa para estimar los parámetros en regresión lineal?', opciones: ['Mínimos cuadrados ordinarios', 'Descenso por gradiente', 'Máxima verosimilitud', 'Todas las anteriores'], correcta: 0 },
      { id: 3, pregunta: 'En la ecuación y = mx + b, ¿qué representa m?', opciones: ['La pendiente', 'La intersección', 'La variable dependiente', 'El error'], correcta: 0 },
      { id: 4, pregunta: '¿Qué es un outlier en regresión lineal?', opciones: ['Un punto que se desvía significativamente del patrón general', 'Un valor faltante', 'Una variable categórica', 'El punto medio'], correcta: 0 },
      { id: 5, pregunta: '¿Qué supuesto NO es necesario para regresión lineal simple?', opciones: ['Normalidad de los residuos', 'Linealidad de la relación', 'Independencia de las observaciones', 'Multicolinealidad'], correcta: 3 },
      { id: 6, pregunta: '¿Cómo se interpreta R² = 0.85?', opciones: ['El 85% de la variabilidad en Y es explicada por X', 'El modelo tiene 85% de precisión', 'El error es del 15%', 'La correlación es 0.85'], correcta: 0 },
      { id: 7, pregunta: '¿Qué gráfico es útil para validar el supuesto de homocedasticidad?', opciones: ['Gráfico de residuos vs valores ajustados', 'Histograma', 'Gráfico de barras', 'Diagrama de dispersión'], correcta: 0 },
      { id: 8, pregunta: '¿Qué hace la transformación logarítmica en regresión?', opciones: ['Linealiza relaciones exponenciales', 'Elimina outliers', 'Reduce la varianza', 'Aumenta R²'], correcta: 0 },
    ],
    'Algoritmo Genetico': [
      { id: 1, pregunta: '¿En qué está inspirado un algoritmo genético?', opciones: ['En la selección natural y evolución biológica', 'En las redes neuronales', 'En la lógica difusa', 'En el álgebra lineal'], correcta: 0 },
      { id: 2, pregunta: '¿Qué es un cromosoma en un AG?', opciones: ['Una posible solución al problema', 'Un gen', 'La población completa', 'La función de fitness'], correcta: 0 },
      { id: 3, pregunta: '¿Qué operador permite explorar nuevas soluciones combinando padres?', opciones: ['Crossover (cruza)', 'Mutación', 'Selección', 'Elitismo'], correcta: 0 },
      { id: 4, pregunta: '¿Qué operador introduce diversidad genética en la población?', opciones: ['Mutación', 'Crossover', 'Selección', 'Reemplazo'], correcta: 0 },
      { id: 5, pregunta: '¿Qué es la función de fitness?', opciones: ['Evalúa qué tan buena es una solución', 'Determina la tasa de mutación', 'Selecciona los padres', 'Crea nuevos individuos'], correcta: 0 },
      { id: 6, pregunta: '¿Qué método de selección da más probabilidad a los individuos más aptos?', opciones: ['Selección por ruleta', 'Selección aleatoria', 'Selección por orden', 'Todas son iguales'], correcta: 0 },
      { id: 7, pregunta: '¿Qué es el elitismo en AG?', opciones: ['Conservar los mejores individuos para la siguiente generación', 'Eliminar los peores individuos', 'Aumentar la tasa de mutación', 'Reducir la población'], correcta: 0 },
      { id: 8, pregunta: '¿Qué ocurre si la tasa de mutación es muy alta?', opciones: ['El algoritmo se vuelve una búsqueda aleatoria', 'Converge más rápido', 'Mejora la precisión', 'No tiene efecto'], correcta: 0 },
    ],
  }

  useEffect(() => {
    if (user?.id && cursoSeleccionado) {
      const saved = localStorage.getItem(`tareas_${user.id}_${cursoSeleccionado}`)
      if (saved) setTareas(JSON.parse(saved))
      else setTareas({ explicacion: false, ejemplos: false, demo: false, examen: false })
    }
  }, [cursoSeleccionado, user?.id])

  const tareasLista = [
    { key: 'explicacion', label: '📝 Leer la explicación del curso', icon: '📖' },
    { key: 'ejemplos', label: '💡 Resolver al menos un ejemplo interactivo', icon: '🧮' },
    { key: 'demo', label: '🚀 Probar las herramientas demo (SymPy/NumPy)', icon: '⚡' },
    { key: 'examen', label: '📋 Aprobar el examen final (+60%)', icon: '🎯' },
  ]

  const completarTarea = (key) => {
    const nuevas = { ...tareas, [key]: true }
    setTareas(nuevas)
    if (user?.id && cursoSeleccionado) {
      localStorage.setItem(`tareas_${user.id}_${cursoSeleccionado}`, JSON.stringify(nuevas))
      const completadas = Object.values(nuevas).filter(Boolean).length
      if (completadas === tareasLista.length) {
        API.post(`/estudiantes/completar/${user.id}/${cursoSeleccionado}`).catch(() => {})
      }
    }
  }

  const progresoLocal = (() => {
    if (!tareas) return 0
    const completadas = Object.values(tareas).filter(Boolean).length
    return Math.round((completadas / tareasLista.length) * 100)
  })()

  const cursoActual = (() => {
    if (!cursos.length || !cursoSeleccionado) return null
    return cursos.find(c => c.id === cursoSeleccionado)?.nombre || null
  })()
  const preguntasExamen = preguntasPorCurso[cursoActual] || preguntasPorCurso['Regresion Lineal']

  const enviarExamen = () => {
    let aciertos = 0
    preguntasExamen.forEach(p => {
      if (Number(examenRespuestas[p.id]) === p.correcta) aciertos++
    })
    setExamenResultado({ total: preguntasExamen.length, aciertos })
    if (aciertos / preguntasExamen.length >= 0.6 && !tareas.examen) {
      completarTarea('examen')
    }
  }

  const getEstadoCurso = (cursoId) => {
    const insc = misInscripciones.find((i) => i.curso_id === cursoId)
    return insc?.estado
  }

  // ---- Demo states ----
  const [demoSeccion, setDemoSeccion] = useState('sympy')
  const [exprPolinomio, setExprPolinomio] = useState('3,0,5,2')
  const [exprX, setExprX] = useState('2')
  const [matrizA, setMatrizA] = useState('1,2;3,4')
  const [matrizB, setMatrizB] = useState('5,6;7,8')
  const [gaPopSize, setGaPopSize] = useState(10)
  const [gaGeneraciones, setGaGeneraciones] = useState(20)
  const [gaTasaMutacion, setGaTasaMutacion] = useState(0.1)
  const [gaResultado, setGaResultado] = useState(null)

  const ejecutarDerivada = () => {
    const coefs = exprPolinomio.split(',').map(Number)
    const deriv = derivarPolinomio(coefs)
    return deriv.map((c, i) => `${c}x^${i}`).join(' + ')
  }

  const ejecutarEvaluacion = () => {
    const coefs = exprPolinomio.split(',').map(Number)
    const x = Number(exprX)
    return evaluarPolinomio(coefs, x)
  }

  const parseMatriz = (str) => str.split(';').map(f => f.split(',').map(Number))

  const ejecutarProducto = () => {
    try {
      const A = parseMatriz(matrizA), B = parseMatriz(matrizB)
      return productoMatriz(A, B).map(f => f.join('  ')).join('\n')
    } catch { return 'Error en las matrices' }
  }

  const ejecutarDeterminante = (str) => {
    try {
      const M = parseMatriz(str)
      if (M.length === 2) return determinante2x2(M)
      if (M.length === 3) return determinante3x3(M)
      return 'Solo 2x2 o 3x3'
    } catch { return 'Error' }
  }

  const ejecutarGA = () => {
    const popSize = Math.max(4, gaPopSize)
    const gens = Math.max(1, gaGeneraciones)
    const mutRate = Math.min(1, Math.max(0, gaTasaMutacion))
    let poblacion = Array.from({ length: popSize }, () => Math.floor(Math.random() * 32))
    const fitnessInicial = Math.round(poblacion.reduce((s, x) => s + x * x, 0) / popSize * 100) / 100
    let mejorGlobal = { x: 0, fitness: 0, gen: 0 }
    for (let gen = 1; gen <= gens; gen++) {
      const fitness = poblacion.map(x => ({ x, f: x * x }))
      const totalFit = fitness.reduce((s, f) => s + f.f, 0)
      const nueva = []
      for (let i = 0; i < popSize; i++) {
        const sel = () => {
          let r = Math.random() * totalFit, acc = 0
          for (const f of fitness) { acc += f.f; if (r <= acc) return f.x }
          return fitness[fitness.length - 1].x
        }
        let p1 = sel(), p2 = sel()
        if (Math.random() < 0.7) {
          const mask = Math.floor(Math.random() * 32)
          const hijo1 = (p1 & mask) | (p2 & ~mask)
          const hijo2 = (p2 & mask) | (p1 & ~mask)
          p1 = hijo1; p2 = hijo2
        }
        if (Math.random() < mutRate) p1 ^= (1 << Math.floor(Math.random() * 5))
        if (Math.random() < mutRate) p2 ^= (1 << Math.floor(Math.random() * 5))
        nueva.push(Math.min(31, Math.max(0, p1)), Math.min(31, Math.max(0, p2)))
      }
      poblacion = nueva.slice(0, popSize)
      const mejorGen = Math.max(...poblacion)
      if (mejorGen * mejorGen > mejorGlobal.fitness) {
        mejorGlobal = { x: mejorGen, fitness: mejorGen * mejorGen, gen }
      }
    }
    setGaResultado({
      mejorX: mejorGlobal.x,
      mejorFitness: mejorGlobal.fitness,
      generacion: mejorGlobal.gen,
      fitnessInicial,
      fitnessFinal: Math.round(poblacion.reduce((s, x) => s + x * x, 0) / popSize * 100) / 100
    })
    if (!tareas.ejemplos) completarTarea('ejemplos')
  }

  // ---- Ejemplos states ----
  const [ejemploTab, setEjemploTab] = useState('regresion')
  const [regX, setRegX] = useState('1,2,3,4,5')
  const [regY, setRegY] = useState('2,4,5,4,5')
  const [regResultado, setRegResultado] = useState(null)
  const [matrizCalc, setMatrizCalc] = useState('4,2;1,3')
  const [detResultado, setDetResultado] = useState(null)
  const [invResultado, setInvResultado] = useState(null)
  const [calcEcuacion, setCalcEcuacion] = useState('')
  const [csvColX, setCsvColX] = useState('')
  const [csvColY, setCsvColY] = useState('')

  const handleCsvUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target.result
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length < 2) { setCsvData(null); return }
      const headers = lines[0].split(',').map(h => h.trim())
      const rows = lines.slice(1).map(line => line.split(',').map(v => Number(v.trim())))
      if (rows.some(r => r.some(isNaN))) { setCsvData(null); setMensaje('El CSV debe contener solo valores numéricos'); return }
      setCsvData({ columnas: headers, filas: rows, raw: text })
      setCsvColX(''); setCsvColY(''); setCsvResultado(null)
    }
    reader.readAsText(file)
  }

  const calcularRegresionCSV = () => {
    if (!csvData || csvColX === '' || csvColY === '') return
    const idxX = csvData.columnas.indexOf(csvColX)
    const idxY = csvData.columnas.indexOf(csvColY)
    if (idxX === -1 || idxY === -1) return
    const x = csvData.filas.map(f => f[idxX])
    const y = csvData.filas.map(f => f[idxY])
    const n = x.length
    if (n < 3) { setMensaje('Se necesitan al menos 3 filas de datos'); return }
    const sx = x.reduce((a, b) => a + b, 0)
    const sy = y.reduce((a, b) => a + b, 0)
    const sxy = x.reduce((s, xi, i) => s + xi * y[i], 0)
    const sx2 = x.reduce((s, xi) => s + xi * xi, 0)
    const sy2 = y.reduce((s, yi) => s + yi * yi, 0)
    const m = (n * sxy - sx * sy) / (n * sx2 - sx * sx)
    const b = (sy - m * sx) / n
    const ssRes = y.reduce((s, yi, i) => s + (yi - (m * x[i] + b)) ** 2, 0)
    const ssTot = y.reduce((s, yi) => s + (yi - sy / n) ** 2, 0)
    const r2 = ssTot === 0 ? 0 : Math.round((1 - ssRes / ssTot) * 10000) / 10000
    const r = Math.round((n * sxy - sx * sy) / Math.sqrt((n * sx2 - sx * sx) * (n * sy2 - sy * sy)) * 10000) / 10000
    const pend = Math.round(m * 10000) / 10000
    const inter = Math.round(b * 10000) / 10000
    setCsvResultado({ pendiente: pend, interseccion: inter, r2, correlacion: r })
    if (!tareas.demo) completarTarea('demo')
  }

  const resolverRegresion = () => {
    const x = regX.split(',').map(Number)
    const y = regY.split(',').map(Number)
    const n = x.length
    const sx = x.reduce((a, b) => a + b, 0)
    const sy = y.reduce((a, b) => a + b, 0)
    const sxy = x.reduce((s, xi, i) => s + xi * y[i], 0)
    const sx2 = x.reduce((s, xi) => s + xi * xi, 0)
    const m = (n * sxy - sx * sy) / (n * sx2 - sx * sx)
    const b = (sy - m * sx) / n
    setRegResultado({ m: Math.round(m * 100) / 100, b: Math.round(b * 100) / 100 })
    if (!tareas.ejemplos) completarTarea('ejemplos')
  }

  const inversa2x2 = (M) => {
    const det = M[0][0] * M[1][1] - M[0][1] * M[1][0]
    if (det === 0) return null
    return [[M[1][1] / det, -M[0][1] / det], [-M[1][0] / det, M[0][0] / det]]
  }

  const ejecutarMatrizCalc = () => {
    try {
      const M = parseMatriz(matrizCalc)
      setDetResultado(M.length === 2 ? determinante2x2(M) : M.length === 3 ? determinante3x3(M) : 'Solo 2x2 o 3x3')
      if (M.length === 2) {
        const inv = inversa2x2(M)
        setInvResultado(inv ? inv.map(f => f.map(v => Math.round(v * 100) / 100).join('  ')).join('\n') : 'No tiene inversa (det = 0)')
      } else {
        setInvResultado('Solo para 2x2')
      }
      if (!tareas.ejemplos) completarTarea('ejemplos')
    } catch { setDetResultado('Error'); setInvResultado('Error') }
  }

  const resolverEcuacion = () => {
    try {
      const partes = calcEcuacion.replace(/ /g, '').split('=')
      if (partes.length !== 2) { setCalcEcuacion('Formato: 2x+3=7'); return }
      const izq = partes[0], der = partes[1]
      const match = izq.match(/(-?\d*)x([+-]\d+)?/)
      if (!match) { setCalcEcuacion('Formato: 2x+3=7'); return }
      const a = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : Number(match[1])
      const b = match[2] ? Number(match[2]) : 0
      const c = Number(der)
      const x = (c - b) / a
      setCalcEcuacion(`x = ${Math.round(x * 100) / 100}`)
      if (!tareas.ejemplos) completarTarea('ejemplos')
    } catch { setCalcEcuacion('Error') }
  }

  if (cursoSeleccionado && progresoDetalle) {
    const curso = cursos.find(c => c.id === cursoSeleccionado)
    return (
      <div className="min-vh-100" style={{ background: '#0a0e1a', color: '#e2e8f0' }}>
        <nav className="navbar-cyan px-3 py-3 d-flex align-items-center justify-content-between sticky-top">
          <div className="d-flex align-items-center gap-2">
            <span className="fs-3">🤖</span>
            <div>
              <h5 className="fw-bold mb-0 text-gradient">AI CURSOS MENTE ARTIFICIAL</h5>
              <small style={{ color: '#64748b', fontSize: '0.65rem' }}>the future begins today.</small>
            </div>
          </div>
          <button onClick={() => setCursoSeleccionado(null)} className="btn btn-link text-decoration-none small" style={{ color: '#64748b' }}>
            ← Volver
          </button>
        </nav>

        <div className="container py-4" style={{ maxWidth: 800 }}>
          <div className="d-flex align-items-center gap-3 mb-4">
            <span className="fs-1">{curso?.imagen_emoji || '📚'}</span>
            <div>
              <h2 className="fw-bold text-white">{curso?.nombre || 'Curso'}</h2>
              <p style={{ color: '#64748b' }}>Progreso: {progresoLocal}%</p>
            </div>
          </div>

          <div className="progress progress-dark mb-4 position-relative" style={{ height: 20 }}>
            <div className="progress-bar progress-bar-cyan d-flex align-items-center justify-content-center fw-bold small" style={{ width: `${progresoLocal}%`, height: 20, borderRadius: 10 }}>
              {progresoLocal > 15 && `${progresoLocal}%`}
            </div>
            {progresoLocal <= 15 && <span className="position-absolute start-0 end-0 text-center small fw-bold" style={{ color: '#64748b', lineHeight: '20px' }}>{progresoLocal}%</span>}
          </div>

          <div className="mb-4">
            <h6 className="fw-bold text-white mb-2">✅ Tareas del curso</h6>
            <div className="d-flex flex-column gap-1">
              {tareasLista.map((t) => (
                <div key={t.key} className="d-flex align-items-center gap-2 small px-3 py-1 rounded-3"
                  style={{ background: tareas[t.key] ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${tareas[t.key] ? 'rgba(34,197,94,0.2)' : 'rgba(13,202,240,0.06)'}` }}>
                  <span>{tareas[t.key] ? '✅' : '⭕'}</span>
                  <span style={{ color: tareas[t.key] ? 'var(--green)' : '#94a3b8', textDecoration: tareas[t.key] ? 'line-through' : 'none' }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="d-flex gap-2 mb-4 border-bottom pb-3 flex-wrap" style={{ borderColor: 'rgba(13,202,240,0.08)' }}>
              {[
                { key: 'explicacion', label: '📝 Explicación' },
                { key: 'ejemplos', label: '💡 Ejemplos' },
                { key: 'demo', label: '🚀 Demo' },
                { key: 'examen', label: '📋 Examen Final' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setDetalleTab(t.key); setExamenResultado(null) }}
                  className={`btn rounded-3 small fw-medium px-3 py-1 ${detalleTab === t.key ? 'badge-cyan' : 'btn'}`}
                  style={detalleTab !== t.key ? { background: 'transparent', color: '#64748b', border: '1px solid transparent' } : { border: '1px solid rgba(13,202,240,0.2)' }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {detalleTab === 'explicacion' && (
              <div>
                <h6 className="fw-bold text-white mb-3">📝 Explicación del Curso</h6>
                <div style={{ color: '#94a3b8', lineHeight: 1.9, fontSize: '0.9rem' }}>
                  {curso?.nombre === 'Regresión Lineal' ? (
                    <>
                      <p>La regresión lineal es el modelo predictivo más fundamental en estadística y machine learning. Su objetivo es modelar la relación entre una variable dependiente (Y) y una o más variables independientes (X) mediante una ecuación lineal.</p>
                      <p>En su forma más simple (regresión lineal simple), modelamos la relación como Y = β₀ + β₁X + ε, donde β₀ es la intersección (intercept), β₁ es la pendiente (slope) y ε representa el error aleatorio. Este modelo asume que la relación entre X e Y es aproximadamente lineal.</p>
                      <p>El método de mínimos cuadrados ordinarios (OLS) es la técnica estándar para estimar los coeficientes β₀ y β₁. Consiste en encontrar los valores que minimizan la suma de los cuadrados de los residuos (diferencias entre valores observados y predichos).</p>
                      <p>La pendiente β₁ se calcula como la covarianza entre X e Y dividida por la varianza de X. La intersección β₀ se calcula como la media de Y menos β₁ por la media de X. Estas fórmulas tienen una interpretación geométrica y estadística profunda.</p>
                      <p>El coeficiente de determinación R² mide la proporción de la varianza total de Y que es explicada por el modelo. Un R² de 0.85 significa que el 85% de la variabilidad en Y puede explicarse mediante la relación lineal con X.</p>
                      <p>El error estándar de la estimación (SEE) mide la dispersión típica de los residuos. Se utiliza para construir intervalos de confianza para las predicciones y para realizar pruebas de hipótesis sobre los coeficientes.</p>
                      <p>Uno de los supuestos clave de la regresión lineal es la homocedasticidad: la varianza de los residuos debe ser constante para todos los valores de X. La heterocedasticidad (varianza no constante) puede detectarse mediante gráficos de residuos.</p>
                      <p>Otro supuesto importante es la independencia de los residuos. En datos temporales, los residuos pueden estar correlacionados (autocorrelación), lo que viola este supuesto y requiere modelos como regresión con ARIMA.</p>
                      <p>La normalidad de los residuos es necesaria para la validez de las pruebas de hipótesis y la construcción de intervalos de confianza. Se puede evaluar mediante gráficos Q-Q o pruebas como Shapiro-Wilk.</p>
                      <p>Los outliers (valores atípicos) pueden tener un efecto desproporcionado en la recta de regresión. Es importante identificarlos mediante el análisis de residuos estandarizados y la distancia de Cook.</p>
                      <p>La regresión lineal múltiple extiende el modelo a múltiples variables independientes: Y = β₀ + β₁X₁ + β₂X₂ + ... + βₖXₖ + ε. Cada coeficiente βⱼ representa el cambio esperado en Y por cada unidad de cambio en Xⱼ, manteniendo las demás variables constantes.</p>
                      <p>La multicolinealidad ocurre cuando las variables independientes están correlacionadas entre sí. Esto infla la varianza de los coeficientes estimados y dificulta la interpretación. Se detecta mediante el factor de inflación de varianza (VIF).</p>
                      <p>La transformación de variables es una técnica común para linealizar relaciones no lineales. Las transformaciones logarítmicas, exponenciales y polinómicas pueden mejorar significativamente el ajuste del modelo.</p>
                      <p>Los intervalos de confianza para los coeficientes indican la precisión de las estimaciones. Un intervalo que no contiene el cero sugiere que la variable tiene un efecto estadísticamente significativo sobre Y.</p>
                      <p>La validación cruzada es esencial para evaluar la capacidad predictiva del modelo. Dividir los datos en entrenamiento y prueba permite detectar overfitting y estimar el error de predicción en datos nuevos.</p>
                      <p>Las aplicaciones de la regresión lineal son extensas: predicción de precios de viviendas, pronóstico de ventas, análisis de tendencias económicas, calibración de instrumentos, y muchas más áreas donde se necesita modelar relaciones cuantitativas.</p>
                      <p>En Python, las bibliotecas NumPy, SciPy y scikit-learn proporcionan implementaciones eficientes de regresión lineal. NumPy ofrece operaciones matriciales para resolver los sistemas de ecuaciones, mientras que scikit-learn proporciona una API completa.</p>
                      <p>La regresión lineal es también la base de modelos más avanzados como regresión polinómica, regresión Ridge, Lasso y Elastic Net, que añaden regularización para mejorar la generalización y evitar el overfitting.</p>
                      <p>Comprender la regresión lineal a fondo te dará una base sólida para abordar problemas más complejos de machine learning. Sus principios estadísticos y matemáticos se extienden a modelos de clasificación, redes neuronales y deep learning.</p>
                      <p>Este curso te guiará paso a paso desde los fundamentos teóricos hasta la implementación práctica con datos reales. Aprenderás a cargar datos, limpiarlos, construir modelos, evaluarlos y hacer predicciones con confianza estadística.</p>
                    </>
                  ) : curso?.nombre === 'Algoritmo Genético' ? (
                    <>
                      <p>Los algoritmos genéticos (AG) son técnicas de optimización inspiradas en la teoría de la evolución de Darwin y la selección natural. Fueron desarrollados por John Holland en la década de 1970 y desde entonces se han convertido en una herramienta poderosa para resolver problemas complejos de búsqueda y optimización.</p>
                      <p>La idea fundamental es simular el proceso evolutivo: una población de soluciones candidatas evoluciona a través de generaciones, donde los individuos más aptos tienen mayor probabilidad de reproducirse y transmitir sus características a la descendencia.</p>
                      <p>En un AG, cada solución potencial se representa como un cromosoma, generalmente una cadena de bits, un vector de números reales o una estructura de datos más compleja. Cada posición en el cromosoma se denomina gen y representa una variable del problema.</p>
                      <p>La función de fitness (aptitud) evalúa qué tan buena es cada solución para el problema en cuestión. Esta función es específica del problema y determina la dirección de la evolución: los individuos con mayor fitness tienen más probabilidades de ser seleccionados.</p>
                      <p>La selección es el proceso de elegir qué individuos se reproducirán. Los métodos más comunes incluyen selección por ruleta (proporcional al fitness), selección por torneo (compiten grupos aleatorios) y selección por rango (basada en la posición relativa).</p>
                      <p>El crossover (cruza o recombinación) es el operador principal de exploración. Combina el material genético de dos padres para crear uno o más hijos. Los tipos incluyen cruza de un punto, dos puntos, uniforme y cruza aritmética para representaciones reales.</p>
                      <p>La mutación introduce cambios aleatorios en los cromosomas, manteniendo la diversidad genética de la población y evitando la convergencia prematura a óptimos locales. La tasa de mutación típica es baja (0.1% a 5%) y debe ajustarse cuidadosamente.</p>
                      <p>El elitismo es una estrategia que asegura que los mejores individuos de cada generación sobrevivan intactos a la siguiente. Esto garantiza que la calidad de la mejor solución nunca empeore a lo largo de las generaciones.</p>
                      <p>La población inicial se genera típicamente de forma aleatoria, aunque el conocimiento del problema puede usarse para crear una población inicial de mayor calidad. El tamaño de la población afecta el equilibrio entre exploración y velocidad de convergencia.</p>
                      <p>El criterio de terminación puede ser un número fijo de generaciones, un valor de fitness suficiente, la falta de mejora durante cierto número de generaciones (estancamiento), o una combinación de estos.</p>
                      <p>Los AG son particularmente efectivos para problemas con espacios de búsqueda grandes, discontinuos, multimodales o ruidosos, donde los métodos tradicionales de optimización basados en gradientes no funcionan bien.</p>
                      <p>Las aplicaciones incluyen optimización de rutas (problema del viajante), diseño de ingeniería, calibración de modelos, planificación de horarios, juegos, robótica, redes neuronales (optimización de pesos), y muchas otras áreas.</p>
                      <p>En problemas de optimización multiobjetivo, los AG pueden encontrar múltiples soluciones óptimas en una sola ejecución mediante el concepto de frente de Pareto, donde ninguna solución es objetivamente mejor que otra en todos los objetivos.</p>
                      <p>Los AG de codificación real usan vectores de números reales en lugar de bits, lo que los hace más adecuados para problemas de optimización continua. Operadores como cruza SBX y mutación polinomial están diseñados específicamente para esta representación.</p>
                      <p>La programación genética (GP) es una variante donde los cromosomas representan programas o expresiones matemáticas en forma de árboles. Se usa para descubrimiento de ecuaciones simbólicas, diseño de circuitos y generación automática de algoritmos.</p>
                      <p>Las estrategias evolutivas (ES) son otra rama de la computación evolutiva que se enfoca en la auto-adaptación de los parámetros del algoritmo, como las tasas de mutación. Son especialmente populares en optimización continua.</p>
                      <p>La comparación con otros métodos de optimización muestra que los AG son robustos pero pueden ser más lentos que métodos específicos del dominio. Sin embargo, su flexibilidad los hace aplicables a una amplia variedad de problemas sin necesidad de modificaciones sustanciales.</p>
                      <p>En Python, bibliotecas como DEAP, PyGAD y inspyred proporcionan implementaciones completas y flexibles de algoritmos genéticos. NumPy se usa para las operaciones vectoriales y matplotlib para visualizar la evolución del fitness.</p>
                      <p>Los hiperparámetros principales de un AG son: tamaño de población, tasa de crossover, tasa de mutación, método de selección y criterio de terminación. El ajuste de estos parámetros puede requerir experimentación o meta-optimización.</p>
                      <p>Este curso te llevará desde los conceptos biológicos fundamentales hasta la implementación práctica de algoritmos genéticos. Aprenderás a codificar problemas, diseñar funciones de fitness, aplicar operadores evolutivos y analizar la convergencia de la población.</p>
                    </>
                  ) : (
                    <>
                      <p>La inteligencia artificial (IA) es una rama de la informática que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana. Estas tareas incluyen el aprendizaje, el razonamiento, la percepción, el reconocimiento de voz y la toma de decisiones.</p>
                      <p>El machine learning es un subcampo fundamental de la IA que permite a las máquinas aprender patrones a partir de datos sin ser programadas explícitamente. En lugar de seguir instrucciones rígidas, los algoritmos de ML identifican relaciones y reglas ocultas en los datos que luego aplican a nuevas situaciones.</p>
                      <p>Existen tres paradigmas principales de aprendizaje: supervisado, no supervisado y por refuerzo. En el aprendizaje supervisado, el modelo se entrena con datos etiquetados, aprendiendo a mapear entradas a salidas correctas. Es el enfoque más común y se usa en tareas como clasificación y regresión.</p>
                      <p>El aprendizaje no supervisado trabaja con datos sin etiquetar, donde el modelo debe encontrar estructuras y patrones por sí mismo. Las aplicaciones incluyen clustering, reducción de dimensionalidad y detección de anomalías. Es especialmente útil cuando no disponemos de datos etiquetados.</p>
                      <p>El aprendizaje por refuerzo se basa en la interacción con un entorno, donde el agente aprende mediante recompensas y castigos. Este paradigma ha producido avances espectaculares en juegos, robótica y sistemas de control autónomo.</p>
                      <p>Las redes neuronales artificiales están inspiradas en la estructura del cerebro humano. Consisten en capas de neuronas interconectadas que transforman los datos de entrada a través de funciones de activación no lineales. La combinación de múltiples capas da lugar al deep learning.</p>
                      <p>El deep learning ha revolucionado campos como la visión artificial, donde las redes convolucionales (CNN) extraen características jerárquicas de las imágenes. En el procesamiento del lenguaje natural (NLP), los transformers han permitido avances sin precedentes en traducción, generación de texto y análisis de sentimientos.</p>
                      <p>NumPy es la biblioteca fundamental para computación numérica en Python. Proporciona arrays multidimensionales, operaciones vectorizadas y funciones matemáticas de alto rendimiento. Es la base sobre la que se construyen la mayoría de los frameworks de machine learning.</p>
                      <p>SymPy es una biblioteca de matemática simbólica que permite manipular expresiones algebraicas, calcular derivadas, integrales, límites y resolver ecuaciones de forma analítica. Es una herramienta esencial para entender los fundamentos matemáticos de la IA.</p>
                      <p>El entrenamiento de modelos implica dividir los datos en conjuntos de entrenamiento, validación y prueba. El descenso por gradiente es el algoritmo de optimización más utilizado para ajustar los pesos de una red neuronal, minimizando una función de pérdida que mide el error del modelo.</p>
                      <p>La evaluación de modelos requiere métricas como precisión, recall, F1-score y la matriz de confusión. Es crucial evitar el overfitting mediante técnicas como regularización, dropout, early stopping y validación cruzada.</p>
                      <p>El preprocesamiento de datos es una etapa crítica que incluye limpieza, normalización, codificación de variables categóricas y manejo de valores faltantes. La calidad de los datos determina en gran medida el éxito del modelo.</p>
                      <p>Los transformers han transformado el NLP con su mecanismo de atención, que permite al modelo ponderar la importancia de diferentes partes de la entrada. Arquitecturas como BERT y GPT han establecido nuevos estándares en comprensión y generación de lenguaje.</p>
                      <p>La visión artificial utiliza redes convolucionales para tareas como clasificación de imágenes, detección de objetos y segmentación semántica. Frameworks como TensorFlow y PyTorch facilitan la implementación de estas arquitecturas complejas.</p>
                      <p>El aprendizaje transferido permite reutilizar modelos preentrenados en nuevas tareas con pocos datos, reduciendo drásticamente el tiempo y los recursos necesarios para entrenar desde cero.</p>
                      <p>La ética en IA es fundamental: los sesgos en los datos pueden perpetuar desigualdades, y la transparencia en los modelos es necesaria para generar confianza. La IA responsable busca crear sistemas justos, explicables y respetuosos con la privacidad.</p>
                      <p>El MLOps es la práctica de aplicar principios DevOps a los pipelines de machine learning, automatizando el entrenamiento, evaluación, despliegue y monitoreo de modelos en producción.</p>
                      <p>Las aplicaciones de la IA son prácticamente infinitas: diagnóstico médico, vehículos autónomos, asistentes virtuales, recomendación personalizada, detección de fraudes, predicción climática y mucho más.</p>
                      <p>Para dominar la IA se requiere una base sólida en matemáticas (álgebra lineal, cálculo, probabilidad y estadística), programación (Python es el lenguaje estándar) y conocimiento de los algoritmos y arquitecturas fundamentales.</p>
                      <p>Este curso te proporcionará los conocimientos teóricos y prácticos necesarios para comenzar tu viaje en el mundo de la inteligencia artificial. A través de ejemplos interactivos, demos con herramientas reales y un examen final, consolidarás tu aprendizaje y estarás preparado para enfrentar desafíos reales.</p>
                    </>
                  )}
                </div>
                {!tareas.explicacion && (
                  <button onClick={() => completarTarea('explicacion')} className="btn btn-custom-success mt-3 py-2 rounded-3 small fw-medium w-100">
                    📖 Marcar como leído
                  </button>
                )}
                {tareas.explicacion && (
                  <div className="mt-3 p-3 rounded-3 text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                    <p className="small mb-0 text-green fw-semibold">✅ Explicación completada</p>
                  </div>
                )}
              </div>
            )}

                {detalleTab === 'ejemplos' && (
              <div>
                <h6 className="fw-bold text-white mb-3">💡 Ejemplos Interactivos</h6>
                <div className="d-flex gap-2 mb-3 flex-wrap">
                  {(curso?.nombre === 'Regresión Lineal'
                    ? [
                      { key: 'regresion', label: '📈 Regresión Lineal' },
                      { key: 'matrices', label: '🔢 Operaciones con Matrices' },
                      { key: 'ecuaciones', label: '✏️ Ecuaciones Lineales' },
                    ]
                    : curso?.nombre === 'Algoritmo Genético'
                    ? [
                      { key: 'genetico', label: '🧬 Algoritmo Genético' },
                      { key: 'matrices', label: '🔢 Operaciones con Matrices' },
                      { key: 'ecuaciones', label: '✏️ Ecuaciones Lineales' },
                    ]
                    : [
                      { key: 'regresion', label: '📈 Regresión Lineal' },
                      { key: 'matrices', label: '🔢 Operaciones con Matrices' },
                      { key: 'ecuaciones', label: '✏️ Ecuaciones Lineales' },
                    ]
                  ).map((t) => (
                    <button key={t.key} onClick={() => setEjemploTab(t.key)}
                      className={`btn rounded-3 small fw-medium px-3 py-1 ${ejemploTab === t.key ? 'badge-cyan' : ''}`}
                      style={ejemploTab !== t.key ? { background: 'transparent', color: '#64748b', border: '1px solid transparent' } : { border: '1px solid rgba(13,202,240,0.2)' }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {ejemploTab === 'regresion' && (
                  <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(13,202,240,0.08)' }}>
                    <p className="small mb-2" style={{ color: '#94a3b8' }}>Ingresa valores de X e Y separados por coma para calcular la recta de regresión lineal:</p>
                    <div className="row g-2 mb-2">
                      <div className="col">
                        <label className="small mb-1" style={{ color: '#64748b' }}>X</label>
                        <input className="form-control form-control-custom" value={regX} onChange={e => setRegX(e.target.value)} />
                      </div>
                      <div className="col">
                        <label className="small mb-1" style={{ color: '#64748b' }}>Y</label>
                        <input className="form-control form-control-custom" value={regY} onChange={e => setRegY(e.target.value)} />
                      </div>
                    </div>
                    <button onClick={resolverRegresion} className="btn btn-cyan w-100 py-2 rounded-3 small fw-medium">📊 Calcular Regresión</button>
                    {regResultado && (
                      <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                        <p className="small mb-1 text-green fw-semibold">✅ Resultado</p>
                        <p className="small mb-0" style={{ color: '#94a3b8' }}>Ecuación: <strong className="text-white">y = {regResultado.m}x + {regResultado.b}</strong></p>
                        <p className="small mb-0" style={{ color: '#94a3b8' }}>Pendiente (m): <strong className="text-white">{regResultado.m}</strong> | Intersección (b): <strong className="text-white">{regResultado.b}</strong></p>
                      </div>
                    )}
                  </div>
                )}

                {ejemploTab === 'matrices' && (
                  <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(13,202,240,0.08)' }}>
                    <p className="small mb-2" style={{ color: '#94a3b8' }}>Ingresa una matriz cuadrada (2x2 o 3x3). Ej: 2x2 → <code className="text-cyan">1,2;3,4</code> &nbsp; 3x3 → <code className="text-cyan">1,2,3;4,5,6;7,8,9</code></p>
                    <div className="mb-2">
                      <label className="small mb-1" style={{ color: '#64748b' }}>Matriz</label>
                      <input className="form-control form-control-custom" value={matrizCalc} onChange={e => setMatrizCalc(e.target.value)} />
                    </div>
                    <button onClick={ejecutarMatrizCalc} className="btn btn-cyan w-100 py-2 rounded-3 small fw-medium">🔢 Calcular</button>
                    {detResultado !== null && (
                      <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(13,202,240,0.05)', border: '1px solid rgba(13,202,240,0.1)' }}>
                        <p className="small mb-1 fw-semibold text-cyan">✅ Resultados</p>
                        <p className="small mb-1" style={{ color: '#94a3b8' }}>Determinante: <strong className="text-white">{typeof detResultado === 'number' ? Math.round(detResultado * 100) / 100 : detResultado}</strong></p>
                        {invResultado && <p className="small mb-0" style={{ color: '#94a3b8' }}>Inversa:<br /><strong className="text-white" style={{ whiteSpace: 'pre-wrap' }}>{invResultado}</strong></p>}
                      </div>
                    )}
                  </div>
                )}

                {ejemploTab === 'ecuaciones' && (
                  <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(13,202,240,0.08)' }}>
                    <p className="small mb-2" style={{ color: '#94a3b8' }}>Resuelve ecuaciones lineales. Ingresa en formato <code className="text-cyan">2x+3=7</code></p>
                    <div className="mb-2">
                      <label className="small mb-1" style={{ color: '#64748b' }}>Ecuación</label>
                      <input className="form-control form-control-custom" value={calcEcuacion} onChange={e => setCalcEcuacion(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && resolverEcuacion()} placeholder="ej: 3x+5=20" />
                    </div>
                    <button onClick={resolverEcuacion} className="btn btn-cyan w-100 py-2 rounded-3 small fw-medium">✏️ Resolver</button>
                    {calcEcuacion.includes('x = ') && (
                      <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                        <p className="small mb-0 text-green fw-semibold">✅ {calcEcuacion}</p>
                      </div>
                    )}
                    {calcEcuacion.includes('Error') || calcEcuacion.includes('Formato') ? (
                      <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <p className="small mb-0" style={{ color: '#ef4444' }}>⚠️ {calcEcuacion}</p>
                      </div>
                    ) : null}
                  </div>
                )}

                {ejemploTab === 'genetico' && (
                  <div>
                    <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(13,202,240,0.08)' }}>
                      <p className="small mb-2" style={{ color: '#94a3b8' }}>Simula un algoritmo genético para encontrar el valor máximo de la función f(x) = x² en un rango de 0 a 31 (representación binaria de 5 bits).</p>
                      <div className="d-flex gap-2 mb-2 flex-wrap align-items-center">
                        <div style={{ flex: '1 1 150px' }}>
                          <label className="small mb-1" style={{ color: '#64748b' }}>Tamaño población</label>
                          <input className="form-control form-control-custom" type="number" min="4" max="50" value={gaPopSize} onChange={e => setGaPopSize(Number(e.target.value))} />
                        </div>
                        <div style={{ flex: '1 1 100px' }}>
                          <label className="small mb-1" style={{ color: '#64748b' }}>Generaciones</label>
                          <input className="form-control form-control-custom" type="number" min="1" max="100" value={gaGeneraciones} onChange={e => setGaGeneraciones(Number(e.target.value))} />
                        </div>
                        <div style={{ flex: '1 1 100px' }}>
                          <label className="small mb-1" style={{ color: '#64748b' }}>Tasa mutación</label>
                          <input className="form-control form-control-custom" type="number" min="0" max="1" step="0.05" value={gaTasaMutacion} onChange={e => setGaTasaMutacion(Number(e.target.value))} />
                        </div>
                      </div>
                      <button onClick={ejecutarGA} className="btn btn-cyan w-100 py-2 rounded-3 small fw-medium">🧬 Ejecutar Algoritmo Genético</button>
                      {gaResultado && (
                        <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                          <p className="small mb-1 text-green fw-semibold">✅ Resultados</p>
                          <p className="small mb-1" style={{ color: '#94a3b8' }}>Mejor solución: <strong className="text-white">x = {gaResultado.mejorX}</strong> (f(x) = {gaResultado.mejorFitness})</p>
                          <p className="small mb-1" style={{ color: '#94a3b8' }}>Generación: <strong className="text-white">{gaResultado.generacion}</strong></p>
                          <p className="small mb-0" style={{ color: '#94a3b8' }}>Fitness inicial promedio: <strong className="text-white">{gaResultado.fitnessInicial}</strong> → Final: <strong className="text-white">{gaResultado.fitnessFinal}</strong></p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(13,202,240,0.08)' }}>
                      <p className="small mb-2" style={{ color: '#94a3b8' }}>¿Cómo funciona? El algoritmo codifica cada solución como un cromosoma binario de 5 bits (valores 0-31). La función de fitness es f(x) = x². En cada generación, los individuos más aptos se cruzan y mutan, evolucionando hacia valores más altos.</p>
                      <p className="small mb-0" style={{ color: '#64748b' }}>💡 Presiona "Ejecutar" para ver el resultado de la evolución.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {detalleTab === 'demo' && (
              <div>
                <h6 className="fw-bold text-white mb-3">🚀 Demo - SymPy & NumPy</h6>
                <div className="d-flex gap-2 mb-3 flex-wrap">
                  {(curso?.nombre === 'Regresión Lineal'
                    ? [
                      { key: 'sympy', label: '🧮 SymPy - Derivadas' },
                      { key: 'numpy', label: '🔢 NumPy - Matrices' },
                      { key: 'evaluacion', label: '📊 Evaluación' },
                      { key: 'csv', label: '📁 Cargar CSV' },
                    ]
                    : curso?.nombre === 'Algoritmo Genético'
                    ? [
                      { key: 'sympy', label: '🧮 SymPy - Derivadas' },
                      { key: 'numpy', label: '🔢 NumPy - Matrices' },
                      { key: 'evaluacion', label: '📊 Evaluación' },
                      { key: 'genetico', label: '🧬 GA Demo' },
                    ]
                    : [
                      { key: 'sympy', label: '🧮 SymPy - Derivadas' },
                      { key: 'numpy', label: '🔢 NumPy - Matrices' },
                      { key: 'evaluacion', label: '📊 Evaluación' },
                    ]
                  ).map((t) => (
                    <button key={t.key} onClick={() => setDemoSeccion(t.key)}
                      className={`btn rounded-3 small fw-medium px-3 py-1 ${demoSeccion === t.key ? 'badge-cyan' : ''}`}
                      style={demoSeccion !== t.key ? { background: 'transparent', color: '#64748b', border: '1px solid transparent' } : { border: '1px solid rgba(13,202,240,0.2)' }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {demoSeccion === 'sympy' && (
                  <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(13,202,240,0.08)' }}>
                    <p className="small mb-2" style={{ color: '#94a3b8' }}>Calcula la derivada de un polinomio (coeficientes separados por coma, de menor a mayor grado).<br />Ej: <code className="text-cyan">3,0,5,2</code> → 3 + 0x + 5x² + 2x³</p>
                    <div className="mb-2">
                      <label className="small mb-1" style={{ color: '#64748b' }}>Coeficientes del polinomio</label>
                      <input className="form-control form-control-custom" value={exprPolinomio} onChange={e => setExprPolinomio(e.target.value)} />
                    </div>
                    <button onClick={() => { setExprPolinomio(exprPolinomio); if (!tareas.demo) completarTarea('demo'); }} className="btn btn-cyan py-2 rounded-3 small fw-medium w-100">
                      🧮 Derivar
                    </button>
                    <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(13,202,240,0.05)', border: '1px solid rgba(13,202,240,0.1)' }}>
                      <p className="small mb-1 fw-semibold text-cyan">Resultado SymPy</p>
                      <p className="small mb-0" style={{ color: '#94a3b8' }}>
                        f(x) = <strong className="text-white">{ejecutarDerivada()}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {demoSeccion === 'numpy' && (
                  <div>
                    <div className="p-3 mb-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(13,202,240,0.08)' }}>
                      <p className="small mb-2" style={{ color: '#94a3b8' }}>Producto de matrices (formato filas separadas por <code className="text-cyan">;</code>, columnas por <code className="text-cyan">,</code>)</p>
                      <div className="row g-2 mb-2">
                        <div className="col">
                          <label className="small mb-1" style={{ color: '#64748b' }}>Matriz A</label>
                          <input className="form-control form-control-custom" value={matrizA} onChange={e => setMatrizA(e.target.value)} />
                        </div>
                        <div className="col">
                          <label className="small mb-1" style={{ color: '#64748b' }}>Matriz B</label>
                          <input className="form-control form-control-custom" value={matrizB} onChange={e => setMatrizB(e.target.value)} />
                        </div>
                      </div>
                      <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(13,202,240,0.05)', border: '1px solid rgba(13,202,240,0.1)' }}>
                        <p className="small mb-1 fw-semibold text-cyan">Resultado NumPy (A · B)</p>
                        <pre className="small mb-0 text-white" style={{ whiteSpace: 'pre-wrap' }}>{ejecutarProducto()}</pre>
                      </div>
                    </div>
                    <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(13,202,240,0.08)' }}>
                      <p className="small mb-2" style={{ color: '#94a3b8' }}>Determinante de la matriz A ({matrizA}):</p>
                      <div className="p-3 rounded-3" style={{ background: 'rgba(13,202,240,0.05)', border: '1px solid rgba(13,202,240,0.1)' }}>
                        <p className="small mb-0" style={{ color: '#94a3b8' }}>det(A) = <strong className="text-white">{ejecutarDeterminante(matrizA)}</strong></p>
                      </div>
                    </div>
                  </div>
                )}

                {demoSeccion === 'evaluacion' && (
                  <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(13,202,240,0.08)' }}>
                    <p className="small mb-2" style={{ color: '#94a3b8' }}>Evalúa un polinomio en un valor de x.</p>
                    <div className="row g-2 mb-2">
                      <div className="col">
                        <label className="small mb-1" style={{ color: '#64748b' }}>Coeficientes</label>
                        <input className="form-control form-control-custom" value={exprPolinomio} onChange={e => setExprPolinomio(e.target.value)} />
                      </div>
                      <div className="col">
                        <label className="small mb-1" style={{ color: '#64748b' }}>x =</label>
                        <input className="form-control form-control-custom" value={exprX} onChange={e => setExprX(e.target.value)} type="number" />
                      </div>
                    </div>
                    <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                      <p className="small mb-0" style={{ color: '#94a3b8' }}>
                        f({exprX}) = <strong className="text-white fs-5">{ejecutarEvaluacion()}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {demoSeccion === 'csv' && (
                  <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(13,202,240,0.08)' }}>
                    <p className="small mb-2" style={{ color: '#94a3b8' }}>Sube un archivo CSV con datos numéricos para calcular la regresión lineal. El archivo debe tener al menos 2 columnas numéricas: X (independiente) e Y (dependiente).</p>
                    <div className="mb-3">
                      <label className="small mb-1 fw-medium text-white">Seleccionar archivo CSV</label>
                      <input type="file" accept=".csv" className="form-control form-control-custom" onChange={handleCsvUpload} />
                    </div>
                    {csvData && (
                      <div className="mb-3">
                        <label className="small mb-1" style={{ color: '#64748b' }}>Columna para X (independiente)</label>
                        <select className="form-select form-select-custom mb-2" value={csvColX} onChange={e => setCsvColX(e.target.value)}>
                          <option value="">Seleccionar...</option>
                          {csvData.columnas.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>
                        <label className="small mb-1" style={{ color: '#64748b' }}>Columna para Y (dependiente)</label>
                        <select className="form-select form-select-custom" value={csvColY} onChange={e => setCsvColY(e.target.value)}>
                          <option value="">Seleccionar...</option>
                          {csvData.columnas.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>
                      </div>
                    )}
                    {csvData && csvColX && csvColY && (
                      <button onClick={calcularRegresionCSV} className="btn btn-cyan w-100 py-2 rounded-3 small fw-medium mb-3">
                        📊 Calcular Regresión con datos CSV
                      </button>
                    )}
                    {csvResultado && (
                      <div className="p-3 rounded-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                        <p className="small mb-1 text-green fw-semibold">✅ Resultados de Regresión Lineal</p>
                        <p className="small mb-1" style={{ color: '#94a3b8' }}>Ecuación: <strong className="text-white">y = {csvResultado.pendiente}x + {csvResultado.interseccion}</strong></p>
                        <p className="small mb-1" style={{ color: '#94a3b8' }}>R²: <strong className="text-white">{csvResultado.r2}</strong></p>
                        <p className="small mb-1" style={{ color: '#94a3b8' }}>Pendiente: <strong className="text-white">{csvResultado.pendiente}</strong> | Intersección: <strong className="text-white">{csvResultado.interseccion}</strong></p>
                        <p className="small mb-0" style={{ color: '#94a3b8' }}>Correlación: <strong className="text-white">{csvResultado.correlacion}</strong></p>
                      </div>
                    )}
                  </div>
                )}

                {demoSeccion === 'genetico' && (
                  <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(13,202,240,0.08)' }}>
                    <p className="small mb-2" style={{ color: '#94a3b8' }}>Demo interactiva del Algoritmo Genético: maximiza f(x) = x² (x entre 0 y 31, 5 bits).</p>
                    <div className="d-flex gap-2 mb-2 flex-wrap align-items-center">
                      <div style={{ flex: '1 1 120px' }}>
                        <label className="small mb-1" style={{ color: '#64748b' }}>Población</label>
                        <input className="form-control form-control-custom" type="number" min="4" max="50" value={gaPopSize} onChange={e => setGaPopSize(Number(e.target.value))} />
                      </div>
                      <div style={{ flex: '1 1 100px' }}>
                        <label className="small mb-1" style={{ color: '#64748b' }}>Generaciones</label>
                        <input className="form-control form-control-custom" type="number" min="1" max="100" value={gaGeneraciones} onChange={e => setGaGeneraciones(Number(e.target.value))} />
                      </div>
                      <div style={{ flex: '1 1 100px' }}>
                        <label className="small mb-1" style={{ color: '#64748b' }}>Mutación</label>
                        <input className="form-control form-control-custom" type="number" min="0" max="1" step="0.05" value={gaTasaMutacion} onChange={e => setGaTasaMutacion(Number(e.target.value))} />
                      </div>
                    </div>
                    <button onClick={ejecutarGA} className="btn btn-cyan w-100 py-2 rounded-3 small fw-medium">🧬 Ejecutar GA</button>
                    {gaResultado && <button onClick={() => { completarTarea('demo'); }} className="btn btn-custom-success w-100 py-2 rounded-3 small fw-medium mt-2">✅ Marcar demo completada</button>}
                    {gaResultado && (
                      <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                        <p className="small mb-1 text-green fw-semibold">✅ Resultados</p>
                        <p className="small mb-1" style={{ color: '#94a3b8' }}>Mejor x: <strong className="text-white">{gaResultado.mejorX}</strong> → f(x) = <strong className="text-white">{gaResultado.mejorFitness}</strong></p>
                        <p className="small mb-0" style={{ color: '#94a3b8' }}>Fitness prom. inicial: <strong className="text-white">{gaResultado.fitnessInicial}</strong> → final: <strong className="text-white">{gaResultado.fitnessFinal}</strong></p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {detalleTab === 'examen' && (
              <div>
                <h6 className="fw-bold text-white mb-3">📋 Examen Final ({preguntasExamen.length} preguntas)</h6>
                {!examenResultado ? (
                  <div>
                    <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                      <p className="small mb-0" style={{ color: '#eab308' }}>
                        ⚠️ Responde todas las preguntas. Necesitas al menos el 60% para aprobar.
                      </p>
                    </div>
                    {preguntasExamen.map((p) => (
                      <div key={p.id} className="mb-2 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(13,202,240,0.06)' }}>
                        <p className="fw-medium mb-2 text-white small">{p.id}. {p.pregunta}</p>
                        {p.opciones.map((op, idx) => (
                          <div key={idx} className="form-check mb-1">
                            <input className="form-check-input" type="radio" name={`pregunta_${p.id}`} id={`p${p.id}_o${idx}`}
                              checked={Number(examenRespuestas[p.id]) === idx}
                              onChange={() => setExamenRespuestas({ ...examenRespuestas, [p.id]: idx })}
                              style={{ accentColor: 'var(--cyan)' }} />
                            <label className="form-check-label small" style={{ color: '#94a3b8' }} htmlFor={`p${p.id}_o${idx}`}>{op}</label>
                          </div>
                        ))}
                      </div>
                    ))}
                    <button onClick={enviarExamen} className="btn btn-cyan w-100 py-2 rounded-3 fw-medium mt-2">
                      📤 Enviar Examen ({Object.keys(examenRespuestas).length}/{preguntasExamen.length} respondidas)
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4 rounded-3" style={{ background: examenResultado.aciertos / examenResultado.total >= 0.6 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${examenResultado.aciertos / examenResultado.total >= 0.6 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                    <span className="fs-1 mb-2 d-inline-block">{examenResultado.aciertos / examenResultado.total >= 0.6 ? '🎉' : '😢'}</span>
                    <h5 className="fw-bold mb-2" style={{ color: examenResultado.aciertos / examenResultado.total >= 0.6 ? 'var(--green)' : '#ef4444' }}>
                      {examenResultado.aciertos / examenResultado.total >= 0.6 ? '¡Aprobado!' : 'Reprobado'}
                    </h5>
                    <p className="small mb-2" style={{ color: '#94a3b8' }}>
                      Obtuviste <strong>{examenResultado.aciertos}</strong> de <strong>{examenResultado.total}</strong> respuestas correctas ({Math.round(examenResultado.aciertos / examenResultado.total * 100)}%)
                    </p>
                    {examenResultado.aciertos / examenResultado.total >= 0.6 ? (
                      <p className="small text-green">✅ ¡Felicidades! Has completado el examen final satisfactoriamente.</p>
                    ) : (
                      <button onClick={() => { setExamenRespuestas({}); setExamenResultado(null) }} className="btn btn-custom-danger small px-4 py-2 rounded-3 fw-medium">
                        🔄 Intentar de nuevo
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
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
            <p className="small mb-0" style={{ color: '#64748b' }}>Estudiante</p>
          </div>
          <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40, background: 'rgba(13,202,240,0.15)', color: 'var(--cyan)' }}>
            {user?.nombre?.[0]}{user?.apellido?.[0]}
          </div>
          <button onClick={logout} className="btn btn-custom-danger small px-3 py-1 rounded-3">Cerrar sesión</button>
        </div>
      </nav>

      <div className="container py-4">
        <div className="mb-4">
          <h2 className="fw-bold fs-2 text-white">🎓 Panel de Estudiante</h2>
          <p style={{ color: '#64748b' }}>Explora cursos, gestiona tus inscripciones y obtén certificados</p>
        </div>

        {mensaje && (
          <div className="d-flex align-items-center justify-content-between badge-cyan rounded-3 px-4 py-3 mb-4 small">
            <span>💡 {mensaje}</span>
            <button className="btn btn-link text-decoration-none p-0 ms-2 fs-5" style={{ color: 'var(--cyan)' }} onClick={() => setMensaje('')}>×</button>
          </div>
        )}

        <div className="d-flex gap-2 mb-4 border-bottom pb-3 flex-wrap" style={{ borderColor: 'rgba(13,202,240,0.08)' }}>
          {[
            { key: 'cursos', label: '📚 Todos los cursos' },
            { key: 'inscripciones', label: '📋 Mis inscripciones' },
            { key: 'progreso', label: '📊 Mi progreso' },
            { key: 'certificados', label: `🎓 Certificados (${certificados.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`btn rounded-3 small fw-medium px-3 py-2 ${tab === t.key ? 'badge-cyan' : 'btn'}`}
              style={tab !== t.key ? { background: 'transparent', color: '#64748b', border: '1px solid transparent' } : { border: '1px solid rgba(13,202,240,0.2)' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'cursos' && (
          <div className="row g-3">
            {cursos.map((c) => {
              const estado = getEstadoCurso(c.id)
              return (
                <div key={c.id} className="col-md-6 col-lg-4">
                  <div className="glass-card p-4 h-100">
                    <span className="fs-1 mb-2 d-inline-block">{c.imagen_emoji}</span>
                    <h6 className="fw-semibold mb-2 text-white">{c.nombre}</h6>
                    <p className="small mb-3" style={{ color: '#64748b' }}>{c.descripcion_corta}</p>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span className={`badge rounded-pill fw-medium px-3 py-1 ${getNivelBadge(c.nivel)}`}>{c.nivel}</span>
                      <span className="badge-silver badge rounded-pill fw-medium px-3 py-1">⏱️ {c.duracion}</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between pt-3 border-top" style={{ borderColor: 'rgba(13,202,240,0.08)' }}>
                      <span className="small" style={{ color: '#64748b' }}>👤 {c.inscritos_count || 0}</span>
                      {!estado && (
                        <button onClick={() => inscribir(c.id)} className="btn btn-cyan small px-3 py-1 rounded-3 fw-medium">
                          Inscribirse
                        </button>
                      )}
                      {estado === 'en_espera' && <span className="small fw-medium" style={{ color: '#eab308' }}>⏳ En espera</span>}
                      {estado === 'aceptado' && (
                        <button onClick={() => verProgreso(c.id)} className="btn btn-custom-success small px-3 py-1 rounded-3 fw-medium">
                          📖 Ir al curso
                        </button>
                      )}
                      {estado === 'rechazado' && <span className="small fw-medium" style={{ color: '#ef4444' }}>❌ Rechazado</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'inscripciones' && (
          <div>
            {misInscripciones.length === 0 ? (
              <div className="glass-card text-center p-5">
                <span className="fs-1">📋</span>
                <p className="mt-3" style={{ color: '#64748b' }}>No te has inscrito a ningún curso aún.</p>
                <button onClick={() => setTab('cursos')} className="btn btn-link text-cyan text-decoration-none small p-0 mt-1">Explorar cursos</button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {misInscripciones.map((insc) => {
                  const curso = cursos.find((c) => c.id === insc.curso_id)
                  if (!curso) return null
                  return (
                    <div key={insc.id} className="glass-card p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <span className="fs-1">{insc.curso_emoji}</span>
                        <div>
                          <h6 className="fw-semibold text-white">{insc.curso_nombre}</h6>
                          <p className="small mb-0" style={{ color: '#64748b' }}>{insc.curso_duracion} · {insc.curso_nivel}</p>
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <span className={`badge rounded-pill fw-medium px-3 py-1 small ${getEstadoBadge(insc.estado)}`}>
                              {getEstadoIcon(insc.estado)} {insc.estado === 'aceptado' ? 'Aceptado' : insc.estado === 'en_espera' ? 'En espera' : 'Rechazado'}
                            </span>
                            {insc.estado === 'aceptado' && (
                              <span className="small" style={{ color: '#64748b' }}>📊 {insc.progreso || 0}% completado</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        {insc.estado === 'aceptado' && (
                          <button onClick={() => verProgreso(insc.curso_id)} className="btn btn-cyan small px-3 py-2 rounded-3 fw-medium">
                            {insc.progreso > 0 ? 'Continuar' : 'Comenzar'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'progreso' && (
          <div>
            {misInscripciones.filter(i => i.estado === 'aceptado').length === 0 ? (
              <div className="glass-card text-center p-5">
                <span className="fs-1">📊</span>
                <p className="mt-3" style={{ color: '#64748b' }}>No tienes cursos aceptados aún.</p>
                <button onClick={() => setTab('cursos')} className="btn btn-link text-cyan text-decoration-none small p-0 mt-1">Explorar cursos</button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {misInscripciones.filter(i => i.estado === 'aceptado').map((insc) => {
                  const curso = cursos.find((c) => c.id === insc.curso_id)
                  return (
                    <div key={insc.id} className="glass-card p-4">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fs-2">{insc.curso_emoji}</span>
                          <h6 className="fw-semibold mb-0 text-white">{insc.curso_nombre}</h6>
                        </div>
                        <span className="small fw-bold text-cyan">{insc.progreso}%</span>
                      </div>
                      <div className="progress progress-dark mb-2" style={{ height: 12 }}>
                        <div className="progress-bar progress-bar-cyan" style={{ width: `${insc.progreso}%`, height: 12, borderRadius: 10 }}></div>
                      </div>
                      <div className="d-flex justify-content-between small" style={{ color: '#64748b' }}>
                        <span>Progreso general</span>
                        <button onClick={() => verProgreso(insc.curso_id)} className="btn btn-link text-cyan text-decoration-none p-0 small">Ver detalle →</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'certificados' && (
          <div>
            {certificados.length === 0 ? (
              <div className="glass-card text-center p-5">
                <span className="fs-1">🎓</span>
                <p className="mt-3" style={{ color: '#64748b' }}>No tienes certificados aún.</p>
                <p className="small" style={{ color: '#475569' }}>Completa un curso para obtener tu certificado.</p>
              </div>
            ) : (
              <div className="row g-3">
                {certificados.map((cert) => (
                  <div key={cert.id} className="col-md-6 col-lg-4">
                    <div className="glass-card p-4 text-center">
                      <span className="fs-1 mb-3 d-inline-block">🎓</span>
                      <h6 className="fw-bold mb-2 text-white">{cert.curso_nombre}</h6>
                      <div className="rounded-3 p-3 mb-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                        <p className="small mb-1" style={{ color: '#64748b' }}>Código de certificado</p>
                        <p className="small fw-bold font-monospace mb-0" style={{ color: '#eab308' }}>{cert.codigo}</p>
                      </div>
                      <p className="small" style={{ color: '#64748b' }}>Emitido: {new Date(cert.emitido_en).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
