from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine, SessionLocal
import models
from seed import seed_data

from auth.router import router as auth_router
from routes.cursos import router as cursos_router
from routes.estudiantes import router as estudiantes_router
from routes.solicitudes import router as solicitudes_router
from routes.docentes import router as docentes_router
from routes.moderadores import router as moderadores_router
from routes.notificaciones import router as notificaciones_router

app = FastAPI(title="AI Academy - Plataforma de Cursos IA")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()

app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(cursos_router, prefix="/api/cursos", tags=["Cursos"])
app.include_router(estudiantes_router, prefix="/api/estudiantes", tags=["Estudiantes"])
app.include_router(solicitudes_router, prefix="/api/solicitudes", tags=["Solicitudes"])
app.include_router(docentes_router, prefix="/api/docentes", tags=["Docentes"])
app.include_router(moderadores_router, prefix="/api/moderadores", tags=["Moderadores"])
app.include_router(notificaciones_router, prefix="/api/notificaciones", tags=["Notificaciones"])

@app.get("/")
def root():
    return {"message": "🚀 AI Academy API funcionando correctamente"}

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
