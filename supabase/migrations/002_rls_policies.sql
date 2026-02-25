-- ============================================
-- EduScanAI - Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- ============================================

-- Helper: retorna o school_id do usuário autenticado via JWT
CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() ->> 'school_id')::uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: retorna o role do usuário autenticado via JWT
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT auth.jwt() ->> 'role';
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- Habilitar RLS em todas as tabelas
-- ============================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_teachers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. schools
-- ============================================

CREATE POLICY "schools_select" ON schools
  FOR SELECT USING (id = get_my_school_id());

-- ============================================
-- 2. profiles
-- ============================================

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (school_id = get_my_school_id());

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

-- ============================================
-- 3. academic_years
-- ============================================

CREATE POLICY "academic_years_select" ON academic_years
  FOR SELECT USING (school_id = get_my_school_id());

CREATE POLICY "academic_years_insert" ON academic_years
  FOR INSERT WITH CHECK (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

CREATE POLICY "academic_years_update" ON academic_years
  FOR UPDATE USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

CREATE POLICY "academic_years_delete" ON academic_years
  FOR DELETE USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

-- ============================================
-- 4. subjects
-- ============================================

CREATE POLICY "subjects_select" ON subjects
  FOR SELECT USING (school_id = get_my_school_id());

CREATE POLICY "subjects_insert" ON subjects
  FOR INSERT WITH CHECK (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

CREATE POLICY "subjects_update" ON subjects
  FOR UPDATE USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

CREATE POLICY "subjects_delete" ON subjects
  FOR DELETE USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

-- ============================================
-- 5. classes
-- ============================================

-- Admin e pedagogue vêem todas as turmas da escola
CREATE POLICY "classes_select_admin_pedagogue" ON classes
  FOR SELECT USING (
    school_id = get_my_school_id()
    AND get_my_role() IN ('admin', 'pedagogue')
  );

-- Teacher só vê turmas onde leciona
CREATE POLICY "classes_select_teacher" ON classes
  FOR SELECT USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'teacher'
    AND id IN (
      SELECT class_id FROM class_teachers WHERE teacher_id = auth.uid()
    )
  );

-- Student só vê turmas onde está matriculado
CREATE POLICY "classes_select_student" ON classes
  FOR SELECT USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'student'
    AND id IN (
      SELECT class_id FROM class_students WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "classes_insert" ON classes
  FOR INSERT WITH CHECK (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

CREATE POLICY "classes_update" ON classes
  FOR UPDATE USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

CREATE POLICY "classes_delete" ON classes
  FOR DELETE USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

-- ============================================
-- 6. class_students
-- ============================================

-- Admin, pedagogue e teacher vêem todos os vínculos da escola
CREATE POLICY "class_students_select_staff" ON class_students
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND class_id IN (
      SELECT id FROM classes WHERE school_id = get_my_school_id()
    )
  );

-- Student só vê os próprios vínculos
CREATE POLICY "class_students_select_self" ON class_students
  FOR SELECT USING (
    get_my_role() = 'student'
    AND student_id = auth.uid()
  );

CREATE POLICY "class_students_insert" ON class_students
  FOR INSERT WITH CHECK (
    get_my_role() = 'admin'
    AND class_id IN (
      SELECT id FROM classes WHERE school_id = get_my_school_id()
    )
  );

CREATE POLICY "class_students_delete" ON class_students
  FOR DELETE USING (
    get_my_role() = 'admin'
    AND class_id IN (
      SELECT id FROM classes WHERE school_id = get_my_school_id()
    )
  );

-- ============================================
-- 7. class_teachers
-- ============================================

CREATE POLICY "class_teachers_select" ON class_teachers
  FOR SELECT USING (
    class_id IN (
      SELECT id FROM classes WHERE school_id = get_my_school_id()
    )
  );

CREATE POLICY "class_teachers_insert" ON class_teachers
  FOR INSERT WITH CHECK (
    get_my_role() = 'admin'
    AND class_id IN (
      SELECT id FROM classes WHERE school_id = get_my_school_id()
    )
  );

CREATE POLICY "class_teachers_delete" ON class_teachers
  FOR DELETE USING (
    get_my_role() = 'admin'
    AND class_id IN (
      SELECT id FROM classes WHERE school_id = get_my_school_id()
    )
  );
