-- Tópicos BNCC vinculados a disciplinas
CREATE TABLE IF NOT EXISTS subject_bncc_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  bncc_code TEXT, -- código BNCC ex: EF06MA01
  grade_level TEXT, -- ex: "1-5", "6-9", "1-9"
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bncc_topics_subject ON subject_bncc_topics(subject_id);
CREATE INDEX idx_bncc_topics_school ON subject_bncc_topics(school_id);

-- RLS
ALTER TABLE subject_bncc_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_bncc_topics" ON subject_bncc_topics
  FOR SELECT USING (school_id = get_my_school_id());

CREATE POLICY "insert_bncc_topics" ON subject_bncc_topics
  FOR INSERT WITH CHECK (
    school_id = get_my_school_id()
    AND get_my_role() IN ('admin', 'pedagogue')
  );

CREATE POLICY "update_bncc_topics" ON subject_bncc_topics
  FOR UPDATE USING (
    school_id = get_my_school_id()
    AND get_my_role() IN ('admin', 'pedagogue')
  );

CREATE POLICY "delete_bncc_topics" ON subject_bncc_topics
  FOR DELETE USING (
    school_id = get_my_school_id()
    AND get_my_role() IN ('admin', 'pedagogue')
  );
