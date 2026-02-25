-- ============================================
-- EduScanAI - Fix RLS infinite recursion
-- As policies de classes ↔ class_teachers/class_students
-- faziam referência circular. Solução: SECURITY DEFINER helpers.
-- Migration: 011_fix_rls_recursion.sql
-- ============================================

-- 1. Helper: retorna class_ids da escola (bypassa RLS)
CREATE OR REPLACE FUNCTION public.get_school_class_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM public.classes
  WHERE school_id = public.get_my_school_id();
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Helper: retorna class_ids onde o teacher leciona (bypassa RLS)
CREATE OR REPLACE FUNCTION public.get_my_teacher_class_ids()
RETURNS SETOF UUID AS $$
  SELECT class_id FROM public.class_teachers
  WHERE teacher_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Helper: retorna class_ids onde o student está matriculado (bypassa RLS)
CREATE OR REPLACE FUNCTION public.get_my_student_class_ids()
RETURNS SETOF UUID AS $$
  SELECT class_id FROM public.class_students
  WHERE student_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- 4. Recriar policies de classes SEM subqueries circulares
-- ============================================

DROP POLICY IF EXISTS "classes_select_teacher" ON classes;
CREATE POLICY "classes_select_teacher" ON classes
  FOR SELECT USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'teacher'
    AND id IN (SELECT public.get_my_teacher_class_ids())
  );

DROP POLICY IF EXISTS "classes_select_student" ON classes;
CREATE POLICY "classes_select_student" ON classes
  FOR SELECT USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'student'
    AND id IN (SELECT public.get_my_student_class_ids())
  );

-- ============================================
-- 5. Recriar policies de class_teachers SEM referência a classes
-- ============================================

DROP POLICY IF EXISTS "class_teachers_select" ON class_teachers;
CREATE POLICY "class_teachers_select" ON class_teachers
  FOR SELECT USING (
    class_id IN (SELECT public.get_school_class_ids())
  );

DROP POLICY IF EXISTS "class_teachers_insert" ON class_teachers;
CREATE POLICY "class_teachers_insert" ON class_teachers
  FOR INSERT WITH CHECK (
    get_my_role() = 'admin'
    AND class_id IN (SELECT public.get_school_class_ids())
  );

DROP POLICY IF EXISTS "class_teachers_delete" ON class_teachers;
CREATE POLICY "class_teachers_delete" ON class_teachers
  FOR DELETE USING (
    get_my_role() = 'admin'
    AND class_id IN (SELECT public.get_school_class_ids())
  );

-- ============================================
-- 6. Recriar policies de class_students SEM referência a classes
-- ============================================

DROP POLICY IF EXISTS "class_students_select_staff" ON class_students;
CREATE POLICY "class_students_select_staff" ON class_students
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND class_id IN (SELECT public.get_school_class_ids())
  );

DROP POLICY IF EXISTS "class_students_insert" ON class_students;
CREATE POLICY "class_students_insert" ON class_students
  FOR INSERT WITH CHECK (
    get_my_role() = 'admin'
    AND class_id IN (SELECT public.get_school_class_ids())
  );

DROP POLICY IF EXISTS "class_students_delete" ON class_students;
CREATE POLICY "class_students_delete" ON class_students
  FOR DELETE USING (
    get_my_role() = 'admin'
    AND class_id IN (SELECT public.get_school_class_ids())
  );

-- ============================================
-- 7. Recarregar schema do PostgREST (detectar nova FK teacher_id)
-- ============================================
NOTIFY pgrst, 'reload schema';
