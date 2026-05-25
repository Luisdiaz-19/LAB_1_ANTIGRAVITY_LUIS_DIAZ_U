from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db
from models import Inscripcion, Curso, ProgresoLeccion, Leccion, Certificado, Usuario
from sqlalchemy import func
import uuid

router = APIRouter()

@router.post("/inscribir/{curso_id}")
def inscribir(curso_id: int, usuario_id: int, db: Session = Depends(get_db)):
    existe = db.query(Inscripcion).filter(
        Inscripcion.usuario_id == usuario_id,
        Inscripcion.curso_id == curso_id
    ).first()
    if existe:
        return {"mensaje": "Ya tienes una solicitud para este curso", "estado": existe.estado}
    curso = db.query(Curso).filter(Curso.id == curso_id).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    if curso.inscritos_count >= curso.cupo_maximo:
        raise HTTPException(status_code=400, detail="El curso ha alcanzado su cupo máximo")
    inscripcion = Inscripcion(usuario_id=usuario_id, curso_id=curso_id, estado="en_espera")
    db.add(inscripcion)
    db.commit()
    return {"mensaje": "Solicitud enviada. Espera la aprobación del administrador.", "estado": "en_espera"}

@router.get("/mis-cursos/{usuario_id}")
def mis_cursos(usuario_id: int, db: Session = Depends(get_db)):
    inscripciones = db.query(Inscripcion).filter(Inscripcion.usuario_id == usuario_id).all()
    result = []
    for ins in inscripciones:
        curso = db.query(Curso).filter(Curso.id == ins.curso_id).first()
        lecciones_totales = db.query(Leccion).filter(Leccion.curso_id == ins.curso_id).count()
        result.append({
            "id": ins.id,
            "curso_id": ins.curso_id,
            "usuario_id": ins.usuario_id,
            "estado": ins.estado,
            "progreso": ins.progreso,
            "creado_en": ins.creado_en,
            "curso_nombre": curso.nombre if curso else "Desconocido",
            "curso_emoji": curso.imagen_emoji if curso else "📚",
            "curso_nivel": curso.nivel if curso else "",
            "curso_duracion": curso.duracion if curso else "",
            "lecciones_totales": lecciones_totales,
            "inscritos_count": curso.inscritos_count if curso else 0
        })
    return result

@router.get("/progreso/{usuario_id}/{curso_id}")
def obtener_progreso(usuario_id: int, curso_id: int, db: Session = Depends(get_db)):
    inscripcion = db.query(Inscripcion).filter(
        Inscripcion.usuario_id == usuario_id,
        Inscripcion.curso_id == curso_id
    ).first()
    if not inscripcion:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    lecciones = db.query(Leccion).filter(Leccion.curso_id == curso_id).order_by(Leccion.orden).all()
    progresos = db.query(ProgresoLeccion).filter(
        ProgresoLeccion.usuario_id == usuario_id,
        ProgresoLeccion.leccion_id.in_([l.id for l in lecciones])
    ).all()
    lecciones_completadas = [p.leccion_id for p in progresos if p.completado]
    return {
        "inscripcion_id": inscripcion.id,
        "estado": inscripcion.estado,
        "progreso_total": inscripcion.progreso,
        "lecciones_totales": len(lecciones),
        "lecciones_completadas": len(lecciones_completadas),
        "lecciones": [{
            "id": l.id,
            "titulo": l.titulo,
            "orden": l.orden,
            "duracion": l.duracion,
            "completada": l.id in lecciones_completadas
        } for l in lecciones]
    }

@router.post("/progreso/{usuario_id}/{curso_id}")
def actualizar_progreso(usuario_id: int, curso_id: int, data: dict, db: Session = Depends(get_db)):
    leccion_id = data.get("leccion_id")
    completado = data.get("completado", True)
    inscripcion = db.query(Inscripcion).filter(
        Inscripcion.usuario_id == usuario_id,
        Inscripcion.curso_id == curso_id
    ).first()
    if not inscripcion:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    progreso = db.query(ProgresoLeccion).filter(
        ProgresoLeccion.usuario_id == usuario_id,
        ProgresoLeccion.leccion_id == leccion_id
    ).first()
    if completado:
        if not progreso:
            progreso = ProgresoLeccion(usuario_id=usuario_id, leccion_id=leccion_id, completado=True)
            db.add(progreso)
        else:
            progreso.completado = True
    lecciones_totales = db.query(Leccion).filter(Leccion.curso_id == curso_id).count()
    lecciones_ok = db.query(ProgresoLeccion).filter(
        ProgresoLeccion.usuario_id == usuario_id,
        ProgresoLeccion.completado == True,
        ProgresoLeccion.leccion_id.in_(
            db.query(Leccion.id).filter(Leccion.curso_id == curso_id)
        )
    ).count()
    progreso_pct = int((lecciones_ok / lecciones_totales) * 100) if lecciones_totales > 0 else 0
    inscripcion.progreso = progreso_pct
    db.commit()
    return {
        "progreso": progreso_pct,
        "lecciones_completadas": lecciones_ok,
        "lecciones_totales": lecciones_totales
    }

@router.post("/completar/{usuario_id}/{curso_id}")
def completar_curso(usuario_id: int, curso_id: int, db: Session = Depends(get_db)):
    inscripcion = db.query(Inscripcion).filter(
        Inscripcion.usuario_id == usuario_id,
        Inscripcion.curso_id == curso_id
    ).first()
    if not inscripcion:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    certificado_existente = db.query(Certificado).filter(
        Certificado.usuario_id == usuario_id,
        Certificado.curso_id == curso_id
    ).first()
    if certificado_existente:
        return {"mensaje": "Ya tienes un certificado para este curso", "codigo": certificado_existente.codigo}
    codigo = f"CERT-{uuid.uuid4().hex[:8].upper()}-{curso_id}-{usuario_id}"
    certificado = Certificado(
        usuario_id=usuario_id,
        curso_id=curso_id,
        codigo=codigo
    )
    db.add(certificado)
    inscripcion.progreso = 100
    db.commit()
    return {
        "mensaje": "¡Curso completado! Certificado generado.",
        "codigo": codigo,
        "certificado_id": certificado.id
    }

@router.get("/certificados/{usuario_id}")
def mis_certificados(usuario_id: int, db: Session = Depends(get_db)):
    certificados = db.query(Certificado).filter(Certificado.usuario_id == usuario_id).all()
    result = []
    for cert in certificados:
        curso = db.query(Curso).filter(Curso.id == cert.curso_id).first()
        result.append({
            "id": cert.id,
            "curso_id": cert.curso_id,
            "curso_nombre": curso.nombre if curso else "Desconocido",
            "curso_emoji": curso.imagen_emoji if curso else "📜",
            "codigo": cert.codigo,
            "emitido_en": cert.emitido_en
        })
    return result
