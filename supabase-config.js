// Supabase Configuration
// Replace these with your actual Supabase project credentials
// You can find these in your Supabase project settings: https://app.supabase.com

const SUPABASE_URL = 'https://kbktphjichdffhfjkhah.supabase.co'; // e.g., 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtia3RwaGppY2hkZmZoZmpraGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTA5OTcsImV4cCI6MjA4Njg2Njk5N30.oNeIpBvQQKWvQfty9EYz-8NZMH5A8wyDl_87On5TfPs'; // Your project's anon/public key

// Initialize Supabase client
const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export globally for use in other scripts
window.supabase = supabaseClient;
window.supabaseClient = supabaseClient;

console.log('Supabase client initialized:', supabaseClient);
