-- ============================================================
-- Migration 024: Renomear tabelas para português + limpeza
-- ============================================================

-- 1. Remover trigger e função redundantes
DO $$ BEGIN
  DROP TRIGGER IF EXISTS on_subject_sync_class_teachers ON subjects;
EXCEPTION WHEN undefined_table THEN
  DROP TRIGGER IF EXISTS on_subject_sync_class_teachers ON disciplinas;
END $$;
DROP FUNCTION IF EXISTS sync_subject_to_class_teachers();

-- 2. Remover colunas redundantes de subjects/disciplinas
DO $$ BEGIN
  ALTER TABLE subjects DROP COLUMN IF EXISTS class_id;
  ALTER TABLE subjects DROP COLUMN IF EXISTS teacher_id;
EXCEPTION WHEN undefined_table THEN
  ALTER TABLE disciplinas DROP COLUMN IF EXISTS class_id;
  ALTER TABLE disciplinas DROP COLUMN IF EXISTS teacher_id;
END $$;

-- Remover índices órfãos
DROP INDEX IF EXISTS idx_subjects_class_id;
DROP INDEX IF EXISTS idx_subjects_teacher_id;

-- ============================================================
-- 3. Renomear todas as tabelas para português (idempotente)
-- ============================================================
DO $$ BEGIN ALTER TABLE schools RENAME TO escolas; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE profiles RENAME TO perfis; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE academic_years RENAME TO anos_letivos; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE subjects RENAME TO disciplinas; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE classes RENAME TO turmas; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE class_students RENAME TO turma_alunos; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE class_teachers RENAME TO turma_professores; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE assignments RENAME TO atividades; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE submissions RENAME TO envios; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE notifications RENAME TO notificacoes; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE announcements RENAME TO comunicados; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE calendar_events RENAME TO eventos_calendario; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE grade_curricula RENAME TO grade_curricular; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE grading_periods RENAME TO periodos_avaliacao; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE assignment_categories RENAME TO categorias_avaliacao; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE report_cards RENAME TO boletins; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE subject_bncc_topics RENAME TO bncc_topicos; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE subject_bncc_skills RENAME TO bncc_habilidades; EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END $$;

-- ============================================================
-- 4. Atualizar funções que referenciam nomes de tabelas
-- ============================================================

-- handle_new_user: profiles → perfis
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _school_id UUID;
  _role TEXT;
  _full_name TEXT;
BEGIN
  _full_name := NEW.raw_user_meta_data ->> 'nome';
  _school_id := (NEW.raw_user_meta_data ->> 'school_id')::uuid;
  _role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'teacher');

  IF _school_id IS NULL THEN
    _school_id := (NEW.raw_app_meta_data ->> 'school_id')::uuid;
  END IF;

  IF _school_id IS NOT NULL THEN
    INSERT INTO public.perfis (id, school_id, full_name, role, email)
    VALUES (NEW.id, _school_id, _full_name, _role, NEW.email);
  END IF;

  IF _school_id IS NOT NULL THEN
    PERFORM public.set_claim(NEW.id, 'school_id', _school_id::text);
  END IF;
  PERFORM public.set_claim(NEW.id, 'role', _role);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- notify_assignment_published: notifications → notificacoes, class_students → turma_alunos
CREATE OR REPLACE FUNCTION notify_assignment_published()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'published') THEN
    INSERT INTO notificacoes (user_id, school_id, type, title, message, data)
    SELECT
      cs.student_id,
      NEW.school_id,
      'assignment',
      'Nova atividade: ' || NEW.title,
      'Uma nova atividade foi publicada na sua turma.',
      jsonb_build_object('assignment_id', NEW.id, 'class_id', NEW.class_id)
    FROM turma_alunos cs
    WHERE cs.class_id = NEW.class_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- notify_announcement_published: notifications → notificacoes, profiles → perfis, class_students → turma_alunos, class_teachers → turma_professores
CREATE OR REPLACE FUNCTION notify_announcement_published()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published_at IS NOT NULL AND (OLD IS NULL OR OLD.published_at IS NULL) THEN
    -- Escola inteira
    IF NEW.target_type = 'school' THEN
      INSERT INTO notificacoes (user_id, school_id, type, title, message, data)
      SELECT
        p.id,
        NEW.school_id,
        'announcement',
        NEW.title,
        LEFT(NEW.content, 200),
        jsonb_build_object('announcement_id', NEW.id)
      FROM perfis p
      WHERE p.school_id = NEW.school_id
        AND p.id != NEW.author_id;

    -- Turma específica
    ELSIF NEW.target_type = 'class' AND NEW.target_id IS NOT NULL THEN
      INSERT INTO notificacoes (user_id, school_id, type, title, message, data)
      SELECT
        cs.student_id,
        NEW.school_id,
        'announcement',
        NEW.title,
        LEFT(NEW.content, 200),
        jsonb_build_object('announcement_id', NEW.id, 'class_id', NEW.target_id)
      FROM turma_alunos cs
      WHERE cs.class_id = NEW.target_id
        AND cs.student_id != NEW.author_id
      UNION ALL
      SELECT
        ct.teacher_id,
        NEW.school_id,
        'announcement',
        NEW.title,
        LEFT(NEW.content, 200),
        jsonb_build_object('announcement_id', NEW.id, 'class_id', NEW.target_id)
      FROM turma_professores ct
      WHERE ct.class_id = NEW.target_id
        AND ct.teacher_id != NEW.author_id;

    -- Role específico
    ELSIF NEW.target_type = 'role' AND NEW.target_role IS NOT NULL THEN
      INSERT INTO notificacoes (user_id, school_id, type, title, message, data)
      SELECT
        u.id,
        NEW.school_id,
        'announcement',
        NEW.title,
        LEFT(NEW.content, 200),
        jsonb_build_object('announcement_id', NEW.id)
      FROM auth.users u
      WHERE u.raw_app_meta_data ->> 'school_id' = NEW.school_id::text
        AND u.raw_app_meta_data ->> 'role' = NEW.target_role
        AND u.id != NEW.author_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- get_school_class_ids: classes → turmas
CREATE OR REPLACE FUNCTION get_school_class_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM public.turmas
  WHERE school_id = public.get_my_school_id();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- get_my_teacher_class_ids: class_teachers → turma_professores
CREATE OR REPLACE FUNCTION get_my_teacher_class_ids()
RETURNS SETOF UUID AS $$
  SELECT class_id FROM public.turma_professores
  WHERE teacher_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- get_my_student_class_ids: class_students → turma_alunos
CREATE OR REPLACE FUNCTION get_my_student_class_ids()
RETURNS SETOF UUID AS $$
  SELECT class_id FROM public.turma_alunos
  WHERE student_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================
-- 5. Atualizar publicação realtime
-- ============================================================
-- A tabela já foi renomeada, então precisa re-adicionar com nome novo
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE notifications;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE notificacoes;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
END $$;
ALTER PUBLICATION supabase_realtime ADD TABLE notificacoes;

-- Recarregar schema do PostgREST
NOTIFY pgrst, 'reload schema';
