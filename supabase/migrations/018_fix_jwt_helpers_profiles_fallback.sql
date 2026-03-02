-- ============================================
-- EduScanAI - Fix JWT helpers: fallback para profiles
-- Quando app_metadata não tem role/school_id (ex: token expirado,
-- claims não setados), busca da tabela profiles.
-- Migration: 018_fix_jwt_helpers_profiles_fallback.sql
-- ============================================

-- get_my_role: tenta app_metadata primeiro, senão busca do profiles
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt() -> 'app_metadata' ->> 'role',
    (SELECT role FROM public.profiles WHERE id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- get_my_school_id: tenta app_metadata primeiro, senão busca do profiles
CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'school_id')::uuid,
    (SELECT school_id FROM public.profiles WHERE id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
