from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db
from models import Curso, Leccion

router = APIRouter()

@router.get("/{docente_id}/cursos")
def mis_cursos_docente(docente_id: int, db: Session = Depends(get_db)):
    cursos = db.query(Curso).filter(Curso.docente_id == docente_id).all()
    result = []
    for c in cursos:
        lecciones_count = db.query(Leccion).filter(Leccion.curso_id == c.id).count()
        result.append({
            "id": c.id,
            "nombre": c.nombre,
            "descripcion_corta": c.descripcion_corta,
            "estado": c.estado,
            "imagen_emoji": c.imagen_emoji,
            "lecciones_count": lecciones_count,
            "inscritos_count": c.inscritos_count,
            "nivel": c.nivel
        })
    return result

@router.post("/lecciones")
def crear_leccion(data: dict, db: Session = Depends(get_db)):
    leccion = Leccion(
        curso_id=data["curso_id"],
        titulo=data["titulo"],
        contenido=data.get("contenido", ""),
        video_url=data.get("video_url", ""),
        orden=data.get("orden", 0),
        duracion=data.get("duracion", "")
    )
    db.add(leccion)
    db.commit()
    db.refresh(leccion)
    return leccion

@router.put("/lecciones/{leccion_id}")
def actualizar_leccion(leccion_id: int, data: dict, db: Session = Depends(get_db)):
    leccion = db.query(Leccion).filter(Leccion.id == leccion_id).first()
    if not leccion:
        raise HTTPException(status_code=404, detail="Lección no encontrada")
    for key, value in data.items():
        if hasattr(leccion, key):
            setattr(leccion, key, value)
    db.commit()
    return leccion

@router.delete("/lecciones/{leccion_id}")
def eliminar_leccion(leccion_id: int, db: Session = Depends(get_db)):
    leccion = db.query(Leccion).filter(Leccion.id == leccion_id).first()
    if not leccion:
        raise HTTPException(status_code=404, detail="Lección no encontrada")
    db.delete(leccion)
    db.commit()
    return {"mensaje": "Lección eliminada"}

@router.get("/lecciones/{curso_id}")
def lecciones_por_curso(curso_id: int, db: Session = Depends(get_db)):
    lecciones = db.query(Leccion).filter(Leccion.curso_id == curso_id).order_by(Leccion.orden).all()
    return [{
        "id": l.id,
        "curso_id": l.curso_id,
        "titulo": l.titulo,
        "contenido": l.contenido,
        "video_url": l.video_url,
        "orden": l.orden,
        "duracion": l.duracion
    } for l in lecciones]
