-- ============================================
-- EduScanAI - Fix handle_new_user: ler role do app_metadata
-- Migration: 009_fix_handle_new_user_role.sql
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _school_id UUID;
  _role TEXT;
  _full_name TEXT;
BEGIN
  -- Busca dados do metadata enviado no signUp
  _full_name := NEW.raw_user_meta_data ->> 'nome';

  -- school_id: tenta user_metadata primeiro, depois app_metadata
  _school_id := (NEW.raw_user_meta_data ->> 'school_id')::uuid;
  IF _school_id IS NULL THEN
    _school_id := (NEW.raw_app_meta_data ->> 'school_id')::uuid;
  END IF;

  -- role: tenta user_metadata primeiro, depois app_metadata, default 'teacher'
  _role := NEW.raw_user_meta_data ->> 'role';
  IF _role IS NULL THEN
    _role := COALESCE(NEW.raw_app_meta_data ->> 'role', 'teacher');
  END IF;

  -- Só cria profile se tiver school_id
  IF _school_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, school_id, full_name, role, email)
    VALUES (NEW.id, _school_id, _full_name, _role, NEW.email)
    ON CONFLICT (id) DO UPDATE SET
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      role = COALESCE(EXCLUDED.role, profiles.role),
      school_id = COALESCE(EXCLUDED.school_id, profiles.school_id);
  END IF;

  -- Seta claims no JWT
  IF _school_id IS NOT NULL THEN
    PERFORM public.set_claim(NEW.id, 'school_id', _school_id::text);
  END IF;
  PERFORM public.set_claim(NEW.id, 'role', _role);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
