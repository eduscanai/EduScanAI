-- ============================================
-- EduScanAI - Base Schema
-- Migration: 001_base_schema.sql
-- ============================================

-- 1. schools
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. profiles (referencia auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'pedagogue', 'teacher', 'student')),
  avatar_url TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_school_id ON profiles (school_id);

-- 3. academic_years
CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false
);

CREATE INDEX idx_academic_years_school_id ON academic_years (school_id);

-- 4. subjects
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT
);

CREATE INDEX idx_subjects_school_id ON subjects (school_id);

-- 5. classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools ON DELETE CASCADE,
  academic_year_id UUID REFERENCES academic_years ON DELETE SET NULL,
  name TEXT NOT NULL,
  grade_level TEXT,
  shift TEXT CHECK (shift IN ('morning', 'afternoon', 'evening'))
);

CREATE INDEX idx_classes_school_id ON classes (school_id);
CREATE INDEX idx_classes_academic_year_id ON classes (academic_year_id);

-- 6. class_students
CREATE TABLE class_students (
  class_id UUID NOT NULL REFERENCES classes ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (class_id, student_id)
);

CREATE INDEX idx_class_students_student_id ON class_students (student_id);

-- 7. class_teachers
CREATE TABLE class_teachers (
  class_id UUID NOT NULL REFERENCES classes ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects ON DELETE CASCADE,
  PRIMARY KEY (class_id, teacher_id, subject_id)
);

CREATE INDEX idx_class_teachers_teacher_id ON class_teachers (teacher_id);
CREATE INDEX idx_class_teachers_subject_id ON class_teachers (subject_id);
