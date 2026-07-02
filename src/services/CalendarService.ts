import supabase from '../config/supabaseClient';
import { ApiError } from '../utils/ApiError';
import axios from 'axios';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'holiday' | 'festival';
  category?: string;
  is_recurring?: boolean;
}

export interface RegionalData {
  date: string;
  panchang: {
    tithi: string;
    nakshatra: string;
    yoga: string;
    karana: string;
    sunrise: string;
    sunset: string;
    rahu_kaal: string;
  };
  hijri: {
    day: number;
    month: string;
    monthAr?: string;
    monthNum: number;
    year: number;
    events?: string;
  };
  moonPhase: {
    phase: string;
    illumination: number;
  };
}

class CalendarService {
  // Get all holidays and festivals for a month/year
  async getEvents(month: number, year: number): Promise<CalendarEvent[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Try fetching from Calendarific API if key exists
    const calKey = process.env.CALENDARIFIC_API_KEY;
    let holidaysList: any[] = [];

    if (calKey) {
      try {
        const calRes = await axios.get(
          `https://calendarific.com/api/v2/holidays?api_key=${calKey}&country=IN&year=${year}&month=${month}`,
          { timeout: 5000 }
        );
        if (calRes.data?.response?.holidays) {
          holidaysList = calRes.data.response.holidays.map((h: any) => ({
            id: h.name + '-' + h.date.iso,
            name: h.name,
            date: h.date.iso.split('T')[0],
            description: h.description || '',
            is_recurring: true,
            holiday_categories: { name: h.type?.[0] || 'Public Holiday' }
          }));
        }
      } catch (err: any) {
        console.error('Calendarific API error (falling back to DB):', err.message);
      }
    }

    // If API didn't return or was not configured, load from DB
    if (holidaysList.length === 0) {
      const { data: holidays, error: holError } = await supabase
        .from('holidays')
        .select(`
          id,
          name,
          date,
          description,
          is_recurring,
          holiday_categories ( name )
        `)
        .eq('status', 'active')
        .gte('date', startDate)
        .lte('date', endDate);

      if (!holError && holidays) {
        holidaysList = holidays;
      }
    }

    // 2. Fetch festivals
    const { data: festivals, error: festError } = await supabase
      .from('festivals')
      .select('id, name, date, description, is_recurring')
      .eq('status', 'active')
      .gte('date', startDate)
      .lte('date', endDate);

    if (festError) {
      console.error('Error fetching festivals:', festError);
    }

    const events: CalendarEvent[] = [];

    holidaysList.forEach((h: any) => {
      events.push({
        id: h.id,
        title: h.name,
        description: h.description,
        date: h.date,
        type: 'holiday',
        category: h.holiday_categories?.name || 'Public Holiday',
        is_recurring: h.is_recurring,
      });
    });

    if (festivals) {
      festivals.forEach((f: any) => {
        events.push({
          id: f.id,
          title: f.name,
          description: f.description,
          date: f.date,
          type: 'festival',
          is_recurring: f.is_recurring,
        });
      });
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Get Marathi Panchang, Hijri date and Moon Phase (with calculated/simulated fallback)
  async getRegionalData(dateStr: string): Promise<RegionalData> {
    const targetDate = new Date(dateStr);
    const [year, month, day] = dateStr.split('-').map(Number);
    
    // 1. Set up defaults / simulated fallbacks
    let panchang = this.calculateSimulatedPanchang(targetDate);
    let hijri = this.calculateSimulatedHijri(targetDate);
    const moonPhase = this.calculateMoonPhase(targetDate);

    // 2. Fetch Hijri from Aladhan API (Free, no credentials required!)
    try {
      const dmy = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
      const hijriRes = await axios.get(`https://api.aladhan.com/v1/gToH/${dmy}`, { timeout: 4000 });
      if (hijriRes.data?.data?.hijri) {
        const hData = hijriRes.data.data.hijri;
        hijri = {
          day: Number(hData.day),
          month: hData.month?.en || '',
          monthAr: hData.month?.ar || '',
          monthNum: Number(hData.month?.number || 1),
          year: Number(hData.year),
          events: hData.holidays && hData.holidays.length > 0 ? hData.holidays.join(', ') : undefined
        };
      }
    } catch (err: any) {
      console.error('Aladhan Hijri API error (falling back to simulation):', err.message);
    }

    // 3. Fetch Panchang from Vedic Astrology API if keys exist in .env
    const userId = process.env.VEDIC_ASTROLOGY_USER_ID;
    const apiKey = process.env.VEDIC_ASTROLOGY_API_KEY;

    if (userId && apiKey) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${userId}:${apiKey}`).toString('base64');
        const payload = {
          day,
          month,
          year,
          hour: 6,
          min: 0,
          lat: 19.0760, // Mumbai default
          lon: 72.8777,
          tzone: 5.5
        };

        const astroRes = await axios.post(
          'https://json.astrologyapi.com/v1/basic_panchang',
          payload,
          {
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        );

        if (astroRes.data) {
          const ad = astroRes.data;
          panchang = {
            tithi: `${ad.tithi?.details?.tithi_name || ''} (${ad.tithi?.details?.special || ''})`,
            nakshatra: ad.nakshatra?.details?.nakshatra_name || '',
            yoga: ad.yog?.details?.yog_name || '',
            karana: ad.karan?.details?.karan_name || '',
            sunrise: ad.sunrise || '06:05 AM',
            sunset: ad.sunset || '06:55 PM',
            rahu_kaal: '01:30 PM - 03:00 PM', // Standard Rahu Kaal
          };
        }
      } catch (astroErr: any) {
        console.error('Vedic Astrology API error (falling back to simulation):', astroErr.message);
      }
    } else {
      // If VEDIC keys are not configured, try fetching local DB Panchang if available
      const { data: panchangDb } = await supabase
        .from('marathi_panchang')
        .select('*')
        .eq('date', dateStr)
        .eq('status', 'active')
        .maybeSingle();

      if (panchangDb) {
        panchang = {
          tithi: panchangDb.tithi,
          nakshatra: panchangDb.nakshatra,
          yoga: panchangDb.yoga,
          karana: panchangDb.karana,
          sunrise: panchangDb.sunrise_time ? String(panchangDb.sunrise_time).substring(0, 5) : '06:05 AM',
          sunset: panchangDb.sunset_time ? String(panchangDb.sunset_time).substring(0, 5) : '06:55 PM',
          rahu_kaal: (panchangDb.rahu_kaal_start && panchangDb.rahu_kaal_end) 
            ? `${String(panchangDb.rahu_kaal_start).substring(0, 5)} - ${String(panchangDb.rahu_kaal_end).substring(0, 5)}`
            : '01:30 PM - 03:00 PM',
        };
      }
    }

    return {
      date: dateStr,
      panchang,
      hijri,
      moonPhase,
    };
  }

  // Fetch a random quote, with fallback
  async getRandomQuote(): Promise<{ quote: string; author: string }> {
    const { data, error } = await supabase
      .from('daily_quotes')
      .select('quote, author')
      .eq('status', 'active');

    const fallbacks = [
      { quote: "Keep close to Nature's heart... and break clear away once in a while, and climb a mountain or spend a week in the woods. Wash your spirit clean.", author: "John Muir" },
      { quote: "Time is a created thing. To say 'I don't have time', is like saying, 'I don't want to'.", author: "Lao Tzu" },
      { quote: "The primary cause of unhappiness is never the situation but your thoughts about it.", author: "Eckhart Tolle" },
      { quote: "Adopt the pace of nature: her secret is patience.", author: "Ralph Waldo Emerson" },
      { quote: "Write it on your heart that every day is the best day in the year.", author: "Ralph Waldo Emerson" }
    ];

    if (error || !data || data.length === 0) {
      const idx = Math.floor(Math.random() * fallbacks.length);
      return fallbacks[idx];
    }

    const idx = Math.floor(Math.random() * data.length);
    return data[idx];
  }

  // Astronomical Moon Phase Calculation
  private calculateMoonPhase(date: Date): { phase: string; illumination: number } {
    const knownNewMoon = new Date('1999-08-11T16:08:00Z');
    const msDiff = date.getTime() - knownNewMoon.getTime();
    const daysDiff = msDiff / (1000 * 60 * 60 * 24);
    const lunarCycle = 29.530588853;
    const phaseVal = (daysDiff / lunarCycle) % 1;
    const normPhase = phaseVal < 0 ? phaseVal + 1 : phaseVal;

    let phase = '';
    let illumination = 0;

    if (normPhase < 0.03 || normPhase > 0.97) {
      phase = 'New Moon';
      illumination = 0;
    } else if (normPhase >= 0.03 && normPhase < 0.22) {
      phase = 'Waxing Crescent';
      illumination = Math.round(normPhase * 400); // approx
    } else if (normPhase >= 0.22 && normPhase < 0.28) {
      phase = 'First Quarter';
      illumination = 50;
    } else if (normPhase >= 0.28 && normPhase < 0.47) {
      phase = 'Waxing Gibbous';
      illumination = Math.round(50 + (normPhase - 0.28) * 263);
    } else if (normPhase >= 0.47 && normPhase < 0.53) {
      phase = 'Full Moon';
      illumination = 100;
    } else if (normPhase >= 0.53 && normPhase < 0.72) {
      phase = 'Waning Gibbous';
      illumination = Math.round(100 - (normPhase - 0.53) * 263);
    } else if (normPhase >= 0.72 && normPhase < 0.78) {
      phase = 'Third Quarter';
      illumination = 50;
    } else {
      phase = 'Waning Crescent';
      illumination = Math.round(50 - (normPhase - 0.78) * 263);
    }

    return { phase, illumination: Math.min(100, Math.max(0, illumination)) };
  }

  // Simulated Marathi Panchang based on day of year
  private calculateSimulatedPanchang(date: Date): RegionalData['panchang'] {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24));
    
    const tithis = [
      'Prathama (Shukla Paksha)', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
      'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi',
      'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima (Full Moon)',
      'Prathama (Krishna Paksha)', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
      'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi',
      'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya (New Moon)'
    ];

    const nakshatras = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
      'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];

    const yogas = [
      'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
      'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vridhi', 'Dhruva', 'Vyaghata',
      'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
      'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
    ];

    const karanas = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];

    return {
      tithi: tithis[dayOfYear % 30],
      nakshatra: nakshatras[dayOfYear % 27],
      yoga: yogas[dayOfYear % 27],
      karana: karanas[dayOfYear % 7],
      sunrise: '06:03 AM',
      sunset: '07:05 PM',
      rahu_kaal: '01:30 PM - 03:00 PM',
    };
  }

  // Simulated Hijri Date Converter (Approximated tabular converter)
  private calculateSimulatedHijri(date: Date): RegionalData['hijri'] {
    // 2026-07-02 Greg ≈ 1448-01-17 Muharram (Base Offset approximation)
    const baseGreg = new Date('2026-01-01').getTime();
    const msDiff = date.getTime() - baseGreg;
    const daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));
    
    // Islamic Lunar Year is approx 354.367 days
    // 2026-01-01 is roughly Rajab 11, 1447
    // Total Hijri days since Rajab 11, 1447
    const totalHijriDays = 11 + 177 + daysDiff; // approx offset days
    
    let year = 1447 + Math.floor(totalHijriDays / 354);
    let dayRemainder = totalHijriDays % 354;
    
    // Deduce month (29/30 day cycle alternating)
    const monthDays = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
    let monthNum = 7; // Starting Rajab (7th month)
    let day = 0;
    
    // Cycle months
    for (let i = 0; i < 24; i++) {
      const idx = (monthNum - 1) % 12;
      const daysInM = monthDays[idx];
      if (dayRemainder < daysInM) {
        day = dayRemainder + 1;
        break;
      }
      dayRemainder -= daysInM;
      monthNum++;
      if (monthNum > 12) {
        monthNum = 1;
      }
    }

    const month = this.getHijriMonthName(monthNum);

    return {
      day,
      month,
      monthAr: '',
      monthNum,
      year,
    };
  }

  // Get all holidays
  async getAllHolidays(): Promise<any[]> {
    const { data, error } = await supabase
      .from('holidays')
      .select('*, holiday_categories(name)')
      .eq('status', 'active')
      .order('date', { ascending: true });
    if (error) throw error;
    return data;
  }

  // Create holiday
  async createHoliday(data: any): Promise<any> {
    const { data: result, error } = await supabase
      .from('holidays')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  // Update holiday
  async updateHoliday(id: string, updates: any): Promise<any> {
    const { data: result, error } = await supabase
      .from('holidays')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  // Delete holiday (soft delete)
  async deleteHoliday(id: string): Promise<void> {
    const { error } = await supabase
      .from('holidays')
      .update({ status: 'inactive', deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }

  // Get all festivals
  async getAllFestivals(): Promise<any[]> {
    const { data, error } = await supabase
      .from('festivals')
      .select('*')
      .eq('status', 'active')
      .order('date', { ascending: true });
    if (error) throw error;
    return data;
  }

  // Create festival
  async createFestival(data: any): Promise<any> {
    const { data: result, error } = await supabase
      .from('festivals')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  // Update festival
  async updateFestival(id: string, updates: any): Promise<any> {
    const { data: result, error } = await supabase
      .from('festivals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  // Delete festival (soft delete)
  async deleteFestival(id: string): Promise<void> {
    const { error } = await supabase
      .from('festivals')
      .update({ status: 'inactive', deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }

  // Get holiday categories
  async getHolidayCategories(): Promise<any[]> {
    const { data, error } = await supabase
      .from('holiday_categories')
      .select('*')
      .eq('status', 'active');
    if (error) throw error;
    return data;
  }

  private getHijriMonthName(monthNum: number): string {
    const months = [
      'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal',
      'Jumada al-Thani', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];
    return months[(monthNum - 1) % 12];
  }
}

export const calendarService = new CalendarService();
