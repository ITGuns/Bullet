import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://siyulhaedbbhvwggttkl.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeXVsaGFlZGJiaHZ3Z2d0dGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3OTE5MTIsImV4cCI6MjA1ODM2NzkxMn0.CgOAjYqeZLnJIZOVx7gVkoHQjfiuu-Ai6IKhlJ95ldE'

const supabase = createClient(supabaseUrl, supabaseKey)

// Test connection with more detailed error handling
async function testConnection() {
    try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .limit(1);
            
        if (error) {
            console.error('Connection error:', error.message);
            console.error('Error details:', error);
            return false;
        }
        console.log('Successfully connected to Supabase');
        return true;
    } catch (error) {
        console.error('Test connection failed:', error.message);
        return false;
    }
}

// Run test when file loads
testConnection();

export { supabase }
