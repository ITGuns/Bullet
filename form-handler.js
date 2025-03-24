import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client directly in form handler
const supabaseUrl = 'https://siyulhaedbbhvwggttkl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeXVsaGFlZGJiaHZ3Z2d0dGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3OTE5MTIsImV4cCI6MjA1ODM2NzkxMn0.CgOAjYqeZLnJIZOVx7gVkoHQjfiuu-Ai6IKhlJ95ldE'
const supabase = createClient(supabaseUrl, supabaseKey)

async function handleApplicationSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const file = formData.get('resume');

    console.log('Form submission started');

    try {
        // Upload resume file
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        console.log('Uploading file:', fileName);
        const { data: fileData, error: fileError } = await supabase.storage
            .from('resumes')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (fileError) {
            console.error('File upload error:', fileError);
            throw fileError;
        }

        console.log('File uploaded successfully:', fileData);

        // Save application data
        const applicationData = {
            full_name: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            position: formData.get('position'),
            resume_url: fileData.path,
            status: 'pending'
        };

        console.log('Saving application:', applicationData);

        const { data, error } = await supabase
            .from('applications')
            .insert([applicationData])
            .select();

        if (error) {
            console.error('Database error:', error);
            throw error;
        }

        console.log('Application saved successfully:', data);
        alert('Application submitted successfully!');
        event.target.reset();

    } catch (error) {
        console.error('Submission error:', error);
        alert('Failed to submit application. Please try again.');
    }
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('applicationForm');
    if (form) {
        form.addEventListener('submit', handleApplicationSubmit);
        console.log('Form handler attached');
    } else {
        console.error('Form not found');
    }
});
