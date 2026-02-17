// Supabase Configuration
// Replace these with your actual Supabase project credentials
// You can find these in your Supabase project settings: https://app.supabase.com

const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g., 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Your project's anon/public key

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other scripts
window.supabaseClient = supabase;

console.log('Supabase client initialized');
