from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.sql import func
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    correo = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=True)
    rol = Column(String, default="student")
    estado = Column(String, default="activo")
    auth_provider = Column(String, default="local")
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

class Curso(Base):
    __tablename__ = "cursos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    categoria = Column(String)
    descripcion_corta = Column(Text)
    descripcion_larga = Column(Text)
    duracion = Column(String)
    nivel = Column(String)
    idioma = Column(String, default="Español")
    cupo_maximo = Column(Integer, default=30)
    inscritos_count = Column(Integer, default=0)
    estado = Column(String, default="borrador")
    imagen_emoji = Column(String, default="📚")
    docente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    precio = Column(Float, default=0.0)

class Leccion(Base):
    __tablename__ = "lecciones"

    id = Column(Integer, primary_key=True, index=True)
    curso_id = Column(Integer, ForeignKey("cursos.id"), nullable=False)
    titulo = Column(String, nullable=False)
    contenido = Column(Text)
    video_url = Column(String, nullable=True)
    orden = Column(Integer, default=0)
    duracion = Column(String)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

class Inscripcion(Base):
    __tablename__ = "inscripciones"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    curso_id = Column(Integer, ForeignKey("cursos.id"), nullable=False)
    estado = Column(String, default="en_espera")
    progreso = Column(Integer, default=0)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

class ProgresoLeccion(Base):
    __tablename__ = "progreso_lecciones"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    leccion_id = Column(Integer, ForeignKey("lecciones.id"), nullable=False)
    completado = Column(Boolean, default=False)
    completado_en = Column(DateTime(timezone=True), nullable=True)

class Certificado(Base):
    __tablename__ = "certificados"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    curso_id = Column(Integer, ForeignKey("cursos.id"), nullable=False)
    codigo = Column(String, unique=True, nullable=False)
    emitido_en = Column(DateTime(timezone=True), server_default=func.now())
    url_pdf = Column(String, nullable=True)

class Notificacion(Base):
    __tablename__ = "notificaciones"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    titulo = Column(String, nullable=False)
    mensaje = Column(Text)
    leida = Column(Boolean, default=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
