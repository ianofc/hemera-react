-- ============================================================
-- SCRIPT DE DIAGNÓSTICO: Schema completo do banco Hemera
-- Cole e execute no SQL Editor do Supabase
-- ============================================================

SELECT
  t.table_name                          AS tabela,
  c.column_name                         AS coluna,
  c.data_type                           AS tipo,
  c.is_nullable                         AS nullable,
  c.column_default                      AS default_valor,
  CASE WHEN pk.column_name IS NOT NULL THEN 'PK' ELSE '' END AS chave
FROM information_schema.tables t
JOIN information_schema.columns c
  ON c.table_schema = t.table_schema
  AND c.table_name  = t.table_name
LEFT JOIN (
  SELECT ku.table_name, ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku
    ON tc.constraint_name = ku.constraint_name
   AND tc.table_schema    = ku.table_schema
  WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
) pk ON pk.table_name = t.table_name AND pk.column_name = c.column_name
WHERE t.table_schema = 'public'
  AND t.table_type   = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;
