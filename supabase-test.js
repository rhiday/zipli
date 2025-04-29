// Simple script to test Supabase connection
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials from .env file
const SUPABASE_URL = 'https://mriewtnorjgtdwyzzliq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yaWV3dG5vcmpndGR3eXp6bGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NTI5NjAsImV4cCI6MjA1ODQyODk2MH0.S8cd61ImM-RQP8PeQw2VMe-e3o55bsNhKm1QnrAiJQ8';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check authentication service
    console.log('\n1. Testing auth service:');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('  Auth service error:', authError.message);
    } else {
      console.log('  Auth service is working');
      console.log(`  Session exists: ${authData.session !== null}`);
    }
    
    // Test 2: List all tables from organizations table
    console.log('\n2. Querying organizations table:');
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, role')
      .limit(10);
      
    if (orgsError) {
      console.error('  Organizations query error:', orgsError.message);
    } else {
      console.log('  Successfully queried organizations table');
      console.log(`  Found ${orgs.length} organizations:`);
      orgs.forEach(org => {
        console.log(`  - ${org.name} (${org.role})`);
      });
    }
    
    // Test 3: List donations table
    console.log('\n3. Querying donations table:');
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('id, title, status')
      .limit(10);
      
    if (donationsError) {
      console.error('  Donations query error:', donationsError.message);
    } else {
      console.log('  Successfully queried donations table');
      console.log(`  Found ${donations.length} donations:`);
      donations.forEach(donation => {
        console.log(`  - ${donation.title} (${donation.status})`);
      });
    }
    
    // Test 4: Check database schema
    console.log('\n4. Getting database schema information:');
    try {
      const { data: tables, error } = await supabase
        .rpc('get_schema_information');
      
      if (error) {
        console.log('  Schema function not available, using standard query');
        // Alternative: try to list tables using pg_catalog
        const { data: pgTables, error: pgError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        if (pgError) {
          console.error('  Schema query error:', pgError.message);
        } else {
          console.log('  Public tables in database:');
          pgTables.forEach(t => console.log(`  - ${t.table_name}`));
        }
      } else {
        console.log('  Tables in database:');
        tables.forEach(t => console.log(`  - ${t.name}`));
      }
    } catch (err) {
      console.log('  Schema query not available (requires special permissions)');
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

testConnection(); 