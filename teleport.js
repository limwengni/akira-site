require('dotenv').config({ path: './.env.local' }); // Added ./ for precision
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for write access

// Debugging check
if (!url || !key) {
  console.error("❌ ERROR: Keys not found!");
  console.log("Check if .env.local exists in:", process.cwd());
  console.log("URL found:", url ? "Yes" : "No");
  console.log("Key found:", key ? "Yes" : "No");
  process.exit(1);
}

const supabase = createClient(url, key);

async function teleport() {
  try {
    // Make sure this path is correct based on your 'ls' output
    const rawData = fs.readFileSync('./app/characters.json'); 
    const characters = JSON.parse(rawData);
    
    const rows = Object.keys(characters).map(slug => {
      const char = characters[slug];
      return {
        slug: slug,
        name: char.name,
        role: char.role || 'Unknown',
        subrole: char.subrole || null,
        quote: char.quote || null,
        bio: char.bio || null,
        abilities: char.abilities || null,
        relationships: char.relationships || null,
        trivias: char.trivias || null,
        icon_url: char.icon || null,
        image_url: char.gallery?.[0] || null,
        gallery: char.gallery || [],
        stats: char.stats || {},
        labels: char.labels || []
      };
    });

    console.log(`🚀 Teleporting ${rows.length} characters...`);
    const { error } = await supabase.from('characters').insert(rows);
    if (error) throw error;
    console.log('✅ Success!');
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

teleport();