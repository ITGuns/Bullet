// Form validation functions
const validators = {
    fullName: (value) => {
        if (!value) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s-']+$/.test(value)) return 'Name can only contain letters, spaces, hyphens and apostrophes';
        return '';
    },
    email: (value) => {
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
    },
    phone: (value) => {
        if (!value) return 'Phone number is required';
        if (!/^[\d\s-+()]+$/.test(value)) return 'Please enter a valid phone number';
        if (value.replace(/[\D]/g, '').length < 10) return 'Phone number must have at least 10 digits';
        return '';
    },
    dob: (value) => {
        if (!value) return 'Date of birth is required';
        const date = new Date(value);
        const now = new Date();
        const age = Math.floor((now - date) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 18) return 'You must be at least 18 years old';
        if (age > 100) return 'Please enter a valid date of birth';
        return '';
    },
    education: (value) => {
        if (!value) return 'Education is required';
        if (value.length < 5) return 'Please provide more details about your education';
        return '';
    },
    position: (value) => {
        if (!value) return 'Position is required';
        return '';
    },
    resume: (file) => {
        if (!file) return 'Resume is required';
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) return 'Please upload a PDF or Word document';
        if (file.size > 5 * 1024 * 1024) return 'File size must be less than 5MB';
        return '';
    }
};

// Function to validate all form fields
function validateForm(formData) {
    const errors = {};
    let hasErrors = false;

    // Validate each field
    for (const [field, validator] of Object.entries(validators)) {
        const value = field === 'resume' ? formData.get(field) : formData.get(field)?.trim();
        const error = validator(value);
        if (error) {
            errors[field] = error;
            hasErrors = true;
        }
    }

    return { isValid: !hasErrors, errors };
}

// Function to display validation errors
function displayErrors(errors) {
    // Clear all existing error messages
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));

    // Display new error messages
    for (const [field, message] of Object.entries(errors)) {
        const input = document.getElementById(field);
        if (input) {
            input.classList.add('error-field');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            input.parentNode.insertBefore(errorDiv, input.nextSibling);
        }
    }
}