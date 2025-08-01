import { createClient } from '@supabase/supabase-js'

// 이 값들을 Supabase 프로젝트에서 가져온 실제 값으로 변경하세요
const supabaseUrl = 'https://yovklqjyamfpdtdeexhg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdmtscWp5YW1mcGR0ZGVleGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTQ0NjIsImV4cCI6MjA2OTYzMDQ2Mn0.-UKlxsNVlaEdTCpQM0N48frWGgJ4LM_ML0SAUpMUScs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
