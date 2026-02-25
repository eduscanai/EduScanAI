-- ============================================
-- EduScanAI - Auth Triggers & Custom Claims
-- Migration: 003_auth_triggers.sql
-- ============================================

-- ============================================
-- 1. Função para setar custom claims no JWT
-- ============================================

CREATE OR REPLACE FUNCTION public.set_claim(uid UUID, claim TEXT, value TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || json_build_object(claim, value)::jsonb
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Função para sincronizar claims quando
--    school_id ou role mudam no profiles
-- ============================================

CREATE OR REPLACE FUNCTION public.sync_profile_claims()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualiza school_id no JWT
  IF NEW.school_id IS NOT NULL THEN
    PERFORM public.set_claim(NEW.id, 'school_id', NEW.school_id::text);
  END IF;

  -- Atualiza role no JWT
  IF NEW.role IS NOT NULL THEN
    PERFORM public.set_claim(NEW.id, 'role', NEW.role);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: sincroniza claims ao inserir ou atualizar profile
CREATE TRIGGER on_profile_change_sync_claims
  AFTER INSERT OR UPDATE OF school_id, role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_claims();

-- ============================================
-- 3. Trigger: cria profile automaticamente
--    quando um novo usuário se registra
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
  _school_id := (NEW.raw_user_meta_data ->> 'school_id')::uuid;
  _role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'teacher');

  -- Se não veio school_id no metadata, tenta do app_metadata
  IF _school_id IS NULL THEN
    _school_id := (NEW.raw_app_meta_data ->> 'school_id')::uuid;
  END IF;

  -- Só cria profile se tiver school_id
  IF _school_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, school_id, full_name, role, email)
    VALUES (NEW.id, _school_id, _full_name, _role, NEW.email);
  END IF;

  -- Seta claims no JWT
  IF _school_id IS NOT NULL THEN
    PERFORM public.set_claim(NEW.id, 'school_id', _school_id::text);
  END IF;
  PERFORM public.set_claim(NEW.id, 'role', _role);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: dispara ao criar novo usuário no auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
