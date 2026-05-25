from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from dependencies import get_db
from models import Notificacion

router = APIRouter()

@router.get("/{usuario_id}")
def listar_notificaciones(usuario_id: int, db: Session = Depends(get_db)):
    notificaciones = db.query(Notificacion).filter(
        Notificacion.usuario_id == usuario_id
    ).order_by(Notificacion.creado_en.desc()).limit(50).all()
    return [{
        "id": n.id,
        "titulo": n.titulo,
        "mensaje": n.mensaje,
        "leida": n.leida,
        "creado_en": n.creado_en
    } for n in notificaciones]

@router.put("/{notificacion_id}/leer")
def marcar_leida(notificacion_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notificacion).filter(Notificacion.id == notificacion_id).first()
    if notif:
        notif.leida = True
        db.commit()
    return {"mensaje": "Notificación marcada como leída"}

@router.get("/{usuario_id}/no-leidas")
def no_leidas_count(usuario_id: int, db: Session = Depends(get_db)):
    count = db.query(Notificacion).filter(
        Notificacion.usuario_id == usuario_id,
        Notificacion.leida == False
    ).count()
    return {"count": count}
