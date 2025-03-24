import { supabase } from './supabase-config.js'

async function loadApplications() {
    try {
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Update statistics
        document.getElementById('totalApplications').textContent = data.length;
        document.getElementById('newApplications').textContent = data.filter(app => app.status === 'pending').length;
        document.getElementById('shortlistedApplications').textContent = data.filter(app => app.status === 'reviewing').length;
        
        displayApplications(data);
    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

function displayApplications(applications) {
    const tableBody = document.getElementById('applicationsTableBody');
    tableBody.innerHTML = applications.map(app => `
        <tr>
            <td>${app.full_name}</td>
            <td>${app.position}</td>
            <td>${new Date(app.created_at).toLocaleDateString()}</td>
            <td>
                <select onchange="updateStatus('${app.id}', this.value)" class="status-select">
                    <option value="pending" ${app.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="reviewing" ${app.status === 'reviewing' ? 'selected' : ''}>Reviewing</option>
                    <option value="interviewed" ${app.status === 'interviewed' ? 'selected' : ''}>Interviewed</option>
                    <option value="accepted" ${app.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                    <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            </td>
            <td>
                <button onclick="viewApplication('${app.id}')" class="action-btn view-btn">
                    <i class="fas fa-eye"></i>
                </button>
                <a href="${app.resume_url}" target="_blank" class="action-btn download-btn">
                    <i class="fas fa-file-download"></i>
                </a>
            </td>
        </tr>
    `).join('');
}

async function updateStatus(applicationId, newStatus) {
    try {
        const { error } = await supabase
            .from('applications')
            .update({ status: newStatus })
            .eq('id', applicationId);

        if (error) throw error;
        loadApplications();
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status. Please try again.');
    }
}

async function downloadAllApplications() {
    try {
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const csvContent = "data:text/csv;charset=utf-8," 
            + "Name,Position,Email,Phone,Status,Date Applied\n"
            + data.map(app => `${app.full_name},${app.position},${app.email},${app.phone},${app.status},${new Date(app.created_at).toLocaleDateString()}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "applications.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading applications:', error);
        alert('Failed to download applications. Please try again.');
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', loadApplications);

// Make functions available globally
window.updateStatus = updateStatus;
window.downloadAllApplications = downloadAllApplications;