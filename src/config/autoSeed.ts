import supabase from './supabaseClient';

export async function runAutoSeeder() {
  try {
    console.log('Checking database seed status...');

    // 1. Verify and seed holiday categories if missing (as fallback)
    const { data: existingCats, error: catErr } = await supabase.from('holiday_categories').select('id, name');
    if (catErr) {
      console.error('Error checking holiday categories:', catErr.message);
      return;
    }

    let categories = existingCats || [];
    if (categories.length === 0) {
      console.log('Seeding default holiday categories...');
      const defaultCats = [
        { name: 'Government Holiday', description: 'Official government holidays.' },
        { name: 'Bank Holiday', description: 'Holidays observed by banks.' },
        { name: 'International Day', description: 'Internationally observed days of significance.' },
        { name: 'Regional Holiday', description: 'Holidays specific to a particular region.' }
      ];
      const { data: seededCats, error: seedCatErr } = await supabase.from('holiday_categories').insert(defaultCats).select();
      if (seedCatErr) {
        console.error('Failed to seed holiday categories:', seedCatErr.message);
        return;
      }
      categories = seededCats || [];
    }

    // 2. Check if holidays table is empty
    const { count: holidayCount, error: holCheckErr } = await supabase
      .from('holidays')
      .select('*', { count: 'exact', head: true });

    if (holCheckErr) {
      console.error('Error checking holidays count:', holCheckErr.message);
    } else if (holidayCount === 0) {
      console.log('Seeding sample holidays...');
      const govCat = categories.find(c => c.name === 'Government Holiday') || categories[0];
      const bankCat = categories.find(c => c.name === 'Bank Holiday') || categories[0];
      const intCat = categories.find(c => c.name === 'International Day') || categories[0];
      
      const currentYear = new Date().getFullYear();

      const sampleHolidays = [
        {
          name: "New Year's Day",
          date: `${currentYear}-01-01`,
          category_id: bankCat?.id,
          description: "First day of the year in the Gregorian calendar.",
          is_recurring: true
        },
        {
          name: "Republic Day",
          date: `${currentYear}-01-26`,
          category_id: govCat?.id,
          description: "Honors the date on which the Constitution of India came into effect.",
          is_recurring: true
        },
        {
          name: "International Women's Day",
          date: `${currentYear}-03-08`,
          category_id: intCat?.id,
          description: "Global day celebrating the social, economic, cultural, and political achievements of women.",
          is_recurring: true
        },
        {
          name: "Independence Day",
          date: `${currentYear}-08-15`,
          category_id: govCat?.id,
          description: "Commemorates the nation's independence from United Kingdom.",
          is_recurring: true
        },
        {
          name: "Gandhi Jayanti",
          date: `${currentYear}-10-02`,
          category_id: govCat?.id,
          description: "Honors the birthday of Mahatma Gandhi, leader of the Indian independence movement.",
          is_recurring: true
        },
        {
          name: "Christmas Day",
          date: `${currentYear}-12-25`,
          category_id: govCat?.id,
          description: "Annual festival commemorating the birth of Jesus Christ.",
          is_recurring: true
        }
      ];

      const { error: seedHolErr } = await supabase.from('holidays').insert(sampleHolidays);
      if (seedHolErr) {
        console.error('Failed to seed holidays:', seedHolErr.message);
      } else {
        console.log('Successfully seeded sample holidays.');
      }
    }

    // 3. Check if festivals table is empty
    const { count: festivalCount, error: festCheckErr } = await supabase
      .from('festivals')
      .select('*', { count: 'exact', head: true });

    if (festCheckErr) {
      console.error('Error checking festivals count:', festCheckErr.message);
    } else if (festivalCount === 0) {
      console.log('Seeding sample festivals...');
      const currentYear = new Date().getFullYear();

      const sampleFestivals = [
        {
          name: "Holi",
          date: `${currentYear}-03-14`,
          description: "The popular ancient Hindu festival of colors.",
          is_recurring: false
        },
        {
          name: "Eid al-Fitr",
          date: `${currentYear}-03-31`,
          description: "Festival of breaking the fast celebrated by Muslims worldwide.",
          is_recurring: false
        },
        {
          name: "Ganesh Chaturthi",
          date: `${currentYear}-09-07`,
          description: "Hindu festival celebrating the arrival of Ganesh on earth.",
          is_recurring: false
        },
        {
          name: "Diwali",
          date: `${currentYear}-11-01`,
          description: "The festival of lights, one of the major festivals celebrated by Hindus.",
          is_recurring: false
        }
      ];

      const { error: seedFestErr } = await supabase.from('festivals').insert(sampleFestivals);
      if (seedFestErr) {
        console.error('Failed to seed festivals:', seedFestErr.message);
      } else {
        console.log('Successfully seeded sample festivals.');
      }
    }

    // 4. Verify and seed daily quotes if missing
    const { count: quoteCount } = await supabase.from('daily_quotes').select('*', { count: 'exact', head: true });
    if (quoteCount === 0) {
      console.log('Seeding daily quotes...');
      const sampleQuotes = [
        { quote: "Adopt the pace of nature: her secret is patience.", author: "Ralph Waldo Emerson" },
        { quote: "Time is a created thing. To say 'I don't have time', is like saying, 'I don't want to'.", author: "Lao Tzu" },
        { quote: "Write it on your heart that every day is the best day in the year.", author: "Ralph Waldo Emerson" },
        { quote: "Keep close to Nature's heart... and wash your spirit clean.", author: "John Muir" },
        { quote: "The primary cause of unhappiness is never the situation but your thoughts about it.", author: "Eckhart Tolle" }
      ];
      await supabase.from('daily_quotes').insert(sampleQuotes);
      console.log('Successfully seeded daily quotes.');
    }

    console.log('Database verification completed.');
  } catch (err: any) {
    console.error('Unexpected error running seeder:', err.message);
  }
}
