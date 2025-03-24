import { supabase } from './supabase-config.js'

async function handleApplicationSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const file = formData.get('resume');

    try {
        // Upload resume file
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: fileData, error: fileError } = await supabase.storage
            .from('resumes')
            .upload(fileName, file);

        if (fileError) throw fileError;

        // Save application data
        const { data, error } = await supabase
            .from('applications')
            .insert([
                {
                    full_name: formData.get('fullName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    position: formData.get('position'),
                    resume_url: fileData.path
                }
            ]);

        if (error) throw error;
        
        alert('Application submitted successfully!');
        event.target.reset();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to submit application. Please try again.');
    }
}

// Add event listener to form
document.getElementById('applicationForm').addEventListener('submit', handleApplicationSubmit);