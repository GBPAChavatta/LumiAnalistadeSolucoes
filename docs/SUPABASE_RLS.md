# Política RLS para tabela `leads` (Supabase)

Para que o frontend consiga inserir leads diretamente no Supabase, é necessário criar uma política RLS que permita INSERT para usuários anônimos.

Execute no **SQL Editor** do Supabase:

```sql
-- Permite INSERT anônimo na tabela leads
CREATE POLICY "Allow anonymous insert on leads"
ON leads FOR INSERT
TO anon
WITH CHECK (true);
```

Se a tabela `leads` ainda não existir, crie-a primeiro:

```sql
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    empresa TEXT NOT NULL
);

-- Habilitar RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Política para INSERT
CREATE POLICY "Allow anonymous insert on leads"
ON leads FOR INSERT
TO anon
WITH CHECK (true);
```
