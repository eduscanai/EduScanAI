-- ============================================
-- EduScanAI - Fix JWT helper functions
-- Os claims school_id e role ficam dentro de app_metadata no JWT
-- Migration: 010_fix_jwt_helpers.sql
-- ============================================

CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'school_id')::uuid,
    (auth.jwt() ->> 'school_id')::uuid
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() ->> 'role'
  );
$$ LANGUAGE sql SECURITY DEFINER;
