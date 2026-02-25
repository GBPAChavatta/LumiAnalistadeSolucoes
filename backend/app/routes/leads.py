"""Rotas para gerenciamento de leads (PostgreSQL ou CSV)."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import csv
import uuid
from datetime import datetime
from pathlib import Path

from app.config import settings

router = APIRouter(prefix="/api/leads", tags=["leads"])


class LeadCreate(BaseModel):
    nome: str
    email: str
    telefone: str
    empresa: str


# --- CSV (fallback quando DATABASE_URL não está definido) ---
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)
LEADS_CSV = DATA_DIR / "leads.csv"


def _ensure_csv_headers() -> None:
    if not LEADS_CSV.exists():
        with open(LEADS_CSV, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(["id", "timestamp", "nome", "email", "telefone", "empresa"])
    else:
        try:
            with open(LEADS_CSV, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                if reader.fieldnames and "id" not in reader.fieldnames:
                    rows = list(reader)
                    with open(LEADS_CSV, "w", newline="", encoding="utf-8") as w:
                        writer = csv.writer(w)
                        writer.writerow(["id", "timestamp", "nome", "email", "telefone", "empresa"])
                        for i, row in enumerate(rows, start=1):
                            writer.writerow([
                                f"legacy_{i}",
                                row.get("timestamp", ""),
                                row.get("nome", ""),
                                row.get("email", ""),
                                row.get("telefone", ""),
                                row.get("empresa", ""),
                            ])
        except Exception as e:
            print(f"[Leads] Erro ao verificar CSV: {e}")
            with open(LEADS_CSV, "w", newline="", encoding="utf-8") as f:
                csv.writer(f).writerow(["id", "timestamp", "nome", "email", "telefone", "empresa"])


async def _register_lead_postgres(lead: LeadCreate) -> dict:
    from app.database import get_pool
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
    return {"lead_id": str(lead_id)}


async def _list_leads_postgres() -> list:
    from app.database import get_pool
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, created_at, nome, email, telefone, empresa FROM leads ORDER BY created_at DESC"
        )
    return [
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


@router.post("/register")
async def register_lead(lead: LeadCreate):
    """Registra um novo lead (PostgreSQL se DATABASE_URL definido, senão CSV)."""
    try:
        if settings.database_url:
            result = await _register_lead_postgres(lead)
            return {
                "success": True,
                "message": "Lead registrado com sucesso",
                "lead_id": result["lead_id"],
            }
        _ensure_csv_headers()
        lead_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        with open(LEADS_CSV, "a", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow([
                lead_id,
                timestamp,
                lead.nome,
                lead.email,
                lead.telefone,
                lead.empresa,
            ])
        return {
            "success": True,
            "message": "Lead registrado com sucesso",
            "lead_id": lead_id,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao registrar lead: {str(e)}")


@router.get("/list")
async def list_leads():
    """Lista todos os leads (PostgreSQL ou CSV)."""
    try:
        if settings.database_url:
            leads = await _list_leads_postgres()
            return {"leads": leads}
        if not LEADS_CSV.exists():
            return {"leads": []}
        with open(LEADS_CSV, "r", encoding="utf-8") as f:
            leads = list(csv.DictReader(f))
        return {"leads": leads}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar leads: {str(e)}")
