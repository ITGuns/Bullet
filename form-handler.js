import { supabase } from './supabase-config.js'

async function handleApplicationSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const file = formData.get('resume');

    // Add detailed debug logs
    console.log('Form data:', Object.fromEntries(formData));
    console.log('Resume file:', file);

    try {
        // Upload resume file
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        console.log('Attempting to upload file:', fileName);
        const { data: fileData, error: fileError } = await supabase.storage
            .from('resumes')
            .upload(fileName, file);

        console.log('File upload response:', { fileData, fileError });
        if (fileError) throw fileError;

        // Save application data
        console.log('Attempting to save application data');
        const { data, error } = await supabase
            .from('applications')
            .insert([
                {
                    full_name: formData.get('fullName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    position: formData.get('position'),
                    resume_url: fileData.path,
                    status: 'pending',  // Add default status
                    created_at: new Date().toISOString()  // Add timestamp
                }
            ]);

        console.log('Database insert response:', { data, error });
        if (error) throw error;
        
        alert('Application submitted successfully!');
        event.target.reset();

    } catch (error) {
        console.error('Detailed error:', error);
        alert('Failed to submit application. Please try again.');
    }
}

// Add event listener to form
document.getElementById('applicationForm').addEventListener('submit', handleApplicationSubmit);
