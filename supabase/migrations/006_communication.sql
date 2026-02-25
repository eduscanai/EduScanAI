-- ============================================
-- EduScanAI - Announcements (Communication)
-- Migration: 006_communication.sql
-- ============================================

-- 1. announcements (avisos)
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  target_type TEXT NOT NULL DEFAULT 'school' CHECK (target_type IN ('school', 'class', 'role')),
  target_id UUID,            -- class_id se target_type = 'class', NULL se 'school' ou 'role'
  target_role TEXT,           -- 'student', 'teacher', etc. se target_type = 'role'
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_announcements_school_id ON announcements (school_id);
CREATE INDEX idx_announcements_author_id ON announcements (author_id);
CREATE INDEX idx_announcements_published ON announcements (school_id, published_at DESC);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- SELECT: todos da escola veem avisos publicados
CREATE POLICY "announcements_select_published" ON announcements
  FOR SELECT USING (
    published_at IS NOT NULL
    AND school_id = get_my_school_id()
  );

-- SELECT: admin/pedagogo/professor veem todos (incluindo rascunhos próprios)
CREATE POLICY "announcements_select_author" ON announcements
  FOR SELECT USING (
    author_id = auth.uid()
    AND school_id = get_my_school_id()
  );

-- INSERT: admin, pedagogo, professor podem criar
CREATE POLICY "announcements_insert" ON announcements
  FOR INSERT WITH CHECK (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND school_id = get_my_school_id()
    AND author_id = auth.uid()
  );

-- UPDATE: autor ou admin
CREATE POLICY "announcements_update" ON announcements
  FOR UPDATE USING (
    author_id = auth.uid()
    OR (get_my_role() = 'admin' AND school_id = get_my_school_id())
  );

-- DELETE: autor ou admin
CREATE POLICY "announcements_delete" ON announcements
  FOR DELETE USING (
    author_id = auth.uid()
    OR (get_my_role() = 'admin' AND school_id = get_my_school_id())
  );

-- ============================================
-- NOTIFICATIONS: adicionar INSERT policy (faltava na 004)
-- ============================================

-- INSERT: sistema cria notificações (via trigger SECURITY DEFINER)
-- Não é necessário policy de INSERT para usuários normais,
-- pois os triggers usam SECURITY DEFINER.

-- DELETE: usuário pode deletar suas próprias notificações
CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at automático para announcements
CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Notificar destinatários quando aviso é publicado
CREATE OR REPLACE FUNCTION notify_announcement_published()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published_at IS NOT NULL AND (OLD IS NULL OR OLD.published_at IS NULL) THEN
    -- Escola inteira
    IF NEW.target_type = 'school' THEN
      INSERT INTO notifications (user_id, school_id, type, title, message, data)
      SELECT
        p.id,
        NEW.school_id,
        'announcement',
        NEW.title,
        LEFT(NEW.content, 200),
        jsonb_build_object('announcement_id', NEW.id)
      FROM profiles p
      WHERE p.school_id = NEW.school_id
        AND p.id != NEW.author_id;

    -- Turma específica
    ELSIF NEW.target_type = 'class' AND NEW.target_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, school_id, type, title, message, data)
      -- Alunos da turma
      SELECT
        cs.student_id,
        NEW.school_id,
        'announcement',
        NEW.title,
        LEFT(NEW.content, 200),
        jsonb_build_object('announcement_id', NEW.id, 'class_id', NEW.target_id)
      FROM class_students cs
      WHERE cs.class_id = NEW.target_id
        AND cs.student_id != NEW.author_id
      UNION ALL
      -- Professores da turma
      SELECT
        ct.teacher_id,
        NEW.school_id,
        'announcement',
        NEW.title,
        LEFT(NEW.content, 200),
        jsonb_build_object('announcement_id', NEW.id, 'class_id', NEW.target_id)
      FROM class_teachers ct
      WHERE ct.class_id = NEW.target_id
        AND ct.teacher_id != NEW.author_id;

    -- Role específico
    ELSIF NEW.target_type = 'role' AND NEW.target_role IS NOT NULL THEN
      INSERT INTO notifications (user_id, school_id, type, title, message, data)
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

CREATE TRIGGER on_announcement_published
  AFTER INSERT OR UPDATE OF published_at ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION notify_announcement_published();

-- ============================================
-- Enable Realtime para notifications
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
