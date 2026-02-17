// Supabase Database Operations
// All methods are async and return Promises

const db = {
    // Table name in Supabase
    tableName: 'delivery_locations',

    // Search addresses by query string
    search: async function(query) {
        if (!query || query.trim() === '') return [];

        try {
            const searchTerm = query.toLowerCase().trim();

            // Search in address field using case-insensitive LIKE
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .or(`address.ilike.%${searchTerm}%`)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Search error:', error);
                return [];
            }

            // Transform to match expected format
            return data.map(this.transformFromSupabase);
        } catch (e) {
            console.error('Search failed:', e);
            return [];
        }
    },

    // Get location by ID
    getLocation: async function(id) {
        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Get location error:', error);
                return null;
            }

            return this.transformFromSupabase(data);
        } catch (e) {
            console.error('Get location failed:', e);
            return null;
        }
    },

    // Find location by exact address match
    findByAddress: async function(address) {
        try {
            const normalizedAddress = address.toLowerCase().trim();

            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .ilike('address', normalizedAddress)
                .limit(1);

            if (error) {
                console.error('Find by address error:', error);
                return null;
            }

            return data && data.length > 0 ? this.transformFromSupabase(data[0]) : null;
        } catch (e) {
            console.error('Find by address failed:', e);
            return null;
        }
    },

    // Save or update location
    saveLocation: async function(id, address, content, metadata = {}) {
        try {
            // Extract house number from address
            const houseNumberMatch = address.match(/^\d+/);
            const houseNumber = houseNumberMatch ? houseNumberMatch[0] : '';

            const locationData = {
                address: address,
                location: metadata.location || '',
                name: metadata.name || '',
                content: content || [],
                place_id: metadata.placeId || '',
                latitude: metadata.lat || null,
                longitude: metadata.lng || null,
                updated_at: new Date().toISOString()
            };

            let result;

            if (id) {
                // Update existing location
                const { data, error } = await supabase
                    .from(this.tableName)
                    .update(locationData)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) {
                    console.error('Update location error:', error);
                    throw error;
                }

                result = data;
            } else {
                // Insert new location
                const { data, error } = await supabase
                    .from(this.tableName)
                    .insert([locationData])
                    .select()
                    .single();

                if (error) {
                    console.error('Insert location error:', error);
                    throw error;
                }

                result = data;
            }

            return this.transformFromSupabase(result);
        } catch (e) {
            console.error('Save location failed:', e);
            throw e;
        }
    },

    // Delete location
    deleteLocation: async function(id) {
        try {
            const { error } = await supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Delete location error:', error);
                return false;
            }

            return true;
        } catch (e) {
            console.error('Delete location failed:', e);
            return false;
        }
    },

    // Transform Supabase data to app format
    transformFromSupabase: function(data) {
        if (!data) return null;

        // Extract house number from address
        const houseNumberMatch = data.address.match(/^\d+/);
        const houseNumber = houseNumberMatch ? houseNumberMatch[0] : '';

        return {
            id: data.id,
            address: data.address,
            houseNumber: houseNumber,
            content: data.content || [],
            name: data.name || '',
            location: data.location || '',
            placeId: data.place_id || '',
            lat: data.latitude || null,
            lng: data.longitude || null,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },

    // Get all locations for a specific region (optional helper)
    getLocationsByRegion: async function(region) {
        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('location', region)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Get locations by region error:', error);
                return [];
            }

            return data.map(this.transformFromSupabase);
        } catch (e) {
            console.error('Get locations by region failed:', e);
            return [];
        }
    }
};
