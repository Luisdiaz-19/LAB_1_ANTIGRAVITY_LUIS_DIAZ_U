from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db
from models import Curso, Leccion

router = APIRouter()

@router.get("/")
def listar_cursos(db: Session = Depends(get_db)):
    cursos = db.query(Curso).all()
    result = []
    for c in cursos:
        lecciones_count = db.query(Leccion).filter(Leccion.curso_id == c.id).count()
        result.append({
            "id": c.id,
            "nombre": c.nombre,
            "categoria": c.categoria,
            "descripcion_corta": c.descripcion_corta,
            "descripcion_larga": c.descripcion_larga,
            "duracion": c.duracion,
            "nivel": c.nivel,
            "idioma": c.idioma,
            "cupo_maximo": c.cupo_maximo,
            "inscritos_count": c.inscritos_count,
            "estado": c.estado,
            "imagen_emoji": c.imagen_emoji,
            "docente_id": c.docente_id,
            "precio": c.precio,
            "lecciones_count": lecciones_count
        })
    return result

@router.get("/{curso_id}")
def obtener_curso(curso_id: int, db: Session = Depends(get_db)):
    curso = db.query(Curso).filter(Curso.id == curso_id).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    lecciones = db.query(Leccion).filter(Leccion.curso_id == curso_id).order_by(Leccion.orden).all()
    return {
        "id": curso.id,
        "nombre": curso.nombre,
        "categoria": curso.categoria,
        "descripcion_corta": curso.descripcion_corta,
        "descripcion_larga": curso.descripcion_larga,
        "duracion": curso.duracion,
        "nivel": curso.nivel,
        "idioma": curso.idioma,
        "cupo_maximo": curso.cupo_maximo,
        "inscritos_count": curso.inscritos_count,
        "estado": curso.estado,
        "imagen_emoji": curso.imagen_emoji,
        "docente_id": curso.docente_id,
        "precio": curso.precio,
        "lecciones": [{
            "id": l.id,
            "titulo": l.titulo,
            "contenido": l.contenido,
            "orden": l.orden,
            "duracion": l.duracion
        } for l in lecciones]
    }

@router.post("/")
def crear_curso(data: dict, db: Session = Depends(get_db)):
    curso = Curso(
        nombre=data["nombre"],
        categoria=data.get("categoria", "tecnologia"),
        descripcion_corta=data.get("descripcion_corta", ""),
        descripcion_larga=data.get("descripcion_larga", ""),
        duracion=data.get("duracion", ""),
        nivel=data.get("nivel", "Principiante"),
        idioma=data.get("idioma", "Español"),
        cupo_maximo=data.get("cupo_maximo", 30),
        precio=data.get("precio", 0.0),
        imagen_emoji=data.get("imagen_emoji", "📚"),
        docente_id=data.get("docente_id"),
        estado="borrador"
    )
    db.add(curso)
    db.commit()
    db.refresh(curso)
    return curso

@router.put("/{curso_id}")
def actualizar_curso(curso_id: int, data: dict, db: Session = Depends(get_db)):
    curso = db.query(Curso).filter(Curso.id == curso_id).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    for key, value in data.items():
        if hasattr(curso, key):
            setattr(curso, key, value)
    db.commit()
    return curso

@router.delete("/{curso_id}")
def eliminar_curso(curso_id: int, db: Session = Depends(get_db)):
    curso = db.query(Curso).filter(Curso.id == curso_id).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    db.delete(curso)
    db.commit()
    return {"mensaje": "Curso eliminado"}
