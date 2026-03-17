-- ============================================
-- EduScanAI - Boletim (Quadro de Notas)
-- Trimestres, categorias com peso e boletim
-- Migration: 020_boletim.sql
-- ============================================

-- 1. Períodos de avaliação (trimestres)
CREATE TABLE grading_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  number SMALLINT NOT NULL CHECK (number BETWEEN 1 AND 4),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (school_id, academic_year_id, number)
);

CREATE INDEX idx_grading_periods_school ON grading_periods (school_id, academic_year_id);

ALTER TABLE grading_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grading_periods_select" ON grading_periods
  FOR SELECT USING (school_id = get_my_school_id());

CREATE POLICY "grading_periods_insert" ON grading_periods
  FOR INSERT WITH CHECK (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

CREATE POLICY "grading_periods_update" ON grading_periods
  FOR UPDATE USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

CREATE POLICY "grading_periods_delete" ON grading_periods
  FOR DELETE USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

-- 2. Categorias de avaliação (Prova, Trabalho, etc.)
CREATE TABLE assignment_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 1 CHECK (weight > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (school_id, name)
);

CREATE INDEX idx_assignment_categories_school ON assignment_categories (school_id);

ALTER TABLE assignment_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignment_categories_select" ON assignment_categories
  FOR SELECT USING (school_id = get_my_school_id());

CREATE POLICY "assignment_categories_insert" ON assignment_categories
  FOR INSERT WITH CHECK (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

CREATE POLICY "assignment_categories_update" ON assignment_categories
  FOR UPDATE USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

CREATE POLICY "assignment_categories_delete" ON assignment_categories
  FOR DELETE USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

-- 3. Adicionar category_id na tabela de atividades
ALTER TABLE assignments ADD COLUMN category_id UUID REFERENCES assignment_categories(id) ON DELETE SET NULL;

-- 4. Boletim (nota final por aluno × disciplina × período)
CREATE TABLE report_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  grading_period_id UUID NOT NULL REFERENCES grading_periods(id) ON DELETE CASCADE,
  calculated_average NUMERIC,
  final_grade NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (student_id, class_id, subject_id, grading_period_id)
);

CREATE INDEX idx_report_cards_school ON report_cards (school_id);
CREATE INDEX idx_report_cards_class_period ON report_cards (class_id, grading_period_id);
CREATE INDEX idx_report_cards_student ON report_cards (student_id);

ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;

-- Todos da escola podem ler (front filtra status='approved' para alunos)
CREATE POLICY "report_cards_select" ON report_cards
  FOR SELECT USING (school_id = get_my_school_id());

-- Professor e admin podem inserir
CREATE POLICY "report_cards_insert" ON report_cards
  FOR INSERT WITH CHECK (
    school_id = get_my_school_id()
    AND get_my_role() IN ('admin', 'teacher')
  );

-- Professor e admin podem atualizar
CREATE POLICY "report_cards_update" ON report_cards
  FOR UPDATE USING (
    school_id = get_my_school_id()
    AND get_my_role() IN ('admin', 'teacher')
  );

-- Apenas admin pode deletar
CREATE POLICY "report_cards_delete" ON report_cards
  FOR DELETE USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

-- Trigger updated_at para report_cards
CREATE TRIGGER report_cards_updated_at
  BEFORE UPDATE ON report_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

NOTIFY pgrst, 'reload schema';
