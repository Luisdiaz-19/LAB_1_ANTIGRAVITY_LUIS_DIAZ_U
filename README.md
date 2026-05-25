# AI CURSOS MENTE ARTIFICIAL

**Plataforma de cursos online sobre Inteligencia Artificial**  
_the future begins today._

---

## Stack Tecnológico

### Backend
| Componente | Tecnología |
|---|---|
| Framework | FastAPI (Python) |
| ORM | SQLAlchemy 2.0 |
| Base de datos | SQLite (archivo `backend/data/plataforma.db`) |
| Autenticación | JWT (HS256, 24h) + bcrypt |
| Email | aiosmtplib (con fallback a simulado) |
| Servidor | Uvicorn |

### Frontend
| Componente | Tecnología |
|---|---|
| UI | React 18 + Vite |
| CSS | Bootstrap 5.3.3 (CDN + npm) |
| Tema | Oscuro personalizado (cian/blanco/verde) |
| HTTP | Axios con interceptor JWT |
| Enrutado | react-router-dom v6 |

---

## Roles del Sistema

| Rol | Acceso |
|---|---|
| **admin** | Panel `/admin` — gestiona solicitudes, usuarios, cursos |
| **docente** | Panel `/docente` — gestiona lecciones de sus cursos |
| **moderador** | Panel `/moderador` — revisa y publica cursos |
| **student** | Panel `/estudiante` — explora cursos, se inscribe, progresa, obtiene certificados |

---

## Credenciales de Prueba (seed)

| Rol | Correo | Contraseña |
|---|---|---|
| Admin | admin@aiacademy.com | admin123 |
| Docente | carlos@aiacademy.com | docente123 |
| Moderador | laura@aiacademy.com | moderador123 |
| Estudiante | estudiante@aiacademy.com | estudiante123 |

---

## Cursos Disponibles

### Cursos Originales (seed)
1. Fundamentos de IA
2. Machine Learning con Python
3. Deep Learning y Redes Neuronales
4. Visión Artificial
5. Procesamiento del Lenguaje Natural
6. Robótica e IA
7. Ética y Regulación en IA
8. Proyecto Final de IA

### Cursos Nuevos Agregados
9. **Regresión Lineal** — Matemáticas, 4 semanas, 4 lecciones
10. **Algoritmo Genético** — Matemáticas, 5 semanas, 4 lecciones

---

## Endpoints de la API

Todas las rutas están prefijadas con `/api`.

### Auth (`/api/auth`)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/registro` | Registrar estudiante |
| POST | `/login` | Iniciar sesión, devuelve JWT |
| GET | `/usuarios` | Listar usuarios (admin) |
| POST | `/usuarios` | Crear usuario con rol (admin) |
| PUT | `/usuarios/{id}/rol` | Cambiar rol |
| PUT | `/usuarios/{id}/estado` | Activar/desactivar |

### Cursos (`/api/cursos`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar cursos |
| GET | `/{id}` | Detalle del curso + lecciones |
| POST | `/` | Crear curso |
| PUT | `/{id}` | Actualizar curso |
| DELETE | `/{id}` | Eliminar curso |

### Estudiantes (`/api/estudiantes`)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/inscribir/{curso_id}` | Solicitar inscripción |
| GET | `/mis-cursos/{usuario_id}` | Listar inscripciones |
| GET | `/progreso/{uid}/{cid}` | Progreso detallado |
| POST | `/progreso/{uid}/{cid}` | Marcar lección completada |
| POST | `/completar/{uid}/{cid}` | Completar curso y generar certificado |
| GET | `/certificados/{usuario_id}` | Listar certificados |

### Solicitudes (`/api/solicitudes`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Solicitudes pendientes |
| GET | `/todas` | Todas las inscripciones |
| PUT | `/{id}/estado` | Aceptar/rechazar |

### Docentes (`/api/docentes`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/{docente_id}/cursos` | Cursos del docente |
| POST | `/lecciones` | Crear lección |
| PUT | `/lecciones/{id}` | Editar lección |
| DELETE | `/lecciones/{id}` | Eliminar lección |
| GET | `/lecciones/{curso_id}` | Lecciones de un curso |

### Moderadores (`/api/moderadores`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/contenido-pendiente` | Cursos en borrador |
| PUT | `/cursos/{id}/estado` | Publicar/revertir |

### Notificaciones (`/api/notificaciones`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/{usuario_id}` | Listar notificaciones |
| PUT | `/{id}/leer` | Marcar como leída |
| GET | `/{id}/no-leidas` | Contar no leídas |

---

## Base de Datos (SQLAlchemy)

7 tablas: `usuarios`, `cursos`, `lecciones`, `inscripciones`, `progreso_lecciones`, `certificados`, `notificaciones`.

Ver `backend/models.py` para el esquema completo.

---

## Cambios Realizados

### Migración de Tailwind CSS a Bootstrap 5
- Eliminado `tailwindcss` y `@tailwindcss/vite` del proyecto
- Instalado `bootstrap@5.3.3` vía npm + CDN en `index.html`
- Creado `index.css` con tema oscuro personalizado (variables CSS: `--cyan`, `--green`, `--dark`)
- Convertidas las 8 páginas de `className` de Tailwind a Bootstrap 5

### Rebranding
- Cambiado nombre de "AI Academy" a **"AI CURSOS MENTE ARTIFICIAL"**
- Agregado tagline **"the future begins today."** en navbars y hero

### StudentPanel.jsx — Contenido Interactivo por Curso
- **Explicación**: 20 párrafos diferenciados por curso (Regresión Lineal, Algoritmo Genético, IA general)
- **Ejemplos interactivos**:
  - Calculadora de regresión lineal (ingreso manual X/Y)
  - Operaciones con matrices (determinante 2x2/3x3, inversa 2x2)
  - Resolvedor de ecuaciones lineales (`2x+3=7`)
  - Simulador de **Algoritmo Genético** (población, generaciones, tasa de mutación configurables, selección por ruleta, cruzamiento uniforme, mutación binaria)
- **Demo**:
  - Derivadas de polinomios (SymPy simulado)
  - Producto de matrices y determinante (NumPy simulado)
  - Evaluación de polinomios
  - **Carga de CSV** para regresión lineal (solo curso Regresión Lineal)
  - **Demo de GA** (solo curso Algoritmo Genético)
- **Examen final**: 8 preguntas por curso, seleccionadas dinámicamente según `curso.nombre`, umbral de aprobación 60%

### Sistema de Progreso por Tareas
- 4 tareas por curso: leer explicación, resolver ejemplos, probar demo, aprobar examen
- Persistencia en `localStorage` (`tareas_{userId}_{cursoId}`)
- Al completar el 100% se llama a `POST /estudiantes/completar/` para generar certificado

### Login con Redirección por Rol
- `Login.jsx` redirige automáticamente según rol tras login exitoso
- `AuthContext.login`/`register` retornan `data.usuario` para uso inmediato

### Nuevos Cursos en la Base de Datos
- Ejecutado script `backend/add_courses.py` para agregar:
  - **Regresión Lineal** (id=9): 4 lecciones con contenido interactivo
  - **Algoritmo Genético** (id=10): 4 lecciones con contenido interactivo
- Endpoint `GET /cursos/{id}` ahora devuelve campo `contenido` en cada lección

### AdminPanel — Gestión de Usuarios
- Columnas agregadas: **Usuario** (parte local del correo), **Contraseña** (hash bcrypt truncado)
- Backend `GET /auth/usuarios` ahora devuelve `password_hash`

---

## Instalación y Ejecución Local

### Requisitos
- Python 3.12+
- Node.js 20+

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
python seed.py          # Poblar BD con datos iniciales
uvicorn main:app --reload --port 8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker Compose
```bash
docker-compose up
```

---

## Variables de Entorno

### Backend (`.env`)
```
DATABASE_URL=sqlite:///./data/plataforma.db
JWT_SECRET=supersecreto
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:8080/api
```
