-- ============================================
-- EduScanAI - Storage Buckets & Policies
-- Migration: 005_storage.sql
-- ============================================

-- 1. Criar buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('assignments-files', 'assignments-files', true),
  ('submissions-files', 'submissions-files', false),
  ('school-assets',     'school-assets',     true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ASSIGNMENTS-FILES
-- Professor faz upload, todos da escola podem ver (público)
-- ============================================

-- SELECT: qualquer autenticado da escola pode baixar
CREATE POLICY "assignments_files_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assignments-files'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

-- INSERT: professor ou admin pode enviar
CREATE POLICY "assignments_files_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assignments-files'
    AND get_my_role() IN ('admin', 'teacher')
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

-- UPDATE: professor ou admin pode atualizar
CREATE POLICY "assignments_files_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'assignments-files'
    AND get_my_role() IN ('admin', 'teacher')
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

-- DELETE: professor ou admin pode deletar
CREATE POLICY "assignments_files_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'assignments-files'
    AND get_my_role() IN ('admin', 'teacher')
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

-- ============================================
-- SUBMISSIONS-FILES
-- Aluno faz upload, professor/admin pode ver (privado)
-- ============================================

-- SELECT: aluno vê os próprios, professor/admin vê todos da escola
CREATE POLICY "submissions_files_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'submissions-files'
    AND (
      -- Aluno vê seus próprios arquivos (pasta = school_id/student_id/...)
      (
        get_my_role() = 'student'
        AND (storage.foldername(name))[1] = get_my_school_id()::text
        AND (storage.foldername(name))[2] = auth.uid()::text
      )
      OR
      -- Professor/admin/pedagogo vê todos da escola
      (
        get_my_role() IN ('admin', 'pedagogue', 'teacher')
        AND (storage.foldername(name))[1] = get_my_school_id()::text
      )
    )
  );

-- INSERT: aluno envia na própria pasta
CREATE POLICY "submissions_files_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'submissions-files'
    AND get_my_role() = 'student'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- UPDATE: aluno pode atualizar seus próprios
CREATE POLICY "submissions_files_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'submissions-files'
    AND get_my_role() = 'student'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- DELETE: aluno pode deletar seus próprios
CREATE POLICY "submissions_files_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'submissions-files'
    AND get_my_role() = 'student'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- ============================================
-- SCHOOL-ASSETS
-- Admin faz upload, todos da escola podem ver (público)
-- ============================================

-- SELECT: qualquer autenticado da escola pode ver
CREATE POLICY "school_assets_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'school-assets'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

-- INSERT: admin pode enviar
CREATE POLICY "school_assets_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'school-assets'
    AND get_my_role() = 'admin'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

-- UPDATE: admin pode atualizar
CREATE POLICY "school_assets_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'school-assets'
    AND get_my_role() = 'admin'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );

-- DELETE: admin pode deletar
CREATE POLICY "school_assets_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'school-assets'
    AND get_my_role() = 'admin'
    AND (storage.foldername(name))[1] = get_my_school_id()::text
  );
