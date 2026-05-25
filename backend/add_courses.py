"""Script para agregar los cursos Regresión Lineal y Algoritmo Genético"""
from database import SessionLocal
from models import Curso, Leccion

def add_courses():
    db = SessionLocal()
    existing = db.query(Curso).filter(Curso.nombre.in_(["Regresión Lineal", "Algoritmo Genético"])).count()
    if existing > 0:
        print("Los cursos ya existen en la base de datos")
        db.close()
        return

    cursos_data = [
        {
            "nombre": "Regresión Lineal",
            "categoria": "matematicas",
            "descripcion_corta": "Aprende el modelo fundamental de regresión lineal: teoría, implementación y aplicaciones prácticas con datos reales",
            "descripcion_larga": "Curso completo de Regresión Lineal donde aprenderás desde los fundamentos matemáticos hasta la implementación práctica con Python.",
            "duracion": "4 semanas",
            "nivel": "Principiante",
            "idioma": "Español",
            "cupo_maximo": 40,
            "imagen_emoji": "📈",
            "precio": 0.0,
            "estado": "publicado",
            "lecciones": [
                {
                    "titulo": "Explicación del Curso",
                    "contenido": "explicacion",
                    "orden": 1,
                    "duracion": "2 horas"
                },
                {
                    "titulo": "Ejemplos Interactivos",
                    "contenido": "ejemplos",
                    "orden": 2,
                    "duracion": "3 horas"
                },
                {
                    "titulo": "Demo - Regresión con CSV",
                    "contenido": "demo",
                    "orden": 3,
                    "duracion": "2 horas"
                },
                {
                    "titulo": "Examen Final",
                    "contenido": "examen",
                    "orden": 4,
                    "duracion": "1 hora"
                }
            ]
        },
        {
            "nombre": "Algoritmo Genético",
            "categoria": "matematicas",
            "descripcion_corta": "Domina los algoritmos evolutivos inspirados en la selección natural: optimización, crossover y mutación",
            "descripcion_larga": "Curso completo de Algoritmos Genéticos donde aprenderás desde los fundamentos biológicos hasta la implementación de sistemas evolutivos.",
            "duracion": "5 semanas",
            "nivel": "Intermedio",
            "idioma": "Español",
            "cupo_maximo": 35,
            "imagen_emoji": "🧬",
            "precio": 0.0,
            "estado": "publicado",
            "lecciones": [
                {
                    "titulo": "Explicación del Curso",
                    "contenido": "explicacion",
                    "orden": 1,
                    "duracion": "2 horas"
                },
                {
                    "titulo": "Ejemplos Interactivos",
                    "contenido": "ejemplos",
                    "orden": 2,
                    "duracion": "3 horas"
                },
                {
                    "titulo": "Demo - Evolución Simulada",
                    "contenido": "demo",
                    "orden": 3,
                    "duracion": "2 horas"
                },
                {
                    "titulo": "Examen Final",
                    "contenido": "examen",
                    "orden": 4,
                    "duracion": "1 hora"
                }
            ]
        }
    ]

    for cd in cursos_data:
        lecciones_list = cd.pop("lecciones")
        curso = Curso(**cd)
        db.add(curso)
        db.flush()
        for ld in lecciones_list:
            leccion = Leccion(**ld, curso_id=curso.id)
            db.add(leccion)
        db.flush()
        print(f"Curso '{curso.nombre}' creado con {len(lecciones_list)} lecciones")

    db.commit()
    db.close()
    print("Cursos agregados exitosamente")

if __name__ == "__main__":
    add_courses()
