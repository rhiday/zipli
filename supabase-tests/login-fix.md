# Login Issue Fix

Based on your error message "Unable to fetch organization details" and "Error fetching profile: Error: Organization profile not found", I've identified the issue in your app.

## What's happening

1. You're successfully authenticating with Supabase (email/password correct)
2. But your app can't find a matching record in the `organizations` table with your user ID
3. This could be because:
   - The organization record was never created during signup
   - The organization record was deleted
   - Your Supabase Row Level Security (RLS) policies are preventing access to the record

## Fix options

### Option 1: Run the fix script

I've created a script that will:
1. Log in with your credentials 
2. Check if your organization profile exists
3. Create one if it doesn't exist

To run it:

```bash
# Make sure you have Node.js installed
cd supabase-tests

# Set your Supabase URL and anon key as environment variables
export VITE_SUPABASE_URL="your-project-url"
export VITE_SUPABASE_ANON_KEY="your-anon-key"

# Run the script
node login-fix.js
```

### Option 2: Use the Supabase dashboard

1. Go to your Supabase project dashboard
2. Go to the "Authentication" section and find your user
3. Copy your user ID (UUID)
4. Go to the "Table Editor" and select the `organizations` table
5. Check if a record with your user ID exists
6. If not, create a new record with:
   - `id`: Your user ID
   - `name`: Your organization name
   - `email`: Your email
   - `role`: "donor" (or "receiver" if you're a food bank)
   - Other fields as needed

### Option 3: Register a new account

If you can't fix your existing account, you can register a new one. The registration process should correctly create both your auth user and organization profile.

## Prevention

This issue likely occurred because:
1. The signup process was interrupted before the organization profile was created
2. Or there was a temporary database error during signup

The app attempts to handle this by creating the profile during login if it's missing, but that code might not be working properly in your environment. 