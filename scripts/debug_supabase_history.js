
const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '.env' });

const supabaseUrl = 'https://sldcrxprobajhxnlhdcg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZGNyeHByb2Jhamh4bmxoZGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTUxODcsImV4cCI6MjA4MzI5MTE4N30.8k7RbkDSvGbpiYJQlnrPxHZiFhaYxyzrSJywZ-li1Tg';

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  console.log('Fetching a match...');
  const { data: matches, error: fetchError } = await supabase
    .from('matches')
    .select('id')
    .limit(1);

  if (fetchError) {
    console.error('Error fetching matches:', fetchError);
    return;
  }

  if (!matches || matches.length === 0) {
    console.log('No matches found to test update.');
    return;
  }

  const matchId = matches[0].id;
  console.log(`Found match ID: ${matchId}. Attempting update with history...`);

  const { error: updateError } = await supabase
    .from('matches')
    .update({ history: [] })
    .eq('id', matchId);

  if (updateError) {
    console.error('Update FAILED!');
    console.error('Code:', updateError.code);
    console.error('Message:', updateError.message);
    console.error('Details:', updateError.details);
    console.error('Hint:', updateError.hint);
  } else {
    console.log('Update SUCCESS! History column exists and is writable.');
  }
}

testUpdate();
