import { createClient } from '@supabase/supabase-js'

// Direct connection URL from your Supabase dashboard
const supabaseUrl = 'https://siyulhaedbbhvwggttkl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeXVsaGFlZGJiaHZ3Z2d0dGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3OTE5MTIsImV4cCI6MjA1ODM2NzkxMn0.CgOAjYqeZLnJIZOVx7gVkoHQjfiuu-Ai6IKhlJ95ldE'

const supabase = createClient(supabaseUrl, supabaseKey)

// Test connection
async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('applications')
            .select('count')
            .single();
            
        if (error) {
            console.error('Connection error:', error);
            return false;
        }
        console.log('Successfully connected to Supabase');
        return true;
    } catch (error) {
        console.error('Test connection failed:', error);
        return false;
    }
}

// Run test when file loads
testConnection();

export { supabase }
