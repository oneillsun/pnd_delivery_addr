// Detail page script
let currentLocation = null;
let isEditMode = false;
let contentBlocks = [];

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const locationId = urlParams.get('id');
    const mode = urlParams.get('mode');
    
    if (mode === 'new') {
        // New location mode
        initNewLocation();
    } else if (locationId) {
        // View/edit existing location
        loadLocation(locationId);
    } else {
        // No ID provided, go back
        goBack();
    }
    
    // Edit button handler
    document.getElementById('editButton').addEventListener('click', toggleEditMode);
});

// Initialize new location
function initNewLocation() {
    // Check if coming from Google Maps search
    const urlParams = new URLSearchParams(window.location.search);
    const fromGoogle = urlParams.get('from') === 'google';

    if (fromGoogle) {
        // Load data from localStorage
        const selectedPlace = localStorage.getItem('selectedPlace');
        if (selectedPlace) {
            try {
                const placeData = JSON.parse(selectedPlace);

                // Check if this address already exists in the database
                const existingLocation = db.findByAddress(placeData.address);

                if (existingLocation) {
                    // Load existing location data
                    currentLocation = existingLocation;
                    document.getElementById('locationId').textContent = `ID: ${existingLocation.id}`;
                    document.getElementById('locationAddress').textContent = existingLocation.address;
                    contentBlocks = JSON.parse(JSON.stringify(existingLocation.content || []));
                    renderContent();

                    console.log('Loaded existing location from database:', existingLocation.id);
                } else {
                    // New location
                    currentLocation = {
                        id: null,
                        address: placeData.address,
                        name: placeData.name,
                        location: placeData.location,
                        placeId: placeData.placeId,
                        lat: placeData.lat,
                        lng: placeData.lng,
                        content: []
                    };

                    // Display the address as the title
                    document.getElementById('locationAddress').textContent = placeData.address;
                    document.getElementById('contentContainer').innerHTML = '<p class="empty-state">Click Edit to add delivery instructions and notes for this location</p>';

                    // Automatically enter edit mode
                    toggleEditMode();
                }

                // Clear localStorage after using it
                localStorage.removeItem('selectedPlace');

                return;
            } catch (error) {
                console.error('Error parsing selected place data:', error);
            }
        }
    }

    // Default behavior for manual new location
    currentLocation = {
        id: null,
        address: '',
        content: []
    };

    document.getElementById('locationAddress').textContent = 'New Delivery Location';
    document.getElementById('contentContainer').innerHTML = '<p class="empty-state">Click Edit to add content for this location</p>';

    // Automatically enter edit mode
    toggleEditMode();

    // Prompt for address
    promptForAddress();
}

// Prompt for address input
function promptForAddress() {
    const address = prompt('Please enter the delivery address:', '');
    if (address && address.trim()) {
        currentLocation.address = address.trim();
        document.getElementById('locationAddress').textContent = address.trim();
    } else {
        alert('Address is required. Returning to search page.');
        goBack();
    }
}

// Load location data
function loadLocation(locationId) {
    const location = db.getLocation(locationId);
    
    if (!location) {
        alert('Location not found');
        goBack();
        return;
    }
    
    currentLocation = location;
    document.getElementById('locationId').textContent = `ID: ${location.id}`;
    document.getElementById('locationAddress').textContent = location.address;

    contentBlocks = JSON.parse(JSON.stringify(location.content || []));
    renderContent();
}

// Render content blocks
function renderContent() {
    const container = document.getElementById('contentContainer');
    
    if (contentBlocks.length === 0) {
        container.innerHTML = '<p class="empty-state">No content available. Click Edit to add content.</p>';
        return;
    }
    
    let html = '';
    contentBlocks.forEach((block, index) => {
        html += renderBlock(block, index);
    });
    
    container.innerHTML = html;
}

// Render individual content block
function renderBlock(block, index) {
    let content = '';
    
    switch (block.type) {
        case 'text':
            if (isEditMode) {
                content = `
                    <textarea class="block-textarea" data-index="${index}">${escapeHtml(block.data || '')}</textarea>
                `;
            } else {
                content = `<div class="content-text">${escapeHtml(block.data || '').replace(/\n/g, '<br>')}</div>`;
            }
            break;
            
        case 'image':
            if (isEditMode) {
                content = `
                    <input type="file" accept="image/*" onchange="updateImage(${index}, this)" class="image-upload">
                    ${block.data ? `<img src="${block.data}" alt="Location image">` : '<p>No image selected</p>'}
                `;
            } else {
                content = block.data ? `<img src="${block.data}" alt="Location image">` : '<p>No image available</p>';
            }
            break;
            
        case 'video':
            if (isEditMode) {
                content = `
                    <input type="file" accept="video/*" onchange="updateVideo(${index}, this)" class="video-upload">
                    ${block.data ? `<video controls src="${block.data}"></video>` : '<p>No video selected</p>'}
                `;
            } else {
                content = block.data ? `<video controls src="${block.data}"></video>` : '<p>No video available</p>';
            }
            break;
    }
    
    const deleteButton = isEditMode ? `
        <div class="block-controls">
            <button class="block-btn delete-btn" onclick="deleteBlock(${index})">Delete</button>
        </div>
    ` : '';
    
    return `
        <div class="content-block ${isEditMode ? 'editing' : ''}" data-index="${index}">
            ${content}
            ${deleteButton}
        </div>
    `;
}

// Toggle edit mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    const editButton = document.getElementById('editButton');
    const editButtonText = document.getElementById('editButtonText');
    const editPanel = document.getElementById('editPanel');
    
    if (isEditMode) {
        editButton.classList.add('active');
        editButtonText.textContent = 'Editing';
        editPanel.style.display = 'block';
    } else {
        editButton.classList.remove('active');
        editButtonText.textContent = 'Edit';
        editPanel.style.display = 'none';
    }
    
    renderContent();
}

// Add text block
window.addTextBlock = function() {
    contentBlocks.push({
        type: 'text',
        data: ''
    });
    renderContent();
};

// Add image block
window.addImageBlock = function() {
    contentBlocks.push({
        type: 'image',
        data: null
    });
    renderContent();
};

// Add video block
window.addVideoBlock = function() {
    contentBlocks.push({
        type: 'video',
        data: null
    });
    renderContent();
};

// Update image
window.updateImage = function(index, input) {
    const file = input.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            contentBlocks[index].data = e.target.result;
            renderContent();
        };
        reader.readAsDataURL(file);
    }
};

// Update video
window.updateVideo = function(index, input) {
    const file = input.files[0];
    if (file && file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            contentBlocks[index].data = e.target.result;
            renderContent();
        };
        reader.readAsDataURL(file);
    }
};

// Delete block
window.deleteBlock = function(index) {
    if (confirm('Are you sure you want to delete this content block?')) {
        contentBlocks.splice(index, 1);
        renderContent();
    }
};

// Save content
window.saveContent = function() {
    // Update text blocks from textareas
    const textareas = document.querySelectorAll('.block-textarea');
    textareas.forEach(textarea => {
        const index = parseInt(textarea.dataset.index);
        if (contentBlocks[index]) {
            contentBlocks[index].data = textarea.value;
        }
    });
    
    // Check if address needs to be updated for new locations
    if (!currentLocation.id) {
        const address = document.getElementById('locationAddress').textContent;
        if (address === 'New Delivery Location' || !address.trim()) {
            promptForAddress();
            if (!currentLocation.address) {
                return;
            }
        }
    }
    
    // Prepare metadata
    const metadata = {
        name: currentLocation.name || '',
        location: currentLocation.location || '',
        placeId: currentLocation.placeId || '',
        lat: currentLocation.lat || null,
        lng: currentLocation.lng || null
    };

    // Save to database
    const savedLocation = db.saveLocation(
        currentLocation.id,
        currentLocation.address,
        contentBlocks,
        metadata
    );

    currentLocation = savedLocation;

    // Update ID display
    document.getElementById('locationId').textContent = `ID: ${savedLocation.id}`;

    console.log('Location saved with ID:', savedLocation.id);

    alert('Content saved successfully!');
    toggleEditMode();
};

// Cancel edit
window.cancelEdit = function() {
    if (confirm('Discard changes?')) {
        // Reload original content
        if (currentLocation.id) {
            contentBlocks = JSON.parse(JSON.stringify(currentLocation.content || []));
        } else {
            // If new location and canceling, go back
            goBack();
            return;
        }
        toggleEditMode();
    }
};

// Go back to search
window.goBack = function() {
    window.location.href = 'index.html';
};

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
