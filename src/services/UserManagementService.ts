
import supabase from '../config/supabaseClient'
import { ApiError } from '../utils/ApiError'

class UserManagementService {
    async getAllUsers() {
        // 1. Fetch profiles
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                role:roles(name),
                status,
                created_at
            `);

        if (profileError) {
            throw new ApiError(500, "Failed to fetch user profiles: " + profileError.message);
        }

        // 2. Fetch auth users
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.error('Failed to list auth users:', authError.message);
        }

        const authUsers = authData?.users || [];

        // 3. Merge profiles and auth users
        return (profiles || []).map((profile: any) => {
            const authUser = authUsers.find((u: any) => u.id === profile.id);
            return {
                id: profile.id,
                full_name: profile.full_name,
                email: { email: authUser?.email || 'N/A' },
                role: { name: Array.isArray(profile.role) ? (profile.role[0]?.name || 'Viewer') : (profile.role as any)?.name || 'Viewer' },
                status: profile.status,
                created_at: profile.created_at
            };
        });
    }

    async createUser(userData: any) {
        const { error } = await supabase.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true, // Mark email as confirmed since admin is creating it
            user_metadata: {
                full_name: userData.full_name
            }
        });
        if (error) {
            throw new ApiError(error.status || 500, error.message);
        }
        return { message: "User created successfully" };
    }

    async updateUserRole(userId: string, roleId: string) {
        const { data, error } = await supabase.from('profiles').update({ role_id: roleId }).eq('id', userId).select().single();
        if (error) {
            throw new ApiError(400, 'Failed to update user role.');
        }
        return data;
    }

    async toggleUserStatus(userId: string, status: 'active' | 'inactive') {
        const { data, error } = await supabase.from('profiles').update({ status }).eq('id', userId).select().single();
        if (error) {
            throw new ApiError(400, 'Failed to update user status.');
        }
        return data;
    }

    async deleteUser(userId: string) {
        const { error } = await supabase.auth.admin.deleteUser(userId);
        if (error) {
            throw new ApiError(error.status || 500, error.message);
        }
    }

    async resendVerificationEmail(email: string) {
        const { error } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
        });

        if (error) {
            throw new ApiError(error.status || 500, "Failed to generate verification link.");
        }
        // Supabase sends the email automatically
        return { message: 'Verification email sent successfully.' };
    }
}

export const userManagementService = new UserManagementService();
