import { supabase } from './supabase-config.js'

async function handleApplicationSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const file = formData.get('resume');

    // Debug logs
    console.log('Submitting form with data:', {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        position: formData.get('position'),
        resume: file?.name
    });

    try {
        // Upload resume file
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        console.log('Uploading file:', fileName);
        const { data: fileData, error: fileError } = await supabase.storage
            .from('resumes')
            .upload(fileName, file);

        console.log('File upload result:', { fileData, fileError });
        if (fileError) throw fileError;

        // Save application data
        const applicationData = {
            full_name: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            position: formData.get('position'),
            resume_url: fileData.path,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        console.log('Saving application data:', applicationData);
        const { data, error } = await supabase
            .from('applications')
            .insert([applicationData])
            .select();

        console.log('Database insert result:', { data, error });
        if (error) throw error;
        
        alert('Application submitted successfully!');
        event.target.reset();

    } catch (error) {
        console.error('Submission error:', error);
        alert('Failed to submit application. Please try again.');
    }
}

// Make sure form exists before adding listener
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('applicationForm');
    if (form) {
        form.addEventListener('submit', handleApplicationSubmit);
        console.log('Form handler attached successfully');
    } else {
        console.error('Application form not found in the document');
    }
});
