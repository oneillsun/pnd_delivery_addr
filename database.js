// Simulated database - In production, this would be a real database
const database = {
    locations: {
        '123-main-st': {
            id: '123-main-st',
            address: '123 Main Street, Springfield, IL 62701',
            houseNumber: '123',
            content: [
                {
                    type: 'text',
                    data: 'This is a residential delivery location. Package should be left at the front door.'
                },
                {
                    type: 'text',
                    data: 'Special instructions: Ring doorbell upon delivery. Customer prefers morning deliveries.'
                }
            ]
        },
        '456-oak-ave': {
            id: '456-oak-ave',
            address: '456 Oak Avenue, Boston, MA 02101',
            houseNumber: '456',
            content: [
                {
                    type: 'text',
                    data: 'Commercial building with reception desk. Packages must be signed for at the front desk during business hours (9 AM - 5 PM).'
                }
            ]
        },
        '789-pine-rd': {
            id: '789-pine-rd',
            address: '789 Pine Road, Seattle, WA 98101',
            houseNumber: '789',
            content: [
                {
                    type: 'text',
                    data: 'Apartment complex - Unit 4B. Use call box at main entrance. Delivery to apartment door preferred.'
                },
                {
                    type: 'text',
                    data: 'Access code: #4321. Valid Mon-Fri 8 AM - 8 PM.'
                }
            ]
        },
        '321-elm-st': {
            id: '321-elm-st',
            address: '321 Elm Street, Austin, TX 78701',
            houseNumber: '321',
            content: [
                {
                    type: 'text',
                    data: 'House with gate. Gate code: 5678. Leave packages inside gate, on covered porch.'
                }
            ]
        },
        '555-maple-dr': {
            id: '555-maple-dr',
            address: '555 Maple Drive, Denver, CO 80202',
            houseNumber: '555',
            content: [
                {
                    type: 'text',
                    data: 'Medical office building. Deliveries accepted at loading dock (rear entrance) between 7 AM - 3 PM.'
                },
                {
                    type: 'text',
                    data: 'Contact: Reception Desk (555) 123-4567'
                }
            ]
        },
        '888-birch-ln': {
            id: '888-birch-ln',
            address: '888 Birch Lane, Portland, OR 97201',
            houseNumber: '888',
            content: [
                {
                    type: 'text',
                    data: 'Residential home with dogs. Please do not open gate. Leave packages outside fence. Customer will retrieve.'
                }
            ]
        },
        '1001-cedar-ct': {
            id: '1001-cedar-ct',
            address: '1001 Cedar Court, Miami, FL 33101',
            houseNumber: '1001',
            content: [
                {
                    type: 'text',
                    data: 'Warehouse facility. Use Dock #3 for deliveries. Receiving hours: Mon-Fri 6 AM - 2 PM.'
                }
            ]
        },
        '2020-willow-way': {
            id: '2020-willow-way',
            address: '2020 Willow Way, Phoenix, AZ 85001',
            houseNumber: '2020',
            content: [
                {
                    type: 'text',
                    data: 'Gated community. Visitor code: *7890#. Resident name: Johnson. Leave at front door.'
                }
            ]
        }
    }
};

// Database operations
const db = {
    // Search addresses by house number or street name
    search: function(query) {
        if (!query || query.trim() === '') return [];
        
        const searchTerm = query.toLowerCase().trim();
        const results = [];
        
        for (let key in database.locations) {
            const location = database.locations[key];
            const addressLower = location.address.toLowerCase();
            const houseNumberLower = location.houseNumber.toLowerCase();
            
            // Match house number or any part of the address
            if (houseNumberLower.includes(searchTerm) || addressLower.includes(searchTerm)) {
                results.push(location);
            }
        }
        
        return results;
    },
    
    // Get location by ID
    getLocation: function(id) {
        return database.locations[id] || null;
    },
    
    // Save or update location
    saveLocation: function(id, address, content) {
        if (!id) {
            // Generate new ID from address
            id = address.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
                .substring(0, 50);
        }
        
        // Extract house number from address
        const houseNumberMatch = address.match(/^\d+/);
        const houseNumber = houseNumberMatch ? houseNumberMatch[0] : '';
        
        database.locations[id] = {
            id: id,
            address: address,
            houseNumber: houseNumber,
            content: content || []
        };
        
        // Save to localStorage
        this.persist();
        
        return database.locations[id];
    },
    
    // Persist to localStorage
    persist: function() {
        try {
            localStorage.setItem('fedex_locations', JSON.stringify(database.locations));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    },
    
    // Load from localStorage
    load: function() {
        try {
            const stored = localStorage.getItem('fedex_locations');
            if (stored) {
                database.locations = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
        }
    },
    
    // Delete location
    deleteLocation: function(id) {
        if (database.locations[id]) {
            delete database.locations[id];
            this.persist();
            return true;
        }
        return false;
    }
};

// Load data on initialization
db.load();
