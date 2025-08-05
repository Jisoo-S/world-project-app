import { createClient } from '@supabase/supabase-js'

// Vercel 환경 변수 사용 (로컬 개발 시에는 직접 입력한 값 사용)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://yovklqjyamfpdtdeexhg.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdmtscWp5YW1mcGR0ZGVleGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTQ0NjIsImV4cCI6MjA2OTYzMDQ2Mn0.-UKlxsNVlaEdTCpQM0N48frWGgJ4LM_ML0SAUpMUScs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});