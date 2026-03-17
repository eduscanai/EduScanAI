-- ============================================================
-- Migration 025: Limpar disciplinas - manter apenas nomes BNCC
-- ============================================================
-- Disciplinas BNCC oficiais:
-- Língua Portuguesa, Matemática, Ciências, História, Geografia,
-- Língua Inglesa, Educação Física, Arte, Ensino Religioso,
-- Física, Química, Biologia, Sociologia, Filosofia

-- ============================================================
-- 1. Corrigir aliases: transferir referências e deletar duplicadas
-- ============================================================

-- Função auxiliar para mergear disciplinas duplicadas
CREATE OR REPLACE FUNCTION merge_disciplina(old_name TEXT, new_name TEXT)
RETURNS VOID AS $$
DECLARE
  _old_id UUID;
  _new_id UUID;
  _school_id UUID;
BEGIN
  -- Para cada escola que tenha a disciplina com nome antigo
  FOR _school_id, _old_id IN
    SELECT school_id, id FROM disciplinas WHERE name = old_name
  LOOP
    -- Buscar a disciplina com nome novo na mesma escola
    SELECT id INTO _new_id FROM disciplinas
    WHERE school_id = _school_id AND name = new_name;

    -- Se não existe a versão BNCC, apenas renomear
    IF _new_id IS NULL THEN
      UPDATE disciplinas SET name = new_name WHERE id = _old_id;
      CONTINUE;
    END IF;

    -- Se ambas existem, transferir referências da antiga para a nova

    -- turma_professores: ON CONFLICT ignore
    UPDATE turma_professores SET subject_id = _new_id
    WHERE subject_id = _old_id
    AND NOT EXISTS (
      SELECT 1 FROM turma_professores tp2
      WHERE tp2.class_id = turma_professores.class_id
        AND tp2.teacher_id = turma_professores.teacher_id
        AND tp2.subject_id = _new_id
    );
    DELETE FROM turma_professores WHERE subject_id = _old_id;

    -- atividades
    UPDATE atividades SET subject_id = _new_id WHERE subject_id = _old_id;

    -- grade_curricular: ON CONFLICT ignore
    UPDATE grade_curricular SET subject_id = _new_id
    WHERE subject_id = _old_id
    AND NOT EXISTS (
      SELECT 1 FROM grade_curricular gc2
      WHERE gc2.school_id = grade_curricular.school_id
        AND gc2.grade_level = grade_curricular.grade_level
        AND gc2.subject_id = _new_id
    );
    DELETE FROM grade_curricular WHERE subject_id = _old_id;

    -- boletins: ON CONFLICT ignore
    UPDATE boletins SET subject_id = _new_id
    WHERE subject_id = _old_id
    AND NOT EXISTS (
      SELECT 1 FROM boletins b2
      WHERE b2.student_id = boletins.student_id
        AND b2.class_id = boletins.class_id
        AND b2.subject_id = _new_id
        AND b2.grading_period_id = boletins.grading_period_id
    );
    DELETE FROM boletins WHERE subject_id = _old_id;

    -- bncc_topicos (CASCADE vai deletar bncc_habilidades)
    DELETE FROM bncc_topicos WHERE subject_id = _old_id;

    -- Deletar a disciplina antiga
    DELETE FROM disciplinas WHERE id = _old_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar merges de aliases conhecidos
SELECT merge_disciplina('Artes', 'Arte');
SELECT merge_disciplina('Português', 'Língua Portuguesa');
SELECT merge_disciplina('Lingua Portuguesa', 'Língua Portuguesa');
SELECT merge_disciplina('Inglês', 'Língua Inglesa');
SELECT merge_disciplina('Lingua Inglesa', 'Língua Inglesa');
SELECT merge_disciplina('Ed. Física', 'Educação Física');
SELECT merge_disciplina('Ed Física', 'Educação Física');
SELECT merge_disciplina('Educacao Fisica', 'Educação Física');
SELECT merge_disciplina('Religião', 'Ensino Religioso');

-- ============================================================
-- 2. Deletar disciplinas que não são BNCC
-- (transferir referências para NULL antes de deletar)
-- ============================================================

-- Setar subject_id = NULL em atividades de disciplinas não-BNCC
UPDATE atividades SET subject_id = NULL
WHERE subject_id IN (
  SELECT id FROM disciplinas
  WHERE name NOT IN (
    'Língua Portuguesa', 'Matemática', 'Ciências', 'História',
    'Geografia', 'Língua Inglesa', 'Educação Física', 'Arte',
    'Ensino Religioso', 'Física', 'Química', 'Biologia',
    'Sociologia', 'Filosofia'
  )
);

-- Deletar disciplinas não-BNCC (CASCADE cuida do resto)
DELETE FROM disciplinas
WHERE name NOT IN (
  'Língua Portuguesa', 'Matemática', 'Ciências', 'História',
  'Geografia', 'Língua Inglesa', 'Educação Física', 'Arte',
  'Ensino Religioso', 'Física', 'Química', 'Biologia',
  'Sociologia', 'Filosofia'
);

-- ============================================================
-- 3. Limpar função auxiliar
-- ============================================================
DROP FUNCTION IF EXISTS merge_disciplina(TEXT, TEXT);

-- Recarregar schema
NOTIFY pgrst, 'reload schema';
