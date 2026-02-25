-- ============================================
-- EduScanAI - Assignments, Submissions & Notifications
-- Migration: 004_assignments.sql
-- ============================================

-- 1. assignments
CREATE TABLE assignments (
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

CREATE INDEX idx_assignments_school_id ON assignments (school_id);
CREATE INDEX idx_assignments_class_id ON assignments (class_id);
CREATE INDEX idx_assignments_teacher_id ON assignments (teacher_id);
CREATE INDEX idx_assignments_status ON assignments (status);

-- 2. submissions
CREATE TABLE submissions (
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

CREATE INDEX idx_submissions_assignment_id ON submissions (assignment_id);
CREATE INDEX idx_submissions_student_id ON submissions (student_id);

-- 3. notifications
CREATE TABLE notifications (
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

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_read_at ON notifications (user_id, read_at);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ---- ASSIGNMENTS RLS ----

-- SELECT: admin/pedagogo vêem todas da escola
CREATE POLICY "assignments_select_admin_pedagogue" ON assignments
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue')
    AND school_id = get_my_school_id()
  );

-- SELECT: professor vê atividades das turmas vinculadas
CREATE POLICY "assignments_select_teacher" ON assignments
  FOR SELECT USING (
    get_my_role() = 'teacher'
    AND class_id IN (
      SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid()
    )
  );

-- SELECT: aluno vê apenas publicadas das turmas matriculadas
CREATE POLICY "assignments_select_student" ON assignments
  FOR SELECT USING (
    get_my_role() = 'student'
    AND status = 'published'
    AND class_id IN (
      SELECT class_id FROM class_students WHERE student_id = auth.uid()
    )
  );

-- INSERT: professor/admin cria atividades
CREATE POLICY "assignments_insert" ON assignments
  FOR INSERT WITH CHECK (
    get_my_role() IN ('admin', 'teacher')
    AND school_id = get_my_school_id()
    AND teacher_id = auth.uid()
  );

-- UPDATE: dono ou admin
CREATE POLICY "assignments_update" ON assignments
  FOR UPDATE USING (
    teacher_id = auth.uid()
    OR (get_my_role() = 'admin' AND school_id = get_my_school_id())
  );

-- DELETE: apenas rascunhos, dono ou admin
CREATE POLICY "assignments_delete_draft" ON assignments
  FOR DELETE USING (
    status = 'draft'
    AND (
      teacher_id = auth.uid()
      OR (get_my_role() = 'admin' AND school_id = get_my_school_id())
    )
  );

-- ---- SUBMISSIONS RLS ----

-- SELECT: aluno vê as próprias
CREATE POLICY "submissions_select_own" ON submissions
  FOR SELECT USING (student_id = auth.uid());

-- SELECT: professor/admin/pedagogo vê submissões das suas atividades
CREATE POLICY "submissions_select_teacher" ON submissions
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND assignment_id IN (
      SELECT id FROM assignments
      WHERE teacher_id = auth.uid()
        OR (school_id = get_my_school_id() AND get_my_role() IN ('admin', 'pedagogue'))
    )
  );

-- INSERT: aluno submete em atividades publicadas das turmas matriculadas
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

-- UPDATE: aluno atualiza própria (antes de ser corrigida)
CREATE POLICY "submissions_update_student" ON submissions
  FOR UPDATE USING (
    student_id = auth.uid() AND graded_at IS NULL
  );

-- UPDATE: professor/admin corrige
CREATE POLICY "submissions_update_teacher" ON submissions
  FOR UPDATE USING (
    get_my_role() IN ('admin', 'teacher')
    AND assignment_id IN (
      SELECT id FROM assignments
      WHERE teacher_id = auth.uid()
        OR (school_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

-- DELETE: aluno deleta própria (antes de ser corrigida)
CREATE POLICY "submissions_delete_student" ON submissions
  FOR DELETE USING (
    student_id = auth.uid() AND graded_at IS NULL
  );

-- ---- NOTIFICATIONS RLS ----

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at automático para assignments
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Notificar alunos quando atividade é publicada
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

CREATE TRIGGER on_assignment_published
  AFTER INSERT OR UPDATE OF status ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION notify_assignment_published();
