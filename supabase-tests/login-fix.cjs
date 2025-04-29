// This is a debug script to help fix login issues
// It tries to log in with your credentials, and if successful 
// but the organization profile is missing, it will create one

// How to use:
// 1. Run this script with Node.js: node login-fix.cjs
// 2. Enter your email and password when prompted
// 3. The script will try to fix the missing organization profile

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Your Supabase URL and anon key are already set
const SUPABASE_URL = "https://mriewtnorjgtdwyzzliq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yaWV3dG5vcmpndGR3eXp6bGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NTI5NjAsImV4cCI6MjA1ODQyODk2MH0.S8cd61ImM-RQP8PeQw2VMe-e3o55bsNhKm1QnrAiJQ8";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  console.log('Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  try {
    // Get user credentials
    const email = await askQuestion('Enter your email: ');
    const password = await askQuestion('Enter your password: ');

    console.log('Attempting to log in...');
    
    // Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login failed:', error.message);
      process.exit(1);
    }

    console.log('Successfully logged in!');
    console.log('User ID:', data.user.id);
    
    // Check if user has an organization profile
    console.log('Checking for organization profile...');
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (orgError) {
      console.error('Error checking organization:', orgError.message);
      process.exit(1);
    }

    if (organization) {
      console.log('Organization profile found!');
      console.log('Name:', organization.name);
      console.log('Role:', organization.role);
      console.log('No fix needed.');
    } else {
      console.log('No organization profile found. Creating one...');
      
      // Get metadata from user account
      let metadata = data.user.user_metadata;
      
      if (!metadata?.name) {
        const orgName = await askQuestion('Enter organization name: ');
        const contactPerson = await askQuestion('Enter contact person name: ');
        const role = await askQuestion('Enter role (donor/receiver): ');
        
        metadata = {
          name: orgName,
          contact_person: contactPerson,
          role: role
        };
      }
      
      // Create organization profile
      const { error: createError } = await supabase
        .from('organizations')
        .insert({
          id: data.user.id,
          name: metadata.name || 'My Organization',
          contact_person: metadata.contact_person || '',
          email: data.user.email,
          role: metadata.role || 'donor',
          contact_number: metadata.contact_number || '',
          address: metadata.address || '',
          created_by: data.user.id
        });

      if (createError) {
        console.error('Error creating organization:', createError.message);
        process.exit(1);
      }
      
      console.log('Organization profile created successfully!');
      console.log('You should now be able to log in normally.');
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
  } finally {
    rl.close();
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

main(); 