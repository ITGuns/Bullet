import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from './cors-config.js'

const supabaseUrl = 'https://siyulhaedbbhvwggttkl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeXVsaGFlZGJiaHZ3Z2d0dGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3OTE5MTIsImV4cCI6MjA1ODM2NzkxMn0.CgOAjYqeZLnJIZOVx7gVkoHQjfiuu-Ai6IKhlJ95ldE'

const supabase = createClient(supabaseUrl, supabaseKey, {
    headers: corsHeaders,
    auth: {
        persistSession: true
    }
})

export { supabase }
