-- Calendar events table for custom events (meetings, holidays, etc.)
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT true,
  color TEXT DEFAULT '#1132d4',
  type TEXT DEFAULT 'custom' CHECK (type IN ('custom', 'holiday', 'meeting')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Everyone in the school can see events
CREATE POLICY "calendar_events_select" ON calendar_events
  FOR SELECT USING (school_id = get_my_school_id());

-- Only admin can create events
CREATE POLICY "calendar_events_insert" ON calendar_events
  FOR INSERT WITH CHECK (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

-- Only admin can update
CREATE POLICY "calendar_events_update" ON calendar_events
  FOR UPDATE USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );

-- Only admin can delete
CREATE POLICY "calendar_events_delete" ON calendar_events
  FOR DELETE USING (
    school_id = get_my_school_id()
    AND get_my_role() = 'admin'
  );
