// Landing page script
let placesService = null;
let geocoder = null;

// Google Maps initialization callback
window.initMap = function() {
    const mapDiv = document.createElement('div');
    const map = new google.maps.Map(mapDiv);
    placesService = new google.maps.places.PlacesService(map);
    geocoder = new google.maps.Geocoder();
    console.log('Google Maps initialized successfully');
};

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const addNewButton = document.getElementById('addNewButton');
    const locationButtons = document.querySelectorAll('.location-btn');

    let selectedLocation = null;
    let selectedRegion = null;

    // Location button functionality
    locationButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove selected class from all buttons
            locationButtons.forEach(btn => {
                btn.classList.remove('selected');
            });

            // Add selected class to clicked button
            this.classList.add('selected');

            // Store selected location and region
            selectedLocation = this.dataset.location;
            selectedRegion = this.dataset.region;

            // Enable search input
            searchInput.disabled = false;
            searchInput.focus();

            // Update placeholder
            searchInput.placeholder = `Search addresses in ${selectedLocation}...`;
        });
    });

    // Search functionality with debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        if (query === '') {
            searchResults.style.display = 'none';
            return;
        }

        if (!selectedRegion) {
            searchResults.innerHTML = '<div class="no-results">Please select a location first</div>';
            searchResults.style.display = 'block';
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

    // Perform search using Google Maps Places API and local database
    function performSearch(query) {
        // First, search local database
        const dbResults = db.search(query);

        if (!placesService || !geocoder) {
            // Only show database results if Google Maps is not available
            displayResults(dbResults);
            return;
        }

        // Show loading state
        searchResults.innerHTML = '<div class="no-results">Searching...</div>';
        searchResults.style.display = 'block';

        // Search Google Maps
        geocoder.geocode({ address: selectedRegion }, function(regionResults, status) {
            if (status === 'OK' && regionResults[0]) {
                const regionLocation = regionResults[0].geometry.location;
                const bounds = regionResults[0].geometry.bounds ||
                              new google.maps.LatLngBounds(
                                  new google.maps.LatLng(regionLocation.lat() - 0.5, regionLocation.lng() - 0.5),
                                  new google.maps.LatLng(regionLocation.lat() + 0.5, regionLocation.lng() + 0.5)
                              );

                // Search for places within the selected region
                const request = {
                    query: query + ' ' + selectedRegion,
                    bounds: bounds,
                    locationBias: regionLocation
                };

                placesService.textSearch(request, function(results, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        // Sort results by distance from region center
                        const sortedResults = results.map(place => {
                            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                                regionLocation,
                                place.geometry.location
                            );
                            return { ...place, distance };
                        }).sort((a, b) => a.distance - b.distance);

                        // Display both database and Google Maps results
                        displayCombinedResults(dbResults, sortedResults, regionLocation);
                    } else {
                        // Only show database results if Google Maps search fails
                        if (dbResults.length > 0) {
                            displayResults(dbResults);
                        } else {
                            searchResults.innerHTML = '<div class="no-results">No results found in ' + selectedLocation + '</div>';
                            searchResults.style.display = 'block';
                        }
                    }
                });
            } else {
                // Show database results if geocoding fails
                if (dbResults.length > 0) {
                    displayResults(dbResults);
                } else {
                    searchResults.innerHTML = '<div class="no-results">Error geocoding location</div>';
                    searchResults.style.display = 'block';
                }
            }
        });
    }
    
    // Display combined results from database and Google Maps
    function displayCombinedResults(dbResults, googleResults) {
        let html = '';

        // Show database results first (saved locations)
        if (dbResults.length > 0) {
            html += '<div style="padding: 10px; background: #e8f5e9; border-bottom: 2px solid #4caf50; font-weight: 600; color: #2e7d32;">📌 Saved Locations</div>';
            dbResults.forEach(location => {
                const preview = getPreview(location.content);
                html += `
                    <div class="result-item" onclick="goToDetail('${location.id}')" style="background: #f1f8f4;">
                        <div class="result-address">${escapeHtml(location.address)}</div>
                        ${preview ? `<div class="result-preview">${escapeHtml(preview)}</div>` : '<div class="result-preview">Saved delivery location</div>'}
                    </div>
                `;
            });
        }

        // Show Google Maps results
        if (googleResults.length > 0) {
            if (dbResults.length > 0) {
                html += '<div style="padding: 10px; background: #e3f2fd; border-bottom: 2px solid #2196f3; font-weight: 600; color: #1565c0; margin-top: 10px;">🌍 Other Addresses</div>';
            }
            googleResults.forEach(place => {
                const address = place.formatted_address || place.name;
                html += `
                    <div class="result-item" onclick="selectGooglePlace('${escapeHtml(place.place_id)}')">
                        <div class="result-address">${escapeHtml(place.name)}</div>
                        <div class="result-preview">
                            ${escapeHtml(address)}
                        </div>
                    </div>
                `;
            });
        }

        if (html === '') {
            searchResults.innerHTML = '<div class="no-results">No matching addresses found</div>';
        } else {
            searchResults.innerHTML = html;
        }
        searchResults.style.display = 'block';
    }

    // Display search results (fallback for database search)
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

    // Handle Google Place selection
    window.selectGooglePlace = function(placeId) {
        if (!placesService) return;

        placesService.getDetails({ placeId: placeId }, function(place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Store place details and redirect to detail page
                const locationData = {
                    address: place.formatted_address,
                    name: place.name,
                    placeId: place.place_id,
                    location: selectedLocation,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };

                // Store in localStorage for detail page
                localStorage.setItem('selectedPlace', JSON.stringify(locationData));

                // Redirect to detail page
                window.location.href = 'detail.html?mode=new&from=google';
            }
        });
    };
    
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
