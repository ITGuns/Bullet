// Carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.querySelector('.carousel-dots');
    let currentSlide = 0;

    // Create dots for each slide
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    function goToSlide(n) {
        slides[currentSlide].classList.remove('active');
        document.querySelectorAll('.dot')[currentSlide].classList.remove('active');
        
        currentSlide = n;
        
        slides[currentSlide].classList.add('active');
        document.querySelectorAll('.dot')[currentSlide].classList.add('active');
    }

    function nextSlide() {
        goToSlide((currentSlide + 1) % slides.length);
    }

    // Auto advance slides every 5 seconds
    setInterval(nextSlide, 5000);
});

// Form submission and consent modal handling
document.addEventListener('DOMContentLoaded', function() {
    const applicationForm = document.getElementById('applicationForm');
    const consentModal = document.getElementById('consentModal');
    
    if (applicationForm && consentModal) {
        // Show consent modal when initial submit is clicked
        applicationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            consentModal.style.display = 'flex';
        });

        // Handle final submission
        const btnAgree = document.querySelector('.btn-agree');
        if (btnAgree) {
            btnAgree.addEventListener('click', function() {
                const consentCheckbox = document.getElementById('consentCheckbox');
                
                if (!consentCheckbox || !consentCheckbox.checked) {
                    alert('Please agree to the terms before submitting.');
                    return;
                }

                // Get form data
                const formData = {
                    fullName: document.getElementById('fullName').value,
                    email: document.getElementById('email').value,
                    gender: document.getElementById('gender').value,
                    dob: document.getElementById('dob').value,
                    age: document.getElementById('age').value,
                    address: document.getElementById('address').value,
                    phone: document.getElementById('phone').value,
                    education: document.getElementById('education').value,
                    position: document.getElementById('position').value,
                    dateApplied: new Date().toISOString(),
                    status: 'New'
                };

                // Handle form submission with file upload
                const formDataToSend = new FormData();
                Object.entries(formData).forEach(([key, value]) => {
                    formDataToSend.append(key, value);
                });

                const resumeFile = document.getElementById('resume').files[0];
                if (resumeFile) {
                    formDataToSend.append('resume', resumeFile);
                }
                saveApplication(formDataToSend);
            });
        }

        // Cancel button handler
        const btnCancel = document.querySelector('.btn-cancel');
        if (btnCancel) {
            btnCancel.addEventListener('click', function() {
                consentModal.style.display = 'none';
                const consentCheckbox = document.getElementById('consentCheckbox');
                if (consentCheckbox) {
                    consentCheckbox.checked = false;
                }
            });
        }

        async function saveApplication(formData) {
            try {
                // Submit form data to Netlify
                const response = await fetch('/', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to submit application');
                }

                // Update HR dashboard
                const applications = JSON.parse(localStorage.getItem('applications') || '[]');
                const resumeFile = formData.get('resume');
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    applications.unshift({
                        fullName: formData.get('fullName'),
                        email: formData.get('email'),
                        gender: formData.get('gender'),
                        dob: formData.get('dob'),
                        age: formData.get('age'),
                        phone: formData.get('phone'),
                        education: formData.get('education'),
                        position: formData.get('position'),
                        dateApplied: new Date().toISOString(),
                        status: 'New',
                        resumeData: e.target.result,
                        resumeFileName: resumeFile.name
                    });
                    localStorage.setItem('applications', JSON.stringify(applications));
                };
                
                if (resumeFile) {
                    reader.readAsDataURL(resumeFile);
                }
                localStorage.setItem('applications', JSON.stringify(applications));

                // Close modal and show success message
                consentModal.style.display = 'none';
                alert('Application submitted successfully!');
                applicationForm.reset();
            } catch (error) {
                console.error('Error:', error);
                alert(error.message || 'Failed to submit application. Please try again.');
            }
        }
    }
});
