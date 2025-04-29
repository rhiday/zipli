// This script automatically creates organization profiles for all users
// who don't already have one, with random organization names

const { createClient } = require('@supabase/supabase-js');

// Use environment variables for Supabase credentials
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// List of adjectives and nouns to create random org names
const adjectives = [
  'Amazing', 'Brilliant', 'Creative', 'Dynamic', 'Efficient',
  'Fantastic', 'Global', 'Honest', 'Innovative', 'Jubilant',
  'Kind', 'Lively', 'Mighty', 'Noble', 'Optimal',
  'Peaceful', 'Quick', 'Reliable', 'Strategic', 'Trustworthy'
];

const nouns = [
  'Solutions', 'Systems', 'Services', 'Group', 'Team',
  'Partners', 'Foundation', 'Network', 'Alliance', 'Association',
  'Organization', 'Enterprise', 'Initiative', 'Collective', 'Cooperative',
  'Consortium', 'Ventures', 'Industries', 'International', 'Worldwide'
];

function generateRandomOrgName() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
}

async function main() {
  try {
    console.log('Fetching all users...');
    
    // Get all users from auth admin API - note this requires admin key
    // Since we don't have admin rights, we'll work with the IDs from your screenshot
    const userIds = [
      '4772d523-3801-40ac-8b73-27dfab3762be',
      'a2d6f40c-276f-4a4a-afaa-4567f55b75d1',
      '384a303b-ae5c-4c4e-918b-103e3f917e5a',
      '3acccb77-fa7f-48e7-a0b5-3dbb829f8572'
    ];
    
    console.log(`Processing ${userIds.length} users...`);
    
    let created = 0;
    let existing = 0;
    let errors = 0;
    
    // Process each user
    for (const userId of userIds) {
      try {
        // Check if user already has organization profile
        const { data: organization, error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('id', userId)
          .maybeSingle();
          
        if (orgError) {
          console.error(`Error checking organization for user ${userId}:`, orgError.message);
          errors++;
          continue;
        }
        
        if (organization) {
          console.log(`User ${userId} already has organization: ${organization.name}`);
          existing++;
          continue;
        }
        
        // Generate random organization details
        const orgName = generateRandomOrgName();
        const role = Math.random() > 0.5 ? 'donor' : 'receiver';
        
        console.log(`Creating organization "${orgName}" for user ${userId}...`);
        
        // Create organization profile
        const { error: createError } = await supabase
          .from('organizations')
          .insert({
            id: userId,
            name: orgName,
            contact_person: 'Contact Person',
            email: 'user@example.com',  // This should ideally match the user's email
            role: role,
            contact_number: '',
            address: '',
            created_by: userId
          });
          
        if (createError) {
          console.error(`Error creating organization for user ${userId}:`, createError.message);
          errors++;
          continue;
        }
        
        console.log(`Successfully created organization for user ${userId}`);
        created++;
        
      } catch (error) {
        console.error(`Unexpected error processing user ${userId}:`, error.message);
        errors++;
      }
    }
    
    console.log('\nSummary:');
    console.log(`Total users processed: ${userIds.length}`);
    console.log(`Organizations created: ${created}`);
    console.log(`Users with existing organizations: ${existing}`);
    console.log(`Errors: ${errors}`);
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

main(); 