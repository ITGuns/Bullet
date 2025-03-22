document.addEventListener('DOMContentLoaded', function() {
    loadApplications();
    // Set up real-time updates
    setInterval(loadApplications, 5000); // Check for new applications every 5 seconds
});

function loadApplications() {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const tableBody = document.getElementById('applicationsTableBody');
    
    // Function to check if an application is new
    const isNewApplication = (status) => status.toLowerCase() === 'new';
    updateStatistics(applications);
    
    tableBody.innerHTML = '';
    applications.forEach((app, index) => {
        const row = document.createElement('tr');
        if (app.status === 'New') {
            row.classList.add('new-application');
        }
        row.innerHTML = `
            <td>${app.fullName}</td>
            <td>${app.position}</td>
            <td>${new Date(app.dateApplied).toLocaleDateString()}</td>
            <td>
                <select class="status-select" onchange="updateStatus(${index}, this.value)">
                    <option value="New" ${app.status === 'New' ? 'selected' : ''}>New</option>
                    <option value="Shortlisted" ${app.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
                    <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            </td>
            <td class="action-buttons">
                <button onclick="viewApplication(${index})" class="view-btn" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="downloadResume(${index})" class="download-btn" title="Download Resume">
                    <i class="fas fa-download"></i>
                </button>
                <button onclick="deleteApplication(${index})" class="delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function downloadResume(index) {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const app = applications[index];
    
    if (!app.resumeData || !app.resumeFileName) {
        alert('No resume file available for download');
        return;
    }

    try {
        // Create blob from base64 data
        const byteString = atob(app.resumeData.split(',')[1]);
        const mimeType = app.resumeData.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        // Create and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = app.resumeFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading resume. Please try again.');
    }
}

function downloadAllApplications() {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    
    // Create CSV content
    const headers = ['Full Name', 'Email', 'Gender', 'Date of Birth', 'Age', 'Phone', 'Education', 'Position', 'Status', 'Date Applied'];
    const csvContent = [
        headers.join(','),
        ...applications.map(app => [
            app.fullName,
            app.email,
            app.gender,
            app.dob,
            app.age,
            app.phone,
            app.education,
            app.position,
            app.status,
            new Date(app.dateApplied).toLocaleDateString()
        ].map(field => `"${field}"`).join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications_${new Date().toLocaleDateString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function updateStatus(index, newStatus) {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    applications[index].status = newStatus;
    localStorage.setItem('applications', JSON.stringify(applications));
    loadApplications();
}

function deleteApplication(index) {
    if (confirm('Are you sure you want to delete this application?')) {
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        applications.splice(index, 1);
        localStorage.setItem('applications', JSON.stringify(applications));
        loadApplications();
    }
}

function updateStatistics(applications) {
    document.getElementById('totalApplications').textContent = applications.length;
    document.getElementById('newApplications').textContent = 
        applications.filter(app => app.status === 'New').length;
    document.getElementById('shortlistedApplications').textContent = 
        applications.filter(app => app.status === 'Shortlisted').length;
}

function viewApplication(index) {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const app = applications[index];
    
    const details = `
        Full Name: ${app.fullName}
        Email: ${app.email}
        Gender: ${app.gender}
        Date of Birth: ${app.dob}
        Age: ${app.age}
        Phone: ${app.phone}
        Education: ${app.education}
        Position: ${app.position}
        Status: ${app.status}
        Date Applied: ${new Date(app.dateApplied).toLocaleDateString()}
    `;
    
    alert(details); // You can replace this with a modal for better presentation
}
