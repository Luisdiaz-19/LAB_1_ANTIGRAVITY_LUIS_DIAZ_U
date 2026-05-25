from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from dependencies import get_db
from models import Inscripcion, Curso, Usuario, Notificacion
from auth.email_service import enviar_bienvenida_credenciales, enviar_rechazo
import bcrypt as _bcrypt
import secrets
import string

router = APIRouter()

def generar_password():
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(10))

@router.get("/")
def listar_solicitudes(db: Session = Depends(get_db)):
    solicitudes = db.query(Inscripcion).filter(
        Inscripcion.estado.in_(["en_espera", "pendiente"])
    ).all()
    result = []
    for s in solicitudes:
        usuario = db.query(Usuario).filter(Usuario.id == s.usuario_id).first()
        curso = db.query(Curso).filter(Curso.id == s.curso_id).first()
        result.append({
            "id": s.id,
            "usuario_id": s.usuario_id,
            "curso_id": s.curso_id,
            "estado": s.estado,
            "creado_en": s.creado_en,
            "usuario_nombre": f"{usuario.nombre} {usuario.apellido}" if usuario else "Desconocido",
            "usuario_correo": usuario.correo if usuario else "",
            "curso_nombre": curso.nombre if curso else "Desconocido",
            "curso_emoji": curso.imagen_emoji if curso else "📚"
        })
    return result

@router.get("/todas")
def listar_todas_inscripciones(db: Session = Depends(get_db)):
    inscripciones = db.query(Inscripcion).all()
    result = []
    for s in inscripciones:
        usuario = db.query(Usuario).filter(Usuario.id == s.usuario_id).first()
        curso = db.query(Curso).filter(Curso.id == s.curso_id).first()
        result.append({
            "id": s.id,
            "usuario_id": s.usuario_id,
            "curso_id": s.curso_id,
            "estado": s.estado,
            "progreso": s.progreso,
            "creado_en": s.creado_en,
            "usuario_nombre": f"{usuario.nombre} {usuario.apellido}" if usuario else "Desconocido",
            "usuario_correo": usuario.correo if usuario else "",
            "curso_nombre": curso.nombre if curso else "Desconocido",
            "curso_emoji": curso.imagen_emoji if curso else "📚"
        })
    return result

@router.put("/{inscripcion_id}/estado")
def actualizar_estado(inscripcion_id: int, data: dict, db: Session = Depends(get_db)):
    insc = db.query(Inscripcion).filter(Inscripcion.id == inscripcion_id).first()
    if not insc:
        return {"mensaje": "Inscripción no encontrada"}
    nuevo_estado = data.get("estado")
    if nuevo_estado not in ["aceptado", "rechazado", "en_espera"]:
        return {"mensaje": "Estado inválido. Use: aceptado, rechazado, en_espera"}
    insc.estado = nuevo_estado
    usuario = db.query(Usuario).filter(Usuario.id == insc.usuario_id).first()
    curso = db.query(Curso).filter(Curso.id == insc.curso_id).first()
    curso_nombre = curso.nombre if curso else "Curso"
    if nuevo_estado == "aceptado":
        if curso:
            curso.inscritos_count = (curso.inscritos_count or 0) + 1
        if usuario:
            password = generar_password()
            usuario.password_hash = _bcrypt.hashpw(password.encode(), _bcrypt.gensalt()).decode()
            usuario.estado = "activo"
            enviar_bienvenida_credenciales(
                usuario.correo, usuario.nombre, usuario.correo, password, curso_nombre
            )
            notif = Notificacion(
                usuario_id=usuario.id,
                titulo="✅ Inscripción Aprobada",
                mensaje=f"Has sido aceptado en el curso {curso_nombre}. Revisa tu correo para las credenciales."
            )
            db.add(notif)
    elif nuevo_estado == "rechazado":
        if usuario:
            enviar_rechazo(usuario.correo, usuario.nombre, curso_nombre)
            notif = Notificacion(
                usuario_id=usuario.id,
                titulo="❌ Inscripción Rechazada",
                mensaje=f"Tu solicitud para {curso_nombre} no fue aprobada."
            )
            db.add(notif)
    db.commit()
    return {"mensaje": f"Estado actualizado a {nuevo_estado}"}
