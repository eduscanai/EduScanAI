-- ============================================
-- EduScanAI - APLICAR MIGRAÇÕES FALTANTES
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- ============================================
-- MIGRATION 003: Auth Triggers & Custom Claims
-- ============================================

-- 1. Função para setar custom claims no JWT
CREATE OR REPLACE FUNCTION public.set_claim(uid UUID, claim TEXT, value TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || json_build_object(claim, value)::jsonb
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Sincronizar claims quando profile muda
CREATE OR REPLACE FUNCTION public.sync_profile_claims()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.school_id IS NOT NULL THEN
    PERFORM public.set_claim(NEW.id, 'school_id', NEW.school_id::text);
  END IF;
  IF NEW.role IS NOT NULL THEN
    PERFORM public.set_claim(NEW.id, 'role', NEW.role);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_change_sync_claims ON profiles;
CREATE TRIGGER on_profile_change_sync_claims
  AFTER INSERT OR UPDATE OF school_id, role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_claims();

-- 3. Trigger: cria profile ao criar novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
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

  IF _role = 'teacher' AND NEW.raw_app_meta_data ->> 'role' IS NOT NULL THEN
    _role := NEW.raw_app_meta_data ->> 'role';
  END IF;

  IF _school_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, school_id, full_name, role, email)
    VALUES (NEW.id, _school_id, _full_name, _role, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF _school_id IS NOT NULL THEN
    PERFORM public.set_claim(NEW.id, 'school_id', _school_id::text);
  END IF;
  PERFORM public.set_claim(NEW.id, 'role', _role);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FIX: Criar profile do admin existente
-- ============================================
INSERT INTO public.profiles (id, school_id, full_name, role, email)
VALUES (
  '770f4be0-6f6c-499a-a0be-d5a2920e983f',
  'f111eb25-b753-4e5c-8ffc-b712c084c919',
  'Filipe Barbosa',
  'admin',
  'filipe@filipe.com'
) ON CONFLICT (id) DO NOTHING;

-- Limpar usuários de teste sem escola (não podem funcionar)
-- DELETE FROM auth.users WHERE id IN (
--   '3884180c-317c-42d4-b32b-6805a27693a4',
--   '0b3c474d-cfec-42f6-97ff-c2f10ef51d7d'
-- );

-- ============================================
-- MIGRATION 004: Assignments, Submissions, Notifications
-- ============================================

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects ON DELETE SET NULL,
  teacher_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  max_score NUMERIC DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  published_at TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_school_id ON assignments (school_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON assignments (class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments (teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments (status);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  content TEXT,
  attachments JSONB DEFAULT '[]',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  score NUMERIC,
  feedback TEXT,
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES profiles ON DELETE SET NULL,
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions (assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions (student_id);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  school_id UUID REFERENCES schools ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications (user_id, read_at);

-- RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ASSIGNMENTS RLS
CREATE POLICY "assignments_select_admin_pedagogue" ON assignments
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue')
    AND school_id = get_my_school_id()
  );

CREATE POLICY "assignments_select_teacher" ON assignments
  FOR SELECT USING (
    get_my_role() = 'teacher'
    AND class_id IN (
      SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "assignments_select_student" ON assignments
  FOR SELECT USING (
    get_my_role() = 'student'
    AND status = 'published'
    AND class_id IN (
      SELECT class_id FROM class_students WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "assignments_insert" ON assignments
  FOR INSERT WITH CHECK (
    get_my_role() IN ('admin', 'teacher')
    AND school_id = get_my_school_id()
    AND teacher_id = auth.uid()
  );

CREATE POLICY "assignments_update" ON assignments
  FOR UPDATE USING (
    teacher_id = auth.uid()
    OR (get_my_role() = 'admin' AND school_id = get_my_school_id())
  );

CREATE POLICY "assignments_delete_draft" ON assignments
  FOR DELETE USING (
    status = 'draft'
    AND (
      teacher_id = auth.uid()
      OR (get_my_role() = 'admin' AND school_id = get_my_school_id())
    )
  );

-- SUBMISSIONS RLS
CREATE POLICY "submissions_select_own" ON submissions
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "submissions_select_teacher" ON submissions
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND assignment_id IN (
      SELECT id FROM assignments
      WHERE teacher_id = auth.uid()
        OR (school_id = get_my_school_id() AND get_my_role() IN ('admin', 'pedagogue'))
    )
  );

CREATE POLICY "submissions_insert_student" ON submissions
  FOR INSERT WITH CHECK (
    student_id = auth.uid()
    AND assignment_id IN (
      SELECT a.id FROM assignments a
      JOIN class_students cs ON cs.class_id = a.class_id
      WHERE cs.student_id = auth.uid()
        AND a.status = 'published'
    )
  );

CREATE POLICY "submissions_update_student" ON submissions
  FOR UPDATE USING (
    student_id = auth.uid() AND graded_at IS NULL
  );

CREATE POLICY "submissions_update_teacher" ON submissions
  FOR UPDATE USING (
    get_my_role() IN ('admin', 'teacher')
    AND assignment_id IN (
      SELECT id FROM assignments
      WHERE teacher_id = auth.uid()
        OR (school_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

CREATE POLICY "submissions_delete_student" ON submissions
  FOR DELETE USING (
    student_id = auth.uid() AND graded_at IS NULL
  );

-- NOTIFICATIONS RLS
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS assignments_updated_at ON assignments;
CREATE TRIGGER assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION notify_assignment_published()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'published') THEN
    INSERT INTO notifications (user_id, school_id, type, title, message, data)
    SELECT
      cs.student_id,
      NEW.school_id,
      'assignment',
      'Nova atividade: ' || NEW.title,
      'Uma nova atividade foi publicada na sua turma.',
      jsonb_build_object('assignment_id', NEW.id, 'class_id', NEW.class_id)
    FROM class_students cs
    WHERE cs.class_id = NEW.class_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_assignment_published ON assignments;
CREATE TRIGGER on_assignment_published
  AFTER INSERT OR UPDATE OF status ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION notify_assignment_published();

-- ============================================
-- MIGRATION 005: Storage Buckets
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('assignments-files', 'assignments-files', true),
  ('submissions-files', 'submissions-files', false),
  ('school-assets',     'school-assets',     true)
ON CONFLICT (id) DO NOTHING;

-- ASSIGNMENTS-FILES policies
CREATE POLICY "assignments_files_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assignments-files'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

CREATE POLICY "assignments_files_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assignments-files'
    AND get_my_role() IN ('admin', 'teacher')
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

CREATE POLICY "assignments_files_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'assignments-files'
    AND get_my_role() IN ('admin', 'teacher')
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

CREATE POLICY "assignments_files_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'assignments-files'
    AND get_my_role() IN ('admin', 'teacher')
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

-- SUBMISSIONS-FILES policies
CREATE POLICY "submissions_files_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'submissions-files'
    AND (
      (
        get_my_role() = 'student'
        AND (storage.foldername(name))[1] = get_my_school_id()::text
        AND (storage.foldername(name))[2] = auth.uid()::text
      )
      OR
      (
        get_my_role() IN ('admin', 'pedagogue', 'teacher')
        AND (storage.foldername(name))[1] = get_my_school_id()::text
      )
    )
  );

CREATE POLICY "submissions_files_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'submissions-files'
    AND get_my_role() = 'student'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "submissions_files_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'submissions-files'
    AND get_my_role() = 'student'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "submissions_files_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'submissions-files'
    AND get_my_role() = 'student'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- SCHOOL-ASSETS policies
CREATE POLICY "school_assets_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'school-assets'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

CREATE POLICY "school_assets_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'school-assets'
    AND get_my_role() = 'admin'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

CREATE POLICY "school_assets_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'school-assets'
    AND get_my_role() = 'admin'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

CREATE POLICY "school_assets_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'school-assets'
    AND get_my_role() = 'admin'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

-- ============================================
-- MIGRATION 006: Announcements (Communication)
-- ============================================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  target_type TEXT NOT NULL DEFAULT 'school' CHECK (target_type IN ('school', 'class', 'role')),
  target_id UUID,
  target_role TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_school_id ON announcements (school_id);
CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements (author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements (school_id, published_at DESC);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements_select_published" ON announcements
  FOR SELECT USING (
    published_at IS NOT NULL
    AND school_id = get_my_school_id()
  );

CREATE POLICY "announcements_select_author" ON announcements
  FOR SELECT USING (
    author_id = auth.uid()
    AND school_id = get_my_school_id()
  );

CREATE POLICY "announcements_insert" ON announcements
  FOR INSERT WITH CHECK (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND school_id = get_my_school_id()
    AND author_id = auth.uid()
  );

CREATE POLICY "announcements_update" ON announcements
  FOR UPDATE USING (
    author_id = auth.uid()
    OR (get_my_role() = 'admin' AND school_id = get_my_school_id())
  );

CREATE POLICY "announcements_delete" ON announcements
  FOR DELETE USING (
    author_id = auth.uid()
    OR (get_my_role() = 'admin' AND school_id = get_my_school_id())
  );

DROP TRIGGER IF EXISTS announcements_updated_at ON announcements;
CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION notify_announcement_published()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published_at IS NOT NULL AND (OLD IS NULL OR OLD.published_at IS NULL) THEN
    IF NEW.target_type = 'school' THEN
      INSERT INTO notifications (user_id, school_id, type, title, message, data)
      SELECT p.id, NEW.school_id, 'announcement', NEW.title, LEFT(NEW.content, 200),
        jsonb_build_object('announcement_id', NEW.id)
      FROM profiles p
      WHERE p.school_id = NEW.school_id AND p.id != NEW.author_id;
    ELSIF NEW.target_type = 'class' AND NEW.target_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, school_id, type, title, message, data)
      SELECT cs.student_id, NEW.school_id, 'announcement', NEW.title, LEFT(NEW.content, 200),
        jsonb_build_object('announcement_id', NEW.id, 'class_id', NEW.target_id)
      FROM class_students cs
      WHERE cs.class_id = NEW.target_id AND cs.student_id != NEW.author_id
      UNION ALL
      SELECT ct.teacher_id, NEW.school_id, 'announcement', NEW.title, LEFT(NEW.content, 200),
        jsonb_build_object('announcement_id', NEW.id, 'class_id', NEW.target_id)
      FROM class_teachers ct
      WHERE ct.class_id = NEW.target_id AND ct.teacher_id != NEW.author_id;
    ELSIF NEW.target_type = 'role' AND NEW.target_role IS NOT NULL THEN
      INSERT INTO notifications (user_id, school_id, type, title, message, data)
      SELECT u.id, NEW.school_id, 'announcement', NEW.title, LEFT(NEW.content, 200),
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

DROP TRIGGER IF EXISTS on_announcement_published ON announcements;
CREATE TRIGGER on_announcement_published
  AFTER INSERT OR UPDATE OF published_at ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION notify_announcement_published();

-- Enable Realtime para notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
