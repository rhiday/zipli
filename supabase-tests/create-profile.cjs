// This script creates an organization profile for an existing Supabase user
// Use this if you're logged in with GitHub or another OAuth provider

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Use environment variables for Supabase credentials
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  try {
    // Get user ID
    const userId = await askQuestion('Enter your Supabase user ID (UUID): ');
    
    if (!userId || userId.length < 10) {
      console.error('Invalid user ID. Please enter a valid Supabase UUID.');
      process.exit(1);
    }

    // Check if user has an organization profile
    console.log('Checking for existing organization profile...');
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (orgError) {
      console.error('Error checking organization:', orgError.message);
      process.exit(1);
    }

    if (organization) {
      console.log('Organization profile already exists!');
      console.log('Name:', organization.name);
      console.log('Role:', organization.role);
      console.log('No fix needed.');
      process.exit(0);
    } 
    
    console.log('No organization profile found. Let\'s create one...');
    
    // Get organization info
    const orgName = await askQuestion('Enter organization name: ');
    const contactPerson = await askQuestion('Enter contact person name: ');
    const email = await askQuestion('Enter email: ');
    const role = await askQuestion('Enter role (donor/receiver): ');
    
    // Create organization profile
    const { error: createError } = await supabase
      .from('organizations')
      .insert({
        id: userId,
        name: orgName,
        contact_person: contactPerson,
        email: email,
        role: role.toLowerCase(),
        contact_number: '',
        address: '',
        created_by: userId
      });

    if (createError) {
      console.error('Error creating organization:', createError.message);
      process.exit(1);
    }
    
    console.log('Organization profile created successfully!');
    console.log('You should now be able to log in to the app normally.');
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
