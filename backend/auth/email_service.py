import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "pagemyproyect@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "njdyrvclzloolyne")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)

def enviar_correo(destinatario: str, asunto: str, cuerpo_html: str):
    if not SMTP_USER or not SMTP_PASSWORD:
        try:
            print(f"[EMAIL SIMULADO] Para: {destinatario} | Asunto: {asunto}")
            print(f"[EMAIL SIMULADO] Cuerpo: {cuerpo_html[:100]}...")
        except UnicodeEncodeError:
            print("[EMAIL SIMULADO] (no se pudo imprimir el contenido por caracteres especiales)")
        return {"enviado": False, "modo": "simulado", "destinatario": destinatario}

    msg = MIMEMultipart("alternative")
    msg["From"] = FROM_EMAIL
    msg["To"] = destinatario
    msg["Subject"] = asunto
    msg.attach(MIMEText(cuerpo_html, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        print(f"[EMAIL ENVIADO] Para: {destinatario}")
        return {"enviado": True, "destinatario": destinatario}
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return {"enviado": False, "error": str(e)}

def enviar_bienvenida_credenciales(destinatario: str, nombre: str, correo: str, password: str, curso_nombre: str):
    asunto = f"✅ ¡Bienvenido a {curso_nombre} - AI Academy!"
    cuerpo = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; overflow: hidden; border: 1px solid rgba(56, 189, 248, 0.2);">
        <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); padding: 40px 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🤖</div>
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 ¡Felicidades, {nombre}!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin-top: 10px;">Has sido aceptado en <strong>{curso_nombre}</strong></p>
        </div>
        <div style="padding: 30px; color: #e2e8f0;">
            <p style="font-size: 16px; margin-bottom: 20px;">Tus credenciales de acceso son:</p>
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <p style="margin: 8px 0;"><strong>📧 Correo:</strong> {correo}</p>
                <p style="margin: 8px 0;"><strong>🔑 Contraseña:</strong> {password}</p>
            </div>
            <a href="{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/login" style="display: inline-block; background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: bold; font-size: 16px;">Iniciar Sesión</a>
            <p style="margin-top: 20px; font-size: 14px; color: #94a3b8;">Recomendamos cambiar tu contraseña después del primer inicio de sesión.</p>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 20px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
            <p style="color: #64748b; font-size: 12px; margin: 0;">© 2026 AI Academy · Plataforma de Cursos de Inteligencia Artificial</p>
        </div>
    </div>
    """
    return enviar_correo(destinatario, asunto, cuerpo)

def enviar_rechazo(destinatario: str, nombre: str, curso_nombre: str):
    asunto = f"📋 Actualización sobre tu solicitud - {curso_nombre}"
    cuerpo = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; overflow: hidden; border: 1px solid rgba(239, 68, 68, 0.2);">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 40px 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">📋</div>
            <h1 style="color: white; margin: 0; font-size: 28px;">Hola, {nombre}</h1>
        </div>
        <div style="padding: 30px; color: #e2e8f0;">
            <p style="font-size: 16px;">Lamentamos informarte que tu solicitud para el curso <strong>{curso_nombre}</strong> no ha sido aprobada en esta ocasión.</p>
            <p style="font-size: 14px; color: #94a3b8; margin-top: 20px;">Te invitamos a explorar otros cursos disponibles en nuestra plataforma.</p>
            <a href="{os.getenv('FRONTEND_URL', 'http://localhost:5173')}" style="display: inline-block; background: linear-gradient(135deg, #dc2626, #ef4444); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: bold; font-size: 16px; margin-top: 10px;">Ver Cursos</a>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 20px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
            <p style="color: #64748b; font-size: 12px; margin: 0;">© 2026 AI Academy</p>
        </div>
    </div>
    """
    return enviar_correo(destinatario, asunto, cuerpo)

def enviar_certificado(destinatario: str, nombre: str, curso_nombre: str, codigo: str):
    asunto = f"🎓 ¡Certificado emitido! - {curso_nombre}"
    cuerpo = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; overflow: hidden; border: 1px solid rgba(34, 197, 94, 0.2);">
        <div style="background: linear-gradient(135deg, #16a34a, #22c55e); padding: 40px 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🎓</div>
            <h1 style="color: white; margin: 0; font-size: 28px;">¡Felicidades, {nombre}!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin-top: 10px;">Has completado <strong>{curso_nombre}</strong></p>
        </div>
        <div style="padding: 30px; color: #e2e8f0; text-align: center;">
            <p style="font-size: 16px;">Tu certificado ha sido emitido exitosamente.</p>
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 12px; padding: 20px; margin: 20px 0; display: inline-block;">
                <p style="margin: 0; font-size: 14px; color: #94a3b8;">Código de verificación</p>
                <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #22c55e;">{codigo}</p>
            </div>
            <p style="font-size: 14px; color: #94a3b8;">Puedes descargar tu certificado desde tu panel de estudiante.</p>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 20px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
            <p style="color: #64748b; font-size: 12px; margin: 0;">© 2026 AI Academy</p>
        </div>
    </div>
    """
    return enviar_correo(destinatario, asunto, cuerpo)
