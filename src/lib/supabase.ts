import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*
Row Level Security (RLS) SQL Script for Supabase Console:

-- Enable RLS on subjects
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own subjects" ON subjects
  FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on timetable_slots
ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own timetable" ON timetable_slots
  FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on attendance_records
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own attendance logs" ON attendance_records
  FOR ALL USING (auth.uid() = user_id);
*/
