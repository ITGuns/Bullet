import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = 'https://siyulhaedbbhvwggttkl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeXVsaGFlZGJiaHZ3Z2d0dGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3OTE5MTIsImV4cCI6MjA1ODM2NzkxMn0.CgOAjYqeZLnJIZOVx7gVkoHQjfiuu-Ai6IKhlJ95ldE'
const supabase = createClient(supabaseUrl, supabaseKey)

async function loadApplications() {
    try {
        console.log('Fetching applications...');
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });

        console.log('Fetch result:', { data, error });

        if (error) {
            console.error('Error fetching applications:', error);
            return;
        }

        // Update statistics
        document.getElementById('totalApplications').textContent = data ? data.length : 0;
        document.getElementById('newApplications').textContent = data ? data.filter(app => app.status === 'pending').length : 0;
        document.getElementById('shortlistedApplications').textContent = data ? data.filter(app => app.status === 'reviewing').length : 0;

        const tableBody = document.getElementById('applicationsTableBody');
        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No applications found</td></tr>';
            return;
        }

        tableBody.innerHTML = data.map(app => `
            <tr>
                <td>${app.full_name || 'N/A'}</td>
                <td>${app.position || 'N/A'}</td>
                <td>${app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <select onchange="updateStatus('${app.id}', this.value)">
                        <option value="pending" ${app.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="reviewing" ${app.status === 'reviewing' ? 'selected' : ''}>Reviewing</option>
                        <option value="interviewed" ${app.status === 'interviewed' ? 'selected' : ''}>Interviewed</option>
                        <option value="accepted" ${app.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                        <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </td>
                <td>
                    <a href="${app.resume_url}" target="_blank" class="action-btn">
                        <i class="fas fa-download"></i>
                    </a>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Load applications when page loads
document.addEventListener('DOMContentLoaded', loadApplications);

// Make functions available globally
window.updateStatus = updateStatus;
window.downloadAllApplications = downloadAllApplications;

async function updateStatus(id, status) {
    try {
        const { error } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
        loadApplications(); // Refresh the display
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

// Handle download all
window.downloadAllApplications = async function() {
    try {
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const csvContent = "data:text/csv;charset=utf-8," 
            + "Name,Position,Email,Phone,Status,Date Applied\n"
            + data.map(app => `${app.full_name},${app.position},${app.email},${app.phone},${app.status},${new Date(app.created_at).toLocaleDateString()}`).join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "applications.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading applications:', error);
    }
};
