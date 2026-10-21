-- Reconciliação idempotente do esquema PostgreSQL inicial (evita falha quando
-- 20260729000000_correcoes_livros já criou os tipos e tabelas base).
SELECT 1;
