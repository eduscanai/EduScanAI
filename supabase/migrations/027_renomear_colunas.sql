-- ============================================================
-- Migration 027: Renomear colunas para português
-- Tabelas: atividades, envios
-- ============================================================

-- ===================== ATIVIDADES =====================

ALTER TABLE atividades RENAME COLUMN school_id TO escola_id;
ALTER TABLE atividades RENAME COLUMN class_id TO turma_id;
ALTER TABLE atividades RENAME COLUMN subject_id TO disciplina_id;
ALTER TABLE atividades RENAME COLUMN category_id TO categoria_id;
ALTER TABLE atividades RENAME COLUMN grading_period_id TO periodo_id;
ALTER TABLE atividades RENAME COLUMN teacher_id TO professor_id;
ALTER TABLE atividades RENAME COLUMN title TO titulo;
ALTER TABLE atividades RENAME COLUMN description TO descricao;
ALTER TABLE atividades RENAME COLUMN due_date TO data_entrega;
ALTER TABLE atividades RENAME COLUMN max_score TO nota_maxima;
ALTER TABLE atividades RENAME COLUMN published_at TO publicado_em;
ALTER TABLE atividades RENAME COLUMN attachments TO anexos;
ALTER TABLE atividades RENAME COLUMN created_at TO criado_em;
ALTER TABLE atividades RENAME COLUMN updated_at TO atualizado_em;

-- ===================== ENVIOS =====================

ALTER TABLE envios RENAME COLUMN assignment_id TO atividade_id;
ALTER TABLE envios RENAME COLUMN student_id TO aluno_id;
ALTER TABLE envios RENAME COLUMN content TO conteudo;
ALTER TABLE envios RENAME COLUMN attachments TO anexos;
ALTER TABLE envios RENAME COLUMN submitted_at TO enviado_em;
ALTER TABLE envios RENAME COLUMN score TO nota;
ALTER TABLE envios RENAME COLUMN graded_at TO corrigido_em;
ALTER TABLE envios RENAME COLUMN graded_by TO corrigido_por;
ALTER TABLE envios RENAME COLUMN feedback TO comentario;

-- ===================== RLS ATIVIDADES =====================
-- Dropar todas as policies e recriar com nomes novos

DROP POLICY IF EXISTS "assignments_select_admin_pedagogue" ON atividades;
DROP POLICY IF EXISTS "assignments_select_teacher" ON atividades;
DROP POLICY IF EXISTS "assignments_select_student" ON atividades;
DROP POLICY IF EXISTS "assignments_insert" ON atividades;
DROP POLICY IF EXISTS "assignments_update" ON atividades;
DROP POLICY IF EXISTS "assignments_delete_draft" ON atividades;

CREATE POLICY "atividades_select_admin_pedagogue" ON atividades
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue')
    AND escola_id = get_my_school_id()
  );

CREATE POLICY "atividades_select_teacher" ON atividades
  FOR SELECT USING (
    get_my_role() = 'teacher'
    AND turma_id IN (
      SELECT class_id FROM turma_professores WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "atividades_select_student" ON atividades
  FOR SELECT USING (
    get_my_role() = 'student'
    AND status = 'published'
    AND visivel_aluno = true
    AND turma_id IN (
      SELECT class_id FROM turma_alunos WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "atividades_insert" ON atividades
  FOR INSERT WITH CHECK (
    get_my_role() IN ('admin', 'teacher')
    AND escola_id = get_my_school_id()
    AND professor_id = auth.uid()
  );

CREATE POLICY "atividades_update" ON atividades
  FOR UPDATE USING (
    professor_id = auth.uid()
    OR (get_my_role() = 'admin' AND escola_id = get_my_school_id())
  );

CREATE POLICY "atividades_delete_draft" ON atividades
  FOR DELETE USING (
    status = 'draft'
    AND (
      professor_id = auth.uid()
      OR (get_my_role() = 'admin' AND escola_id = get_my_school_id())
    )
  );

-- ===================== RLS ENVIOS =====================

DROP POLICY IF EXISTS "submissions_select_own" ON envios;
DROP POLICY IF EXISTS "submissions_select_teacher" ON envios;
DROP POLICY IF EXISTS "submissions_insert_student" ON envios;
DROP POLICY IF EXISTS "submissions_update_student" ON envios;
DROP POLICY IF EXISTS "submissions_update_teacher" ON envios;
DROP POLICY IF EXISTS "submissions_delete_student" ON envios;

CREATE POLICY "envios_select_own" ON envios
  FOR SELECT USING (aluno_id = auth.uid());

CREATE POLICY "envios_select_teacher" ON envios
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND atividade_id IN (
      SELECT id FROM atividades
      WHERE professor_id = auth.uid()
        OR (escola_id = get_my_school_id() AND get_my_role() IN ('admin', 'pedagogue'))
    )
  );

CREATE POLICY "envios_insert_student" ON envios
  FOR INSERT WITH CHECK (
    aluno_id = auth.uid()
    AND atividade_id IN (
      SELECT a.id FROM atividades a
      JOIN turma_alunos cs ON cs.class_id = a.turma_id
      WHERE cs.student_id = auth.uid()
        AND a.status = 'published'
    )
  );

CREATE POLICY "envios_update_student" ON envios
  FOR UPDATE USING (
    aluno_id = auth.uid() AND corrigido_em IS NULL
  );

CREATE POLICY "envios_update_teacher" ON envios
  FOR UPDATE USING (
    get_my_role() IN ('admin', 'teacher')
    AND atividade_id IN (
      SELECT id FROM atividades
      WHERE professor_id = auth.uid()
        OR (escola_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

CREATE POLICY "envios_delete_student" ON envios
  FOR DELETE USING (
    aluno_id = auth.uid() AND corrigido_em IS NULL
  );

-- ===================== RLS TOPICOS =====================
-- Recriar policies que referenciam colunas renomeadas

DROP POLICY IF EXISTS "topicos_select" ON topicos_atividade;
DROP POLICY IF EXISTS "topicos_insert" ON topicos_atividade;
DROP POLICY IF EXISTS "topicos_update" ON topicos_atividade;
DROP POLICY IF EXISTS "topicos_delete" ON topicos_atividade;

CREATE POLICY "topicos_select" ON topicos_atividade
  FOR SELECT USING (
    atividade_id IN (SELECT id FROM atividades)
  );

CREATE POLICY "topicos_insert" ON topicos_atividade
  FOR INSERT WITH CHECK (
    atividade_id IN (
      SELECT id FROM atividades
      WHERE professor_id = auth.uid()
        OR (escola_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

CREATE POLICY "topicos_update" ON topicos_atividade
  FOR UPDATE USING (
    atividade_id IN (
      SELECT id FROM atividades
      WHERE professor_id = auth.uid()
        OR (escola_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

CREATE POLICY "topicos_delete" ON topicos_atividade
  FOR DELETE USING (
    atividade_id IN (
      SELECT id FROM atividades
      WHERE professor_id = auth.uid()
        OR (escola_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

-- ===================== RLS CORRECOES_IA =====================

DROP POLICY IF EXISTS "correcoes_ia_select_student" ON correcoes_ia;
DROP POLICY IF EXISTS "correcoes_ia_select_staff" ON correcoes_ia;

CREATE POLICY "correcoes_ia_select_student" ON correcoes_ia
  FOR SELECT USING (
    envio_id IN (
      SELECT id FROM envios WHERE aluno_id = auth.uid()
    )
  );

CREATE POLICY "correcoes_ia_select_staff" ON correcoes_ia
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND envio_id IN (
      SELECT s.id FROM envios s
      JOIN atividades a ON a.id = s.atividade_id
      WHERE a.professor_id = auth.uid()
        OR (a.escola_id = get_my_school_id() AND get_my_role() IN ('admin', 'pedagogue'))
    )
  );

-- ===================== RLS DESEMPENHO =====================

DROP POLICY IF EXISTS "desempenho_select_student" ON desempenho_topico;
DROP POLICY IF EXISTS "desempenho_select_staff" ON desempenho_topico;

CREATE POLICY "desempenho_select_student" ON desempenho_topico
  FOR SELECT USING (
    correcao_id IN (
      SELECT c.id FROM correcoes_ia c
      JOIN envios s ON s.id = c.envio_id
      WHERE s.aluno_id = auth.uid()
    )
  );

CREATE POLICY "desempenho_select_staff" ON desempenho_topico
  FOR SELECT USING (
    get_my_role() IN ('admin', 'pedagogue', 'teacher')
    AND correcao_id IN (
      SELECT c.id FROM correcoes_ia c
      JOIN envios s ON s.id = c.envio_id
      JOIN atividades a ON a.id = s.atividade_id
      WHERE a.professor_id = auth.uid()
        OR (a.escola_id = get_my_school_id() AND get_my_role() IN ('admin', 'pedagogue'))
    )
  );

-- ===================== RLS ATIVIDADE_HABILIDADES =====================

DROP POLICY IF EXISTS "atividade_habilidades_select" ON atividade_habilidades;
DROP POLICY IF EXISTS "atividade_habilidades_insert" ON atividade_habilidades;
DROP POLICY IF EXISTS "atividade_habilidades_delete" ON atividade_habilidades;

CREATE POLICY "atividade_habilidades_select" ON atividade_habilidades
  FOR SELECT USING (
    atividade_id IN (SELECT id FROM atividades)
  );

CREATE POLICY "atividade_habilidades_insert" ON atividade_habilidades
  FOR INSERT WITH CHECK (
    atividade_id IN (
      SELECT id FROM atividades
      WHERE professor_id = auth.uid()
        OR (escola_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

CREATE POLICY "atividade_habilidades_delete" ON atividade_habilidades
  FOR DELETE USING (
    atividade_id IN (
      SELECT id FROM atividades
      WHERE professor_id = auth.uid()
        OR (escola_id = get_my_school_id() AND get_my_role() = 'admin')
    )
  );

-- ===================== TRIGGERS =====================

CREATE OR REPLACE FUNCTION notify_assignment_published()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'published') THEN
    INSERT INTO notificacoes (user_id, school_id, type, title, message, data)
    SELECT
      cs.student_id,
      NEW.escola_id,
      'assignment',
      'Nova atividade: ' || NEW.titulo,
      'Uma nova atividade foi publicada na sua turma.',
      jsonb_build_object('assignment_id', NEW.id, 'class_id', NEW.turma_id)
    FROM turma_alunos cs
    WHERE cs.class_id = NEW.turma_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
