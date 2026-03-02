-- ============================================
-- Fix: Setup announcements policies + triggers
-- Safe to run even if some parts already exist
-- Migration: 016_fix_announcements_setup.sql
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies (safe)
DROP POLICY IF EXISTS "announcements_select_published" ON announcements;
CREATE POLICY "announcements_select_published" ON announcements
  FOR SELECT USING (
    published_at IS NOT NULL
    AND school_id = get_my_school_id()
  );

DROP POLICY IF EXISTS "announcements_select_author" ON announcements;
CREATE POLICY "announcements_select_author" ON announcements
  FOR SELECT USING (
    author_id = auth.uid()
    AND school_id = get_my_school_id()
  );

-- Admin/pedagogue/teacher veem todos os avisos da escola (incluindo rascunhos)
DROP POLICY IF EXISTS "announcements_select_staff" ON announcements;
CREATE POLICY "announcements_select_staff" ON announcements
  FOR SELECT USING (
    school_id = get_my_school_id()
    AND get_my_role() IN ('admin', 'pedagogue', 'teacher')
  );

DROP POLICY IF EXISTS "announcements_insert" ON announcements;
CREATE POLICY "announcements_insert" ON announcements
  FOR INSERT WITH CHECK (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND school_id = get_my_school_id()
    AND author_id = auth.uid()
  );

DROP POLICY IF EXISTS "announcements_update" ON announcements;
CREATE POLICY "announcements_update" ON announcements
  FOR UPDATE USING (
    author_id = auth.uid()
    OR (get_my_role() = 'admin' AND school_id = get_my_school_id())
  );

DROP POLICY IF EXISTS "announcements_delete" ON announcements;
CREATE POLICY "announcements_delete" ON announcements
  FOR DELETE USING (
    author_id = auth.uid()
    OR (get_my_role() = 'admin' AND school_id = get_my_school_id())
  );

-- Notifications delete policy
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- Updated_at trigger
DROP TRIGGER IF EXISTS announcements_updated_at ON announcements;
CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Notification trigger (uses profiles instead of auth.users)
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
        LEFT(COALESCE(NEW.content, ''), 200),
        jsonb_build_object('announcement_id', NEW.id)
      FROM profiles p
      WHERE p.school_id = NEW.school_id
        AND p.id != NEW.author_id;

    -- Turma específica
    ELSIF NEW.target_type = 'class' AND NEW.target_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, school_id, type, title, message, data)
      SELECT DISTINCT sub.uid, NEW.school_id, 'announcement', NEW.title,
        LEFT(COALESCE(NEW.content, ''), 200),
        jsonb_build_object('announcement_id', NEW.id, 'class_id', NEW.target_id)
      FROM (
        SELECT cs.student_id AS uid
        FROM class_students cs
        WHERE cs.class_id = NEW.target_id
          AND cs.student_id != NEW.author_id
        UNION
        SELECT ct.teacher_id AS uid
        FROM class_teachers ct
        WHERE ct.class_id = NEW.target_id
          AND ct.teacher_id != NEW.author_id
      ) sub;

    -- Role específico (usa profiles ao invés de auth.users)
    ELSIF NEW.target_type = 'role' AND NEW.target_role IS NOT NULL THEN
      INSERT INTO notifications (user_id, school_id, type, title, message, data)
      SELECT
        p.id,
        NEW.school_id,
        'announcement',
        NEW.title,
        LEFT(COALESCE(NEW.content, ''), 200),
        jsonb_build_object('announcement_id', NEW.id)
      FROM profiles p
      WHERE p.school_id = NEW.school_id
        AND p.role = NEW.target_role
        AND p.id != NEW.author_id;
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

-- Enable Realtime (skip if already added)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
