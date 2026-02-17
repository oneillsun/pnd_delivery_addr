# Supabase Setup Guide for PND Delivery Address Guide

## Overview
This guide will help you set up Supabase as the database backend for your delivery address application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Fill in the project details:
   - **Project Name**: PND Delivery Addresses (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the region closest to your users
4. Click "Create new project" and wait for initialization (~2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (gear icon)
2. Go to **API** section
3. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon public key** (under "Project API keys")

## Step 3: Configure Your Application

1. Open `supabase-config.js` in your project
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'your-project-url-here';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

## Step 4: Create the Database Table

1. In your Supabase dashboard, go to **Table Editor**
2. Click **New Table**
3. Create a table named `delivery_locations` with the following structure:

### Table: `delivery_locations`

| Column Name | Type | Options |
|-------------|------|---------|
| id | uuid | Primary Key, Default: gen_random_uuid() |
| address | text | Required |
| location | text | Required (ALLIANCE, ARLINGTON, FORT WORTH, IRVING, KENTUCKY) |
| name | text | Optional |
| content | jsonb | Default: [] |
| place_id | text | Optional |
| latitude | numeric | Optional |
| longitude | numeric | Optional |
| created_at | timestamp with time zone | Default: now() |
| updated_at | timestamp with time zone | Default: now() |

**SQL to create the table:**

```sql
CREATE TABLE delivery_locations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  address text NOT NULL,
  location text NOT NULL,
  name text,
  content jsonb DEFAULT '[]'::jsonb,
  place_id text,
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE delivery_locations ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access (adjust as needed)
CREATE POLICY "Enable read access for all users" ON delivery_locations
  FOR SELECT USING (true);

-- Create a policy to allow authenticated insert (adjust as needed)
CREATE POLICY "Enable insert for all users" ON delivery_locations
  FOR INSERT WITH CHECK (true);

-- Create a policy to allow authenticated update (adjust as needed)
CREATE POLICY "Enable update for all users" ON delivery_locations
  FOR UPDATE USING (true);

-- Create a policy to allow authenticated delete (adjust as needed)
CREATE POLICY "Enable delete for all users" ON delivery_locations
  FOR DELETE USING (true);

-- Create an index for faster location-based queries
CREATE INDEX idx_delivery_locations_location ON delivery_locations(location);

-- Create an index for faster address searches
CREATE INDEX idx_delivery_locations_address ON delivery_locations USING gin (to_tsvector('english', address));
```

## Step 5: Using Supabase in Your Application

### Available Functions

The `SupabaseDB` object provides the following methods:

#### Add a Location
```javascript
const result = await SupabaseDB.addLocation({
  address: '123 Main St, Dallas, TX',
  location: 'ALLIANCE',
  name: 'Main Street Warehouse',
  placeId: 'ChIJ...',
  lat: 32.7767,
  lng: -96.7970
});
```

#### Get Locations by Region
```javascript
const result = await SupabaseDB.getLocationsByRegion('ALLIANCE');
console.log(result.data); // Array of locations
```

#### Search Locations
```javascript
const result = await SupabaseDB.searchLocations('Main St', 'ALLIANCE');
console.log(result.data); // Matching locations
```

#### Get Location by ID
```javascript
const result = await SupabaseDB.getLocationById('uuid-here');
console.log(result.data); // Single location
```

#### Update Location
```javascript
const result = await SupabaseDB.updateLocation('uuid-here', {
  address: 'Updated Address',
  name: 'Updated Name'
});
```

#### Delete Location
```javascript
const result = await SupabaseDB.deleteLocation('uuid-here');
```

## Step 6: Integration with Google Maps

When a user selects a location from Google Maps search results, you can automatically save it to Supabase:

```javascript
// In your selectGooglePlace function (script.js)
window.selectGooglePlace = async function(placeId) {
  if (!placesService) return;

  placesService.getDetails({ placeId: placeId }, async function(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      const locationData = {
        address: place.formatted_address,
        name: place.name,
        placeId: place.place_id,
        location: selectedLocation,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      // Save to Supabase
      const result = await SupabaseDB.addLocation(locationData);

      if (result.success) {
        console.log('Location saved to Supabase!', result.data);
        // Redirect or show success message
      } else {
        console.error('Error saving to Supabase:', result.error);
      }
    }
  });
};
```

## Step 7: Security Considerations

### Row Level Security (RLS)
The SQL above enables RLS and creates basic policies. For production:

1. **Adjust policies** based on your authentication needs
2. **Enable authentication** if needed (Supabase Auth)
3. **Restrict write access** to authenticated users only

### API Keys
- **Never commit** your Supabase keys to public repositories
- Use environment variables for production deployments
- Rotate keys if they're accidentally exposed

## Testing Your Setup

1. Open your browser console
2. Test the connection:
```javascript
// Check if Supabase is loaded
console.log(supabaseClient);

// Test a query
SupabaseDB.getAllLocations().then(result => {
  console.log('All locations:', result);
});
```

## Next Steps

1. **Modify the search function** in `script.js` to use Supabase instead of the local database
2. **Add real-time subscriptions** to sync data across devices
3. **Implement user authentication** for managing locations
4. **Add storage** for images/videos using Supabase Storage

## Troubleshooting

### Connection Issues
- Verify your URL and API key are correct
- Check browser console for errors
- Ensure your Supabase project is active

### Policy Errors
- Check RLS policies in Supabase dashboard
- Temporarily disable RLS for testing (not recommended for production)

### Query Issues
- Check table name and column names match exactly
- Review Supabase logs in the dashboard

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
