import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = 'https://siyulhaedbbhvwggttkl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeXVsaGFlZGJiaHZ3Z2d0dGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3OTE5MTIsImV4cCI6MjA1ODM2NzkxMn0.CgOAjYqeZLnJIZOVx7gVkoHQjfiuu-Ai6IKhlJ95ldE'
const supabase = createClient(supabaseUrl, supabaseKey)

// Function to load and display applications
async function loadApplications() {
    try {
        console.log('Fetching applications...');
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching applications:', error);
            return;
        }

        console.log('Applications data:', data);

        // Update statistics
        document.getElementById('totalApplications').textContent = data ? data.length : 0;
        document.getElementById('newApplications').textContent = data ? data.filter(app => app.status === 'pending').length : 0;
        document.getElementById('shortlistedApplications').textContent = data ? data.filter(app => app.status === 'shortlisted').length : 0;

        // Update table
        const tableBody = document.getElementById('applicationsTableBody');
        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No applications found</td></tr>';
            return;
        }

        tableBody.innerHTML = data.map(app => `
            <tr>
                <td>${app.full_name || 'N/A'}</td>
                <td>${app.position || 'N/A'}</td>
                <td>${new Date(app.created_at).toLocaleDateString()}</td>
                <td>
                    <select onchange="updateApplicationStatus('${app.id}', this.value)">
                        <option value="pending" ${app.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="shortlisted" ${app.status === 'shortlisted' ? 'selected' : ''}>Shortlisted</option>
                        <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </td>
                <td>
                    <a href="${app.resume_url}" target="_blank" class="action-btn" title="Download Resume">
                        <i class="fas fa-download"></i>
                    </a>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

// Function to update application status
async function updateApplicationStatus(id, status) {
    try {
        const { error } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
        await loadApplications(); // Reload the data
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

// Function to download all applications
async function downloadAllApplications() {
    try {
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const csvContent = "data:text/csv;charset=utf-8," 
            + "Name,Email,Phone,Position,Status,Date Applied\n"
            + data.map(app => `${app.full_name},${app.email},${app.phone},${app.position},${app.status},${new Date(app.created_at).toLocaleDateString()}`).join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "applications.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading applications:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadApplications);

// Make functions globally available
window.updateApplicationStatus = updateApplicationStatus;
window.downloadAllApplications = downloadAllApplications;
