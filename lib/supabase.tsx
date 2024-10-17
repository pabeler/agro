import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://retbvrtntihuepnbhbdm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJldGJ2cnRudGlodWVwbmJoYmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwOTc3MzIsImV4cCI6MjA0NDY3MzczMn0.1nbU_O_47B1L_2ba136fTnKjH2ULfKid5DYuta7BB8E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})