# Política RLS para tabela `leads` no Supabase

> **Criar a tabela**: se a tabela `leads` ainda não existir, use o SQL em [SUPABASE_RLS.md](SUPABASE_RLS.md).

## Erro

```
new row violates row-level security policy for table "leads"
```

Esse erro ocorre quando o frontend tenta inserir um lead diretamente no Supabase e a política RLS bloqueia o `INSERT`.

## Solução

Execute o SQL abaixo no **SQL Editor** do seu projeto Supabase (Dashboard → SQL Editor):

```sql
-- Permite INSERT para qualquer usuário (incluindo anon) na tabela leads
-- Use apenas se o formulário de leads for público
CREATE POLICY "Permitir insert de leads público"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);

-- Opcional: restringe SELECT apenas a usuários autenticados (admin)
-- Se quiser que só admins vejam os leads:
-- CREATE POLICY "Apenas autenticados podem ler leads"
-- ON public.leads
-- FOR SELECT
-- TO authenticated
-- USING (true);
```

## Alternativa: usar o backend

Se preferir não expor o Supabase diretamente no frontend:

1. No `.env.local`, **remova** ou comente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`)

2. Garanta que o backend está rodando e que `NEXT_PUBLIC_API_URL` aponta para ele (ex: `http://localhost:8000`)

3. O backend usará o endpoint `/api/leads/register` e salvará em CSV ou no Supabase via service role (se configurado)

Com isso, `USE_SUPABASE_LEADS` ficará `false` e o fluxo usará o backend.
