"""Conexão PostgreSQL (Supabase) para persistência de leads."""
from typing import Optional
import asyncpg
from app.config import settings

_pool: Optional[asyncpg.Pool] = None


async def get_pool() -> asyncpg.Pool:
    """Retorna o pool de conexões. Cria e inicializa a tabela se necessário."""
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            settings.database_url,
            min_size=1,
            max_size=5,
            command_timeout=60,
        )
        await _init_leads_table()
    return _pool


async def _init_leads_table() -> None:
    """Cria a tabela leads se não existir."""
    pool = _pool
    if not pool:
        return
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                nome TEXT NOT NULL,
                email TEXT NOT NULL,
                telefone TEXT NOT NULL,
                empresa TEXT NOT NULL
            )
        """)


async def close_pool() -> None:
    """Fecha o pool de conexões."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
