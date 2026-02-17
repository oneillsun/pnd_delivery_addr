// Supabase Helper Functions for PND Delivery Address Guide

/**
 * Delivery Locations Table Structure (Create this in your Supabase dashboard):
 *
 * Table: delivery_locations
 * Columns:
 *   - id: uuid (primary key, auto-generated)
 *   - address: text
 *   - location: text (ALLIANCE, ARLINGTON, FORT WORTH, IRVING, KENTUCKY)
 *   - name: text
 *   - content: jsonb (stores blocks of content)
 *   - place_id: text (Google Maps Place ID)
 *   - latitude: numeric
 *   - longitude: numeric
 *   - created_at: timestamp with time zone (auto-generated)
 *   - updated_at: timestamp with time zone (auto-generated)
 */

const SupabaseDB = {
    // Add a new delivery location
    async addLocation(locationData) {
        try {
            const { data, error } = await supabaseClient
                .from('delivery_locations')
                .insert([
                    {
                        address: locationData.address,
                        location: locationData.location,
                        name: locationData.name || '',
                        content: locationData.content || [],
                        place_id: locationData.placeId || '',
                        latitude: locationData.lat || null,
                        longitude: locationData.lng || null
                    }
                ])
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error adding location:', error);
            return { success: false, error: error.message };
        }
    },

    // Get all locations for a specific region
    async getLocationsByRegion(location) {
        try {
            const { data, error } = await supabaseClient
                .from('delivery_locations')
                .select('*')
                .eq('location', location)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching locations:', error);
            return { success: false, error: error.message };
        }
    },

    // Search locations by address
    async searchLocations(query, location = null) {
        try {
            let queryBuilder = supabaseClient
                .from('delivery_locations')
                .select('*')
                .ilike('address', `%${query}%`);

            // Filter by location if provided
            if (location) {
                queryBuilder = queryBuilder.eq('location', location);
            }

            const { data, error } = await queryBuilder.order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error searching locations:', error);
            return { success: false, error: error.message };
        }
    },

    // Get a specific location by ID
    async getLocationById(id) {
        try {
            const { data, error } = await supabaseClient
                .from('delivery_locations')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching location:', error);
            return { success: false, error: error.message };
        }
    },

    // Update a location
    async updateLocation(id, updates) {
        try {
            const { data, error } = await supabaseClient
                .from('delivery_locations')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error updating location:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete a location
    async deleteLocation(id) {
        try {
            const { error } = await supabaseClient
                .from('delivery_locations')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting location:', error);
            return { success: false, error: error.message };
        }
    },

    // Get all locations (with optional pagination)
    async getAllLocations(limit = 100, offset = 0) {
        try {
            const { data, error } = await supabaseClient
                .from('delivery_locations')
                .select('*')
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching all locations:', error);
            return { success: false, error: error.message };
        }
    }
};

// Make SupabaseDB available globally
window.SupabaseDB = SupabaseDB;
