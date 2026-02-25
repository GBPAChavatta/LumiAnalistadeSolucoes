"""Rotas para gerenciamento de leads."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import csv
import os
import uuid
from datetime import datetime
from pathlib import Path

router = APIRouter(prefix="/api/leads", tags=["leads"])


class LeadCreate(BaseModel):
    nome: str
    email: str
    telefone: str
    empresa: str


# Garantir que o diretório data existe
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)
LEADS_CSV = DATA_DIR / "leads.csv"


def ensure_csv_headers():
    """Garante que o CSV tem os cabeçalhos corretos."""
    if not LEADS_CSV.exists():
        with open(LEADS_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["id", "timestamp", "nome", "email", "telefone", "empresa"])
    else:
        # Verificar se o arquivo existe mas não tem a coluna ID
        try:
            with open(LEADS_CSV, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                headers = reader.fieldnames
                if headers and "id" not in headers:
                    # Ler todas as linhas
                    rows = list(reader)
                    
                    # Reescrever com ID
                    with open(LEADS_CSV, "w", newline="", encoding="utf-8") as write_file:
                        writer = csv.writer(write_file)
                        # Escrever novo cabeçalho
                        writer.writerow(["id", "timestamp", "nome", "email", "telefone", "empresa"])
                        # Reescrever linhas existentes com ID gerado
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
            print(f"[Leads] Erro ao verificar/atualizar CSV: {e}")
            # Se houver erro, criar novo arquivo
            with open(LEADS_CSV, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(["id", "timestamp", "nome", "email", "telefone", "empresa"])


@router.post("/register")
async def register_lead(lead: LeadCreate):
    """
    Registra um novo lead no CSV.
    
    Referência: https://docs.python.org/3/library/csv.html
    """
    try:
        ensure_csv_headers()
        
        # Gerar ID único
        lead_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        # Adicionar linha ao CSV
        with open(LEADS_CSV, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
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
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao registrar lead: {str(e)}"
        )


@router.get("/list")
async def list_leads():
    """Lista todos os leads registrados."""
    try:
        if not LEADS_CSV.exists():
            return {"leads": []}
        
        leads = []
        with open(LEADS_CSV, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            leads = list(reader)
        
        return {"leads": leads}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao listar leads: {str(e)}"
        )
