from sqlalchemy.orm import Session
from models import Curso, Usuario, Leccion
import bcrypt as _bcrypt

def hash_password(password: str) -> str:
    return _bcrypt.hashpw(password.encode(), _bcrypt.gensalt()).decode()

def seed_data(db: Session):
    usuarios_existentes = db.query(Usuario).count()
    cursos_existentes = db.query(Curso).count()

    if usuarios_existentes == 0:
        usuarios = [
            Usuario(nombre="Admin", apellido="Principal", correo="admin@aiacademy.com",
                    password_hash=hash_password("admin123"), rol="admin", estado="activo"),
            Usuario(nombre="Carlos", apellido="Méndez", correo="carlos@aiacademy.com",
                    password_hash=hash_password("docente123"), rol="docente", estado="activo"),
            Usuario(nombre="Laura", apellido="García", correo="laura@aiacademy.com",
                    password_hash=hash_password("moderador123"), rol="moderador", estado="activo"),
            Usuario(nombre="Estudiante", apellido="Demo", correo="estudiante@aiacademy.com",
                    password_hash=hash_password("estudiante123"), rol="student", estado="activo"),
        ]
        db.add_all(usuarios)
        db.flush()

    if cursos_existentes == 0:
        cursos = [
            Curso(nombre="Machine Learning Fundamentals", categoria="tecnologia",
                  descripcion_corta="Aprende los fundamentos del ML con Python y scikit-learn",
                  descripcion_larga="Curso completo de Machine Learning donde aprenderás desde los conceptos básicos hasta algoritmos avanzados. Incluye regresión, clasificación, clustering y más.",
                  duracion="8 semanas", nivel="Intermedio", idioma="Español",
                  cupo_maximo=30, imagen_emoji="🤖", precio=49.99, docente_id=2),
            Curso(nombre="Deep Learning con TensorFlow", categoria="tecnologia",
                  descripcion_corta="Redes neuronales, CNN y RNN aplicadas a problemas reales",
                  descripcion_larga="Domina el Deep Learning con TensorFlow y Keras. Aprende a construir y entrenar redes neuronales convolucionales y recurrentes.",
                  duracion="10 semanas", nivel="Avanzado", idioma="Español",
                  cupo_maximo=25, imagen_emoji="🧠", precio=79.99, docente_id=2),
            Curso(nombre="IA Generativa con ChatGPT", categoria="tecnologia",
                  descripcion_corta="Prompt engineering, fine-tuning y aplicaciones con GPT",
                  descripcion_larga="Explora el mundo de la IA Generativa. Aprende prompt engineering, fine-tuning de modelos y construcción de aplicaciones con APIs de GPT.",
                  duracion="6 semanas", nivel="Principiante", idioma="Español",
                  cupo_maximo=40, imagen_emoji="✨", precio=29.99),
            Curso(nombre="Visión por Computadora", categoria="tecnologia",
                  descripcion_corta="OpenCV, YOLO y modelos de detección de objetos",
                  descripcion_larga="Aprende Visión por Computadora desde cero. OpenCV, detección de objetos con YOLO, segmentación y más.",
                  duracion="12 semanas", nivel="Avanzado", idioma="Español",
                  cupo_maximo=20, imagen_emoji="👁️", precio=89.99, docente_id=2),
            Curso(nombre="NLP y Procesamiento de Lenguaje", categoria="tecnologia",
                  descripcion_corta="Transformers, BERT y modelos de lenguaje naturales",
                  descripcion_larga="Domina el Procesamiento de Lenguaje Natural con Transformers, BERT, GPT y más. Proyectos prácticos incluidos.",
                  duracion="8 semanas", nivel="Intermedio", idioma="Español",
                  cupo_maximo=30, imagen_emoji="💬", precio=59.99),
            Curso(nombre="Ética en Inteligencia Artificial", categoria="diseño",
                  descripcion_corta="Bias, fairness y regulación de sistemas de IA",
                  descripcion_larga="Comprende los aspectos éticos de la IA: sesgos algorítmicos, fairness, transparencia y regulación global.",
                  duracion="4 semanas", nivel="Principiante", idioma="Español",
                  cupo_maximo=50, imagen_emoji="⚖️", precio=19.99),
            Curso(nombre="MLOps: Despliegue de Modelos", categoria="tecnologia",
                  descripcion_corta="CI/CD, Docker, Kubernetes y monitoreo de modelos ML",
                  descripcion_larga="Aprende a desplegar modelos de Machine Learning en producción con MLOps. Docker, Kubernetes, CI/CD y monitoreo.",
                  duracion="10 semanas", nivel="Avanzado", idioma="Español",
                  cupo_maximo=20, imagen_emoji="🚀", precio=69.99, docente_id=2),
            Curso(nombre="Fundamentos de Python para IA", categoria="tecnologia",
                  descripcion_corta="Python, NumPy, Pandas y Matplotlib para ciencia de datos",
                  descripcion_larga="Curso introductorio a Python para Inteligencia Artificial. Cubre NumPy, Pandas, Matplotlib y fundamentos de programación.",
                  duracion="6 semanas", nivel="Principiante", idioma="Español",
                  cupo_maximo=50, imagen_emoji="🐍", precio=19.99),
        ]
        db.add_all(cursos)
        db.flush()

        lecciones_ml = [
            Leccion(curso_id=cursos[0].id, titulo="Introducción al Machine Learning", orden=1, duracion="45 min"),
            Leccion(curso_id=cursos[0].id, titulo="Regresión Lineal", orden=2, duracion="60 min"),
            Leccion(curso_id=cursos[0].id, titulo="Regresión Logística", orden=3, duracion="55 min"),
            Leccion(curso_id=cursos[0].id, titulo="Árboles de Decisión", orden=4, duracion="50 min"),
            Leccion(curso_id=cursos[0].id, titulo="SVM y KNN", orden=5, duracion="60 min"),
            Leccion(curso_id=cursos[0].id, titulo="Clustering con K-Means", orden=6, duracion="45 min"),
            Leccion(curso_id=cursos[0].id, titulo="Evaluación de Modelos", orden=7, duracion="50 min"),
            Leccion(curso_id=cursos[0].id, titulo="Proyecto Final", orden=8, duracion="120 min"),
        ]
        db.add_all(lecciones_ml)

        lecciones_dl = [
            Leccion(curso_id=cursos[1].id, titulo="Fundamentos de Redes Neuronales", orden=1, duracion="60 min"),
            Leccion(curso_id=cursos[1].id, titulo="TensorFlow y Keras", orden=2, duracion="55 min"),
            Leccion(curso_id=cursos[1].id, titulo="Redes Convolucionales (CNN)", orden=3, duracion="70 min"),
            Leccion(curso_id=cursos[1].id, titulo="Redes Recurrentes (RNN)", orden=4, duracion="65 min"),
            Leccion(curso_id=cursos[1].id, titulo="Transfer Learning", orden=5, duracion="50 min"),
            Leccion(curso_id=cursos[1].id, titulo="Proyecto Final", orden=6, duracion="120 min"),
        ]
        db.add_all(lecciones_dl)

    db.commit()
