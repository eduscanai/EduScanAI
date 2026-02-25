-- ============================================
-- EduScanAI - Professor Responsável na Turma
-- Migration: 008_classes_teacher.sql
-- ============================================

-- 1. Adicionar coluna teacher_id (professor responsável) na turma
ALTER TABLE classes ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES profiles ON DELETE SET NULL;

-- 2. Índice
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes (teacher_id);
