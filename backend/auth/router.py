from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import bcrypt as _bcrypt
from dependencies import get_db
from models import Usuario
from schemas import UsuarioCreate, LoginSchema, AdminUserCreate
from .jwt import create_access_token

router = APIRouter()

def hash_password(password: str) -> str:
    return _bcrypt.hashpw(password.encode(), _bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return _bcrypt.checkpw(password.encode(), hashed.encode())

@router.post("/registro")
def registro(data: UsuarioCreate, db: Session = Depends(get_db)):
    existe = db.query(Usuario).filter(Usuario.correo == data.correo).first()
    if existe:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    usuario = Usuario(
        nombre=data.nombre,
        apellido=data.apellido,
        correo=data.correo,
        password_hash=hash_password(data.password),
        rol="student"
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    token = create_access_token({"sub": str(usuario.id), "rol": usuario.rol})
    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "correo": usuario.correo,
            "rol": usuario.rol,
            "estado": usuario.estado
        }
    }

@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.correo == data.correo).first()
    if not usuario or not verify_password(data.password, usuario.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    if usuario.estado != "activo":
        raise HTTPException(status_code=403, detail="Tu cuenta está inactiva. Contacta al administrador.")
    token = create_access_token({"sub": str(usuario.id), "rol": usuario.rol})
    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "correo": usuario.correo,
            "rol": usuario.rol,
            "estado": usuario.estado
        }
    }

@router.get("/usuarios")
def listar_usuarios(db: Session = Depends(get_db)):
    usuarios = db.query(Usuario).all()
    return [{
        "id": u.id,
        "nombre": u.nombre,
        "apellido": u.apellido,
        "correo": u.correo,
        "password_hash": u.password_hash,
        "rol": u.rol,
        "estado": u.estado
    } for u in usuarios]

@router.post("/usuarios")
def crear_usuario_admin(data: AdminUserCreate, db: Session = Depends(get_db)):
    existe = db.query(Usuario).filter(Usuario.correo == data.correo).first()
    if existe:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    if data.rol not in ["admin", "student", "docente", "moderador"]:
        raise HTTPException(status_code=400, detail="Rol inválido")
    usuario = Usuario(
        nombre=data.nombre,
        apellido=data.apellido,
        correo=data.correo,
        password_hash=hash_password(data.password),
        rol=data.rol,
        estado="activo"
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "correo": usuario.correo,
        "password_hash": usuario.password_hash,
        "rol": usuario.rol,
        "estado": usuario.estado
    }

@router.put("/usuarios/{usuario_id}/rol")
def cambiar_rol(usuario_id: int, rol: str, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if rol not in ["admin", "student", "docente", "moderador"]:
        raise HTTPException(status_code=400, detail="Rol inválido")
    usuario.rol = rol
    db.commit()
    return {"mensaje": f"Rol actualizado a {rol}"}

@router.put("/usuarios/{usuario_id}/estado")
def cambiar_estado(usuario_id: int, estado: str, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if estado not in ["activo", "inactivo"]:
        raise HTTPException(status_code=400, detail="Estado inválido")
    usuario.estado = estado
    db.commit()
    return {"mensaje": f"Estado actualizado a {estado}"}
