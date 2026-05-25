from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UsuarioCreate(BaseModel):
    nombre: str
    apellido: str
    correo: EmailStr
    password: str

class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    apellido: str
    correo: str
    rol: str
    estado: str

    class Config:
        from_attributes = True

class LoginSchema(BaseModel):
    correo: EmailStr
    password: str

class CursoCreate(BaseModel):
    nombre: str
    categoria: Optional[str] = "tecnologia"
    descripcion_corta: Optional[str] = ""
    descripcion_larga: Optional[str] = ""
    duracion: Optional[str] = ""
    nivel: Optional[str] = "Principiante"
    idioma: Optional[str] = "Español"
    cupo_maximo: Optional[int] = 30
    precio: Optional[float] = 0.0
    imagen_emoji: Optional[str] = "📚"

class LeccionCreate(BaseModel):
    curso_id: int
    titulo: str
    contenido: Optional[str] = ""
    video_url: Optional[str] = ""
    orden: Optional[int] = 0
    duracion: Optional[str] = ""

class InscripcionEstado(BaseModel):
    estado: str

class ProgresoUpdate(BaseModel):
    leccion_id: int
    completado: bool = True

class AdminUserCreate(BaseModel):
    nombre: str
    apellido: str
    correo: EmailStr
    password: str
    rol: str = "student"

class CertificadoResponse(BaseModel):
    id: int
    usuario_id: int
    curso_id: int
    codigo: str
    emitido_en: datetime
    url_pdf: Optional[str] = None

    class Config:
        from_attributes = True
