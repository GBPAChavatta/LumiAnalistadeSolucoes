"""Rotas para gerenciamento de leads (PostgreSQL/Supabase)."""
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.database import get_pool

router = APIRouter(prefix="/api/leads", tags=["leads"])


class LeadCreate(BaseModel):
    nome: str
    email: str
    telefone: str
    empresa: str


@router.post("/register")
async def register_lead(lead: LeadCreate):
    """Registra um novo lead no PostgreSQL (Supabase)."""
    try:
        pool = await get_pool()
        lead_id = uuid.uuid4()
        async with pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO leads (id, nome, email, telefone, empresa)
                VALUES ($1, $2, $3, $4, $5)
                """,
                lead_id,
                lead.nome,
                lead.email,
                lead.telefone,
                lead.empresa,
            )
        return {
            "success": True,
            "message": "Lead registrado com sucesso",
            "lead_id": str(lead_id),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao registrar lead: {str(e)}")


@router.get("/list")
async def list_leads():
    """Lista todos os leads do PostgreSQL."""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT id, created_at, nome, email, telefone, empresa FROM leads ORDER BY created_at DESC"
            )
        leads = [
            {
                "id": str(r["id"]),
                "timestamp": r["created_at"].isoformat() if r["created_at"] else "",
                "nome": r["nome"],
                "email": r["email"],
                "telefone": r["telefone"],
                "empresa": r["empresa"],
            }
            for r in rows
        ]
        return {"leads": leads}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar leads: {str(e)}")
