"""Aplicação FastAPI principal."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import debug_logs, elevenlabs, leads, transcripts
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    if settings.database_url:
        try:
            from app.database import close_pool
            await close_pool()
        except Exception:
            pass


app = FastAPI(
    lifespan=lifespan,
    title="ElevenLabs AgentAI Backend",
    description="Backend para gerenciamento de tokens e signed URLs da ElevenLabs",
    version="1.0.0",
)

# Configurar CORS - DEVE ser o primeiro middleware adicionado
cors_origins = settings.cors_origins_list
print(f"[CORS] Configurando CORS com origens permitidas: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas as origens em desenvolvimento
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Registrar rotas
app.include_router(elevenlabs.router)
app.include_router(leads.router)
app.include_router(transcripts.router)
app.include_router(debug_logs.router)


@app.get("/")
async def root():
    """Endpoint raiz."""
    return {"message": "ElevenLabs AgentAI Backend API", "status": "running"}


@app.get("/health")
async def health():
    """Endpoint de health check."""
    return {"status": "healthy"}
