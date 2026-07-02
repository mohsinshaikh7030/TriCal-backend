
import supabase from '../config/supabaseClient'

class DashboardService {
    async getStats() {
        const { count: userCount, error: userError } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: blogCount, error: blogError } = await supabase.from('blogs').select('*', { count: 'exact', head: true });
        const { count: festivalCount, error: festivalError } = await supabase.from('festivals').select('*', { count: 'exact', head: true });
        const { count: holidayCount, error: holidayError } = await supabase.from('holidays').select('*', { count: 'exact', head: true });

        return {
            userCount: userError ? 0 : userCount,
            blogCount: blogError ? 0 : blogCount,
            festivalCount: festivalError ? 0 : festivalCount,
            holidayCount: holidayError ? 0 : holidayCount,
            calendarEventCount: 0,
        };
    }
}

export const dashboardService = new DashboardService();
