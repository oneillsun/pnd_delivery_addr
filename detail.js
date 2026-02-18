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

    // Edit button handler - show access code modal
    document.getElementById('editButton').addEventListener('click', showAccessModal);
});

// Initialize new location
async function initNewLocation() {
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
                const existingLocation = await db.findByAddress(placeData.address);

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
async function loadLocation(locationId) {
    const location = await db.getLocation(locationId);

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
                    <div class="format-toolbar">
                        <button type="button" class="format-btn" onclick="formatText(${index}, 'bold')" title="Bold">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                            </svg>
                        </button>
                        <button type="button" class="format-btn" onclick="formatText(${index}, 'italic')" title="Italic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="19" y1="4" x2="10" y2="4"/>
                                <line x1="14" y1="20" x2="5" y2="20"/>
                                <line x1="15" y1="4" x2="9" y2="20"/>
                            </svg>
                        </button>
                        <button type="button" class="format-btn" onclick="formatText(${index}, 'insertUnorderedList')" title="Bullet List">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="8" y1="6" x2="21" y2="6"/>
                                <line x1="8" y1="12" x2="21" y2="12"/>
                                <line x1="8" y1="18" x2="21" y2="18"/>
                                <circle cx="3" cy="6" r="1" fill="currentColor"/>
                                <circle cx="3" cy="12" r="1" fill="currentColor"/>
                                <circle cx="3" cy="18" r="1" fill="currentColor"/>
                            </svg>
                        </button>
                        <button type="button" class="format-btn" onclick="formatText(${index}, 'insertOrderedList')" title="Numbered List">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="10" y1="6" x2="21" y2="6"/>
                                <line x1="10" y1="12" x2="21" y2="12"/>
                                <line x1="10" y1="18" x2="21" y2="18"/>
                                <path d="M3 5v3M3 8h2"/>
                                <path d="M3 11v3M3 14h2"/>
                                <path d="M3 17v3M3 20h2"/>
                            </svg>
                        </button>
                    </div>
                    <div class="block-editor" contenteditable="true" data-index="${index}">${block.data || ''}</div>
                `;
            } else {
                content = `<div class="content-text">${block.data || ''}</div>`;
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

// Format text in editor
window.formatText = function(index, command) {
    const editor = document.querySelector(`.block-editor[data-index="${index}"]`);
    if (!editor) return;

    // Focus the editor first
    editor.focus();

    // Execute the formatting command
    document.execCommand(command, false, null);

    // Update the content block data immediately
    contentBlocks[index].data = editor.innerHTML;
};

// Save content
window.saveContent = async function() {
    // Update text blocks from contenteditable divs
    const editors = document.querySelectorAll('.block-editor');
    editors.forEach(editor => {
        const index = parseInt(editor.dataset.index);
        if (contentBlocks[index]) {
            contentBlocks[index].data = editor.innerHTML;
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

    try {
        // Save to database
        const savedLocation = await db.saveLocation(
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
    } catch (error) {
        console.error('Failed to save location:', error);
        alert('Failed to save content. Please try again.');
    }
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

// Access Code Modal Functions
function showAccessModal() {
    // If already in edit mode, just toggle it off
    if (isEditMode) {
        toggleEditMode();
        return;
    }

    // Show the access modal
    const modal = document.getElementById('accessModal');
    const input = document.getElementById('accessCodeInput');
    const error = document.getElementById('accessError');

    modal.style.display = 'flex';
    input.value = '';
    error.style.display = 'none';

    // Focus on input
    setTimeout(() => input.focus(), 100);

    // Allow Enter key to submit
    input.onkeypress = function(e) {
        if (e.key === 'Enter') {
            validateAccessCode();
        }
    };
}

window.closeAccessModal = function() {
    const modal = document.getElementById('accessModal');
    modal.style.display = 'none';
};

window.validateAccessCode = function() {
    const input = document.getElementById('accessCodeInput');
    const error = document.getElementById('accessError');
    const enteredCode = input.value.trim();

    // Get the location region
    const locationRegion = currentLocation.location || '';

    // Check if we have access codes configured
    if (!window.ACCESS_CODES) {
        console.error('Access codes not loaded');
        alert('Access configuration error. Please refresh the page.');
        return;
    }

    // Get the correct access code for this region
    const correctCode = window.ACCESS_CODES[locationRegion];

    if (!correctCode) {
        console.error('No access code configured for region:', locationRegion);
        alert('No access code configured for this region.');
        return;
    }

    // Validate the entered code
    if (enteredCode === correctCode) {
        // Access granted
        closeAccessModal();
        toggleEditMode();
    } else {
        // Access denied
        error.style.display = 'block';
        input.value = '';
        input.focus();

        // Shake animation is already in CSS
        setTimeout(() => {
            error.style.display = 'none';
        }, 3000);
    }
};
