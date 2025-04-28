const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify the question function
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function clearConsole() {
  process.stdout.write('\x1Bc');
}

async function runFix() {
  try {
    clearConsole();
    console.log('===== Zipli Organization Fix Tool =====');
    console.log('This script will fix issues with logging in to Zipli.');
    console.log('It will verify your account and create an organization profile if missing.\n');
    
    const projectUrl = await askQuestion('Enter your Supabase project URL (e.g., https://mriewtnorjgtdwyzzliq.supabase.co): ');
    const anonKey = await askQuestion('Enter your Supabase anon key: ');
    
    // Create Supabase client
    const supabase = createClient(projectUrl, anonKey);
    
    // Get user credentials
    const email = await askQuestion('Enter your email: ');
    const password = await askQuestion('Enter your password: ');

    console.log('\nAttempting to log in...');
    
    // Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login failed:', error.message);
      return;
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
      return;
    }

    if (organization) {
      console.log('Organization profile found!');
      console.log('Name:', organization.name);
      console.log('Email:', organization.email);
      console.log('No fix needed.');
    } else {
      console.log('No organization profile found. Creating one...');
      
      // Get metadata from user account
      let metadata = data.user.user_metadata || {};
      
      const orgName = await askQuestion('Enter organization name: ');
      const contactPerson = await askQuestion('Enter contact person name: ');
      const role = await askQuestion('Enter role (donor/receiver): ');
      
      // Create organization profile
      const { error: createError } = await supabase
        .from('organizations')
        .insert({
          id: data.user.id,
          name: orgName || 'My Organization',
          contact_person: contactPerson || '',
          email: data.user.email,
          role: role?.toLowerCase() || 'donor',
          contact_number: metadata.contact_number || '',
          address: metadata.address || '',
          created_by: data.user.id
        });

      if (createError) {
        console.error('Error creating organization:', createError.message);
        return;
      }
      
      console.log('Organization profile created successfully!');
      console.log('You should now be able to log in to the app normally.');
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

async function mainMenu() {
  while (true) {
    clearConsole();
    console.log('===== Zipli Organization Fix Tool =====');
    console.log('1. Run organization fix');
    console.log('2. Exit');
    const choice = await askQuestion('Choose an option: ');
    if (choice === '1') {
      await runFix();
      await askQuestion('\nPress Enter to return to main menu...');
    } else if (choice === '2') {
      rl.close();
      process.exit(0);
    } else {
      console.log('Invalid choice. Try again.');
      await askQuestion('Press Enter to continue...');
    }
  }
}

mainMenu(); 