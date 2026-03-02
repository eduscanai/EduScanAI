-- ============================================
-- EduScanAI - Fix JWT helpers: fallback para auth.users
-- Em vez de buscar do profiles (que tem RLS circular),
-- busca raw_app_meta_data direto de auth.users (sem RLS).
-- Migration: 019_fix_jwt_helpers_auth_users_fallback.sql
-- ============================================

-- get_my_role: tenta JWT app_metadata, senão busca de auth.users
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    nullif(auth.jwt() -> 'app_metadata' ->> 'role', ''),
    (SELECT raw_app_meta_data ->> 'role' FROM auth.users WHERE id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- get_my_school_id: tenta JWT app_metadata, senão busca de auth.users
CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    nullif(auth.jwt() -> 'app_metadata' ->> 'school_id', '')::uuid,
    (SELECT (raw_app_meta_data ->> 'school_id')::uuid FROM auth.users WHERE id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
