from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from dependencies import get_db
from models import Curso, Leccion

router = APIRouter()

@router.get("/contenido-pendiente")
def contenido_pendiente(db: Session = Depends(get_db)):
    cursos = db.query(Curso).filter(Curso.estado == "borrador").all()
    result = []
    for c in cursos:
        lecciones_count = db.query(Leccion).filter(Leccion.curso_id == c.id).count()
        result.append({
            "id": c.id,
            "nombre": c.nombre,
            "descripcion_corta": c.descripcion_corta,
            "imagen_emoji": c.imagen_emoji,
            "lecciones_count": lecciones_count,
            "estado": c.estado
        })
    return result

@router.put("/cursos/{curso_id}/estado")
def cambiar_estado_curso(curso_id: int, data: dict, db: Session = Depends(get_db)):
    curso = db.query(Curso).filter(Curso.id == curso_id).first()
    if not curso:
        return {"mensaje": "Curso no encontrado"}
    nuevo_estado = data.get("estado", "publicado")
    curso.estado = nuevo_estado
    db.commit()
    return {"mensaje": f"Curso {nuevo_estado} correctamente"}
