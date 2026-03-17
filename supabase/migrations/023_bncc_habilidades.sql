-- Habilidades BNCC vinculadas a unidades temáticas
CREATE TABLE IF NOT EXISTS subject_bncc_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES subject_bncc_topics(id) ON DELETE CASCADE,
  code TEXT, -- código BNCC ex: EF06MA01
  description TEXT NOT NULL,
  grade_level TEXT, -- ex: "6", "6-9", "1-5"
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bncc_skills_topic ON subject_bncc_skills(topic_id);
CREATE INDEX idx_bncc_skills_school ON subject_bncc_skills(school_id);

-- RLS
ALTER TABLE subject_bncc_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_bncc_skills" ON subject_bncc_skills
  FOR SELECT USING (school_id = get_my_school_id());

CREATE POLICY "insert_bncc_skills" ON subject_bncc_skills
  FOR INSERT WITH CHECK (
    school_id = get_my_school_id()
    AND get_my_role() IN ('admin', 'pedagogue')
  );

CREATE POLICY "update_bncc_skills" ON subject_bncc_skills
  FOR UPDATE USING (
    school_id = get_my_school_id()
    AND get_my_role() IN ('admin', 'pedagogue')
  );

CREATE POLICY "delete_bncc_skills" ON subject_bncc_skills
  FOR DELETE USING (
    school_id = get_my_school_id()
    AND get_my_role() IN ('admin', 'pedagogue')
  );
