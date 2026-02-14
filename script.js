// Landing page script
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const addNewButton = document.getElementById('addNewButton');
    
    // Search functionality with debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query === '') {
            searchResults.style.display = 'none';
            return;
        }
        
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
    
    // Add new location button
    addNewButton.addEventListener('click', function() {
        // Redirect to detail page in "add new" mode
        window.location.href = 'detail.html?mode=new';
    });
    
    // Perform search
    function performSearch(query) {
        const results = db.search(query);
        displayResults(results);
    }
    
    // Display search results
    function displayResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No matching addresses found</div>';
            searchResults.style.display = 'block';
            return;
        }
        
        let html = '';
        results.forEach(location => {
            const preview = getPreview(location.content);
            html += `
                <div class="result-item" onclick="goToDetail('${location.id}')">
                    <div class="result-address">${escapeHtml(location.address)}</div>
                    ${preview ? `<div class="result-preview">${escapeHtml(preview)}</div>` : ''}
                </div>
            `;
        });
        
        searchResults.innerHTML = html;
        searchResults.style.display = 'block';
    }
    
    // Get preview text from content
    function getPreview(content) {
        if (!content || content.length === 0) return '';
        
        // Find first text block
        const textBlock = content.find(block => block.type === 'text');
        if (textBlock && textBlock.data) {
            // Truncate to 150 characters
            return textBlock.data.length > 150 
                ? textBlock.data.substring(0, 150) + '...' 
                : textBlock.data;
        }
        
        return 'Click to view details';
    }
    
    // Navigate to detail page
    window.goToDetail = function(locationId) {
        window.location.href = `detail.html?id=${encodeURIComponent(locationId)}`;
    };
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            // Don't hide if clicking add button
            if (!addNewButton.contains(e.target)) {
                setTimeout(() => {
                    searchResults.style.display = 'none';
                }, 200);
            }
        }
    });
});
